"use server";

import { generateImpactReport } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createImpactReport(formData: FormData) {
    const orderItems = formData.get("orderItems") as string;
    const sourcingInfo = formData.get("sourcingInfo") as string;

    if (!orderItems) {
        throw new Error("Order items are required");
    }

    // 1. Generate Impact Report via AI
    const report = await generateImpactReport(orderItems, sourcingInfo);

    // 2. Save to Supabase
    const { data, error } = await supabase
        .from("impact_reports")
        .insert([
            {
                order_items: orderItems,
                sourcing_info: sourcingInfo,
                estimated_plastic_saved_kg: report.estimated_plastic_saved_kg,
                estimated_carbon_avoided_kg: report.estimated_carbon_avoided_kg,
                calculation_logic: report.calculation_logic,
                local_sourcing_summary: report.local_sourcing_impact_summary,
                impact_statement: report.human_readable_impact_statement,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase error saving impact report:", error);
        throw new Error("Failed to save impact report to database");
    }

    revalidatePath("/");
    return data[0];
}
