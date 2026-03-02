"use server";

import { generateWhatsAppResponse } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function processWhatsAppMessage(formData: FormData) {
    const message = formData.get("message") as string;
    const orderContextStr = formData.get("context") as string;
    let orderContext = null;

    try {
        if (orderContextStr) {
            orderContext = JSON.parse(orderContextStr);
        }
    } catch (e) {
        console.error("Failed to parse order context:", e);
    }

    if (!message) {
        throw new Error("Message is required");
    }

    // 1. Generate Response via AI
    const response = await generateWhatsAppResponse(message, orderContext);

    // 2. Log to ai_logs (Requirement)
    await supabase.from("ai_logs").insert([
        {
            module_name: "WhatsApp Support Bot",
            user_prompt: `Customer Message: ${message}\nContext: ${JSON.stringify(orderContext)}`,
            ai_response: response,
        }
    ]);

    // 3. Save to whatsapp_chats (Requirement)
    const { data, error } = await supabase
        .from("whatsapp_chats")
        .insert([
            {
                phone_number: "SYSTEM_SIMULATOR", // Placeholder for simulator
                customer_message: message,
                ai_intent: response.intent_category,
                extracted_order_id: response.extracted_order_id || null,
                needs_escalation: response.needs_escalation,
                ai_reply: response.whatsapp_reply,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase error saving whatsapp chat:", error);
        throw new Error("Failed to save support log to database");
    }

    // 3. (Optional/Future) Call Meta API to send the actual message
    // For the purpose of this simulation/MVP, we've successfully generated the response and logged it.

    revalidatePath("/");
    return data[0];
}

export async function getSupportLogs() {
    const { data, error } = await supabase
        .from("whatsapp_chats")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error fetching whatsapp chats:", error);
        return [];
    }

    return data;
}

export async function clearSupportLogs() {
    const { error } = await supabase
        .from("whatsapp_chats")
        .delete()
        .neq("id", 0);

    if (error) {
        console.error("Supabase error clearing whatsapp chats:", error);
        throw new Error("Failed to clear support logs");
    }

    revalidatePath("/");
}
