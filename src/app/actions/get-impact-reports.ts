import { supabase } from "@/lib/supabase";

export async function getImpactReports() {
    const { data, error } = await supabase
        .from("impact_reports")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Supabase error fetching impact reports:", error);
        return [];
    }

    return data;
}
