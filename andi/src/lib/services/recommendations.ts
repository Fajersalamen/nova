import { supabase } from "@/lib/supabase/client";

// Deliberately simple, per spec ("لا تبالغ في الـAI"): look at the user's
// last few searches, pull the categories they searched in, and surface a
// few more items from those same categories they haven't seen as favorites
// yet. This is the whole algorithm — swappable later for a real ranking
// model without changing the call site (`getRecommendedItemIds`).
export async function recordSearch(userId: string, query: string | null, categoryId: number | null) {
  await supabase.from("search_history").insert({ user_id: userId, query, category_id: categoryId });
}

export async function getRecommendedCategoryIds(userId: string): Promise<number[]> {
  const { data } = await supabase
    .from("search_history")
    .select("category_id")
    .eq("user_id", userId)
    .not("category_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!data || data.length === 0) return [];

  const counts = new Map<number, number>();
  for (const row of data) {
    if (row.category_id == null) continue;
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}
