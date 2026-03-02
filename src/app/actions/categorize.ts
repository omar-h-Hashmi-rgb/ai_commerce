"use server";

import { categorizeProduct } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || !description) {
        throw new Error("Name and description are required");
    }

    // 1. Get AI Categorization
    const aiResult = await categorizeProduct(name, description);

    // 2. Log to ai_logs (Requirement)
    await supabase.from("ai_logs").insert([
        {
            module_name: "Catalog Intelligence",
            user_prompt: `Product Name: ${name}\nDescription: ${description}`,
            ai_response: aiResult,
        }
    ]);

    // 3. Save to Supabase
    const { data, error } = await supabase
        .from("products")
        .insert([
            {
                name,
                description,
                primary_category: aiResult.primary_category,
                sub_category: aiResult.sub_category,
                seo_tags: aiResult.seo_tags,
                sustainability_filters: aiResult.sustainability_filters,
            },
        ])
        .select();

    if (error) {
        console.error("Supabase error:", error);
        throw new Error("Failed to save product to database");
    }

    revalidatePath("/");
    return data[0];
}
