import { createSupabaseContext } from '@supabase/server';
import {
  getLocalDb,
  getLocalCollection,
  saveLocalDb,
  fetchFromSupabase,
  upsertToSupabase,
} from '../../services/backend-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: Request, { type }: { type: string }) {
  // Try retrieving from Supabase server context first
  try {
    const { data: ctx } = await createSupabaseContext(request, { auth: 'publishable' });
    if (ctx?.supabase) {
      const supabaseData = await fetchFromSupabase(type, ctx.supabase);
      if (supabaseData) {
        const list = supabaseData.map((item: any) => ({
          index: item.index,
          name: item.name,
          level: item.level,
        }));
        return Response.json(list, { headers: corsHeaders });
      }
    }
  } catch (err) {
    console.warn('[API] Supabase context creation failed, falling back to local DB:', err);
  }

  // Fallback to local file-based database
  const localCollection = getLocalCollection(type);
  const list = Object.values(localCollection).map((item: any) => ({
    index: item.index,
    name: item.name,
    level: item.level,
  }));
  
  return Response.json(list, { headers: corsHeaders });
}

export async function POST(request: Request, { type }: { type: string }) {
  try {
    const item = await request.json();
    if (!item.index || !item.name) {
      return Response.json(
        { error: 'Index and name are required' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Try saving to Supabase first
    try {
      const { data: ctx } = await createSupabaseContext(request, { auth: 'publishable' });
      if (ctx?.supabase) {
        const success = await upsertToSupabase(type, item, ctx.supabase);
        if (success) {
          return Response.json(item, { status: 201, headers: corsHeaders });
        }
      }
    } catch (err) {
      console.warn('[API] Supabase context save failed, writing to local DB:', err);
    }

    // Write to local database as fallback
    const db = getLocalDb();
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';
    
    const collection = db[normType as keyof typeof db];
    if (collection) {
      collection[item.index] = item;
      saveLocalDb(db);
    }
    
    return Response.json(item, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
