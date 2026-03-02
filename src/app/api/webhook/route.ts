import { NextRequest, NextResponse } from "next/server";
import { generateWhatsAppResponse } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. WhatsApp Webhook Verification / Message Extraction logic
        // Following the structure provided in the requirement
        if (!body.entry || !body.entry[0].changes[0].value.messages) {
            return NextResponse.json({ status: "ignored" }, { status: 200 });
        }

        const message = body.entry[0].changes[0].value.messages[0];
        const customerText = message.text?.body;
        const phoneNum = message.from;

        if (!customerText) {
            return NextResponse.json({ status: "no_text" }, { status: 200 });
        }

        // 2. Call Gemini with Structured JSON Output
        // Using our existing library helper which is already grounded in business logic
        const aiResponse = await generateWhatsAppResponse(customerText);

        // 3. Log to Supabase (ai_logs and whatsapp_chats)
        await supabase.from("ai_logs").insert([
            {
                module_name: "WhatsApp Webhook",
                user_prompt: customerText,
                ai_response: aiResponse,
            }
        ]);

        await supabase.from("whatsapp_chats").insert([
            {
                phone_number: phoneNum,
                customer_message: customerText,
                ai_intent: aiResponse.intent_category,
                needs_escalation: aiResponse.needs_escalation,
                ai_reply: aiResponse.whatsapp_reply,
            }
        ]);

        // 4. Send Message back via Meta API
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (accessToken && phoneNumberId) {
            await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phoneNum,
                    type: "text",
                    text: { body: aiResponse.whatsapp_reply },
                }),
            });
        }

        return NextResponse.json({ status: "success", reply: aiResponse.whatsapp_reply });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Verification for Meta Webhook Setup
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Replace 'YOUR_VERIFY_TOKEN' with whatever you set in Meta Dashboard
    if (mode === "subscribe" && token === "AI_COMMERCE_TOKEN") {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}
