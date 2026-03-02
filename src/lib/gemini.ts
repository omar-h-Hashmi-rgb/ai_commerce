import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// We use 'any' casting for the underlying schema objects to bypass strict SDK type definitions 
// that sometimes incorrectly require the 'format' property for enums or nested objects.
// Functionally, the Gemini API handles these structures correctly.

export const CATEGORIZATION_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    primary_category: {
      type: SchemaType.STRING,
      description: "Must be one of the predefined categories.",
      // @ts-ignore
      enum: ["Packaging", "Office Supplies", "Apparel", "Food & Beverage", "Cleaning Products", "Technology"]
    },
    sub_category: {
      type: SchemaType.STRING,
      description: "A specific, logical grouping under the primary category."
    },
    seo_tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "5 to 10 relevant B2B SEO tags."
    },
    sustainability_filters: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Applicable sustainability filters based on the rules."
    }
  },
  required: ["primary_category", "sub_category", "seo_tags", "sustainability_filters"]
} as any;

export const PROPOSAL_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    proposal_title: {
      type: SchemaType.STRING,
      description: "A professional title for the B2B proposal."
    },
    suggested_product_mix: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          product_name: { type: SchemaType.STRING },
          justification: {
            type: SchemaType.STRING,
            description: "A short reason why this specific product fits the client's sustainability goals."
          },
          quantity: { type: SchemaType.INTEGER },
          unit_price: { type: SchemaType.NUMBER },
          total_line_cost: {
            type: SchemaType.NUMBER,
            description: "Must perfectly equal quantity * unit_price."
          }
        },
        required: ["product_name", "justification", "quantity", "unit_price", "total_line_cost"]
      }
    },
    total_estimated_cost: {
      type: SchemaType.NUMBER,
      description: "The sum of all total_line_costs. MUST NOT exceed the client budget."
    },
    impact_positioning_summary: {
      type: SchemaType.STRING,
      description: "A persuasive paragraph highlighting the environmental benefits of this specific proposal."
    }
  },
  required: ["proposal_title", "suggested_product_mix", "total_estimated_cost", "impact_positioning_summary"]
} as any;

export const IMPACT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    estimated_plastic_saved_kg: {
      type: SchemaType.NUMBER,
      description: "The calculated total kilograms of plastic saved by this order."
    },
    estimated_carbon_avoided_kg: {
      type: SchemaType.NUMBER,
      description: "The calculated total kilograms of CO2 avoided."
    },
    calculation_logic: {
      type: SchemaType.STRING,
      description: "A brief explanation of the math used (e.g., '500 cups * 10g plastic/cup = 5kg')."
    },
    local_sourcing_impact_summary: {
      type: SchemaType.STRING,
      description: "A short summary of the emissions saved via local sourcing."
    },
    human_readable_impact_statement: {
      type: SchemaType.STRING,
      description: "A warm, marketing-friendly statement to display on the customer's receipt."
    }
  },
  required: [
    "estimated_plastic_saved_kg",
    "estimated_carbon_avoided_kg",
    "calculation_logic",
    "local_sourcing_impact_summary",
    "human_readable_impact_statement"
  ]
} as any;

export const WHATSAPP_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    intent_category: {
      type: SchemaType.STRING,
      description: "Categorize the user's core intent.",
      // @ts-ignore
      enum: ["order_status", "return_policy", "refund_request", "general_inquiry"]
    },
    extracted_order_id: {
      type: SchemaType.STRING,
      description: "If the user mentions an order number (e.g., ORD-12345), extract it here. Otherwise, leave blank."
    },
    needs_escalation: {
      type: SchemaType.BOOLEAN,
      description: "Set to true ONLY if the user is angry, requests a refund, or needs human intervention."
    },
    whatsapp_reply: {
      type: SchemaType.STRING,
      description: "The exact, natural-language text message to send back to the user."
    }
  },
  required: ["intent_category", "needs_escalation", "whatsapp_reply"]
} as any;

const CATEGORIZATION_SYSTEM_PROMPT = `You are an expert AI Catalog Manager for a sustainable B2B e-commerce platform. Your job is to analyze raw product descriptions and extract structured metadata.

STRICT RULES:
- Primary Category: You MUST choose a primary_category ONLY from this predefined list: ["Packaging", "Office Supplies", "Apparel", "Food & Beverage", "Cleaning Products", "Technology"]. Do not invent new primary categories.
- Sub-Category: Suggest one logical, specific sub-category based on the product.
- SEO Tags: Generate exactly 5 to 10 highly relevant SEO keywords for B2B search.
- Sustainability Filters: Identify applicable filters from this list: ["plastic-free", "compostable", "vegan", "recycled", "organic", "carbon-neutral", "FSC-certified"]. Only include the ones that explicitly apply to the product description.
- Output Format: You must output ONLY valid JSON. Do not include markdown formatting or explanations.`;

const PROPOSAL_SYSTEM_PROMPT = `You are an expert B2B Sales Strategist for a sustainable commerce platform. Your objective is to generate structured, compelling product proposals for corporate clients based on their specific requests and budget limits.

STRICT RULES:
- Budget Adherence: The total_estimated_cost MUST be mathematically accurate and strictly less than or equal to the provided budget limit.
- Product Mix: Suggest realistic, sustainable products that directly address the client's needs.
- Cost Breakdown: For each product, define a logical quantity, a realistic unit price, and calculate the total_line_cost (Quantity * Unit Price).
- Impact Positioning: Write a compelling impact_positioning_summary (2-3 sentences) that explains the environmental ROI (e.g., "By switching to these items, your office will divert X lbs of plastic from landfills...") to help the buyer justify the purchase internally.
- Output Format: You must output ONLY valid JSON. Do not include markdown formatting or explanations.`;

const IMPACT_SYSTEM_PROMPT = `You are an expert Environmental Impact Analyst for a sustainable B2B e-commerce platform. Your job is to analyze a completed customer order and generate a logical, data-driven impact report.

STRICT RULES:
- Baseline Logic: Use standard industry estimates for your math (e.g., a standard single-use plastic water bottle weighs ~10 grams; standard plastic packaging generates ~2.5 kg of CO2 per kg of plastic).
- Estimated Plastic Saved: Calculate the total weight in kilograms of plastic avoided by the customer choosing our sustainable alternatives.
- Carbon Avoided: Estimate the kg of CO2 emissions avoided based on the materials used vs. traditional petroleum-based plastics.
- Local Sourcing: If the prompt mentions the delivery distance or local vendors, write a 1-sentence summary of the logistics impact (e.g., reduced transportation emissions).
- Human-Readable Statement: Write a warm, encouraging 2-sentence impact statement that the customer will see on their order confirmation page.
- Output Format: You must output ONLY valid JSON.`;

const WHATSAPP_SYSTEM_PROMPT = `You are the Tier 1 WhatsApp Support AI for a sustainable B2B e-commerce platform. Your job is to read incoming customer messages and determine the best response.

STRICT RULES:
- Formatting: Write the whatsapp_reply exactly as it should appear on a mobile screen. Keep it concise. Use emojis sparingly. Use WhatsApp bolding (e.g., *Order Status*) if helpful.
- Order Queries: If the user asks about an order, check if database context is provided. If not, politely ask them for their Order ID.
- Return Policy: If asked, state our policy: "We offer a 30-day return window for unused items. We provide carbon-neutral return shipping labels to minimize environmental impact."
- Escalations: If the user mentions "refund," is visibly angry, or asks a complex question you cannot answer, set needs_escalation to true and tell the user a human agent will take over shortly.
- Output Format: You must output ONLY valid JSON.`;

export async function categorizeProduct(name: string, description: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-ignore
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: CATEGORIZATION_SCHEMA,
    },
  });

  const prompt = `Please categorize the following product:
  
Product Name: ${name}
Description: ${description}`;

  const result = await model.generateContent([CATEGORIZATION_SYSTEM_PROMPT, prompt]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini categorization response:", text);
    throw new Error("Invalid AI categorization format");
  }
}

export async function generateProposal(clientRequest: string, budgetLimit: number) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-ignore
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: PROPOSAL_SCHEMA,
    },
  });

  const prompt = `Please generate a B2B proposal based on the following client parameters:

Client Request: ${clientRequest}
Budget Limit: $${budgetLimit}`;

  const result = await model.generateContent([PROPOSAL_SYSTEM_PROMPT, prompt]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini proposal response:", text);
    throw new Error("Invalid AI proposal format");
  }
}

export async function generateImpactReport(orderItems: string, sourcingInfo: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-ignore
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: IMPACT_SCHEMA,
    },
  });

  const prompt = `Please generate an impact report for the following completed order:

Order Items: ${orderItems}
Sourcing Info: ${sourcingInfo}`;

  const result = await model.generateContent([IMPACT_SYSTEM_PROMPT, prompt]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini impact report response:", text);
    throw new Error("Invalid AI impact report format");
  }
}

export async function generateWhatsAppResponse(message: string, context?: any) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-ignore
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: WHATSAPP_SCHEMA,
    },
  });

  const prompt = `Process the following incoming WhatsApp message:

Customer Message: "${message}"

Database Context: ${context ? JSON.stringify(context) : "No context provided."}`;

  const result = await model.generateContent([WHATSAPP_SYSTEM_PROMPT, prompt]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini WhatsApp response:", text);
    throw new Error("Invalid AI WhatsApp format");
  }
}
