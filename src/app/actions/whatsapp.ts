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

    // 2. Save to Supabase
    const { data, error } = await supabase
        .from("support_logs")
        .insert([
            {
                customer_message: message,
                intent_category: response.intent_category,
                extracted_order_id: response.extracted_order_id || null,
                needs_escalation: response.needs_escalation,
                whatsapp_reply: response.whatsapp_reply,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase error saving support log:", error);
        throw new Error("Failed to save support log to database");
    }

    // 3. (Optional/Future) Call Meta API to send the actual message
    // For the purpose of this simulation/MVP, we've successfully generated the response and logged it.

    revalidatePath("/");
    return data[0];
}

export async function getSupportLogs() {
    const { data, error } = await supabase
        .from("support_logs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error fetching support logs:", error);
        return [];
    }

    return data;
}
