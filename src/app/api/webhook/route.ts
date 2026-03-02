import { NextRequest, NextResponse } from "next/server";
import { generateWhatsAppResponse } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. WhatsApp Webhook Verification / Message Extraction logic
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

        // 4. Send the message back via Meta API
        const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
        const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

        if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
            await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phoneNum,
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

// Verification for Meta Webhook Setup (Handshake)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    console.log("Meta verification request:", { mode, token });

    // Hardcoding the token to guarantee a match against Meta's request
    const VERIFY_TOKEN = "sustainable_ai_token";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        return new Response(challenge, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    }

    console.error("Verification failed. Expected 'sustainable_ai_token', got:", token);
    return new Response("Forbidden", { status: 403 });
}
