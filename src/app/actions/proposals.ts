"use server";

import { generateProposal } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createProposal(formData: FormData) {
    const clientRequest = formData.get("clientRequest") as string;
    const budgetLimit = parseFloat(formData.get("budgetLimit") as string);

    if (!clientRequest || isNaN(budgetLimit)) {
        throw new Error("Client request and budget limit are required");
    }

    // 1. Generate Proposal via AI
    const proposal = await generateProposal(clientRequest, budgetLimit);

    // 2. Log to ai_logs (Requirement)
    await supabase.from("ai_logs").insert([
        {
            module_name: "Proposal Strategist",
            user_prompt: `Client Request: ${clientRequest}\nBudget Limit: $${budgetLimit}`,
            ai_response: proposal,
        }
    ]);

    // 3. Save to Supabase
    const { data, error } = await supabase
        .from("proposals")
        .insert([
            {
                title: proposal.proposal_title,
                client_request: clientRequest,
                budget_limit: budgetLimit,
                suggested_product_mix: proposal.suggested_product_mix,
                total_estimated_cost: proposal.total_estimated_cost,
                impact_summary: proposal.impact_positioning_summary,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase error saving proposal:", error);
        throw new Error("Failed to save proposal to database");
    }

    revalidatePath("/");
    return data[0];
}
