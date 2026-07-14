// ────────────────────────────────────────────────────────────────────────────
// SUPABASE BACKEND ONLY OPERATIONS (NO LOCAL FALLBACKS)
// ────────────────────────────────────────────────────────────────────────────

export async function fetchFromSupabase(type: string, supabaseClient: any): Promise<any[]> {
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';

  const { data, error } = await supabaseClient
    .from(normType)
    .select('*');

  if (error) {
    throw new Error(`[Supabase] Error reading table '${normType}': ${error.message}`);
  }
  
  return data || [];
}

export async function upsertToSupabase(type: string, item: any, supabaseClient: any): Promise<void> {
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';

  const { error } = await supabaseClient
    .from(normType)
    .upsert(item);

  if (error) {
    throw new Error(`[Supabase] Failed to upsert to '${normType}': ${error.message}`);
  }
}

export async function deleteFromSupabase(type: string, index: string, supabaseClient: any): Promise<void> {
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';

  const { error } = await supabaseClient
    .from(normType)
    .delete()
    .eq('index', index);

  if (error) {
    throw new Error(`[Supabase] Failed to delete from '${normType}': ${error.message}`);
  }
}
