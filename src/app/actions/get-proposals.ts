import { supabase } from "@/lib/supabase";

export async function getProposals() {
    const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error fetching proposals:", error);
        return [];
    }

    return data;
}
