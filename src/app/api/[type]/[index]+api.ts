import { createSupabaseContext } from '@supabase/server';
import {
  getLocalDb,
  getLocalCollection,
  saveLocalDb,
  fetchFromSupabase,
  upsertToSupabase,
  deleteFromSupabase,
} from '../../../services/backend-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  // Try retrieving details from Supabase first
  try {
    const { data: ctx } = await createSupabaseContext(request, { auth: 'publishable' });
    if (ctx?.supabase) {
      const supabaseData = await fetchFromSupabase(type, ctx.supabase);
      if (supabaseData) {
        const item = supabaseData.find((i: any) => i.index === index);
        if (item) {
          return Response.json(item, { headers: corsHeaders });
        }
      }
    }
  } catch (err) {
    console.warn('[API] Supabase details retrieval failed, falling back to local DB:', err);
  }

  // Local fallback
  const localCollection = getLocalCollection(type);
  const item = localCollection[index];
  if (!item) {
    return Response.json(
      { error: `Item '${index}' not found in '${type}'` },
      { status: 404, headers: corsHeaders }
    );
  }
  
  return Response.json(item, { headers: corsHeaders });
}

export async function PUT(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  try {
    const item = await request.json();
    
    // Try updating in Supabase first
    try {
      const { data: ctx } = await createSupabaseContext(request, { auth: 'publishable' });
      if (ctx?.supabase) {
        const success = await upsertToSupabase(type, { ...item, index }, ctx.supabase);
        if (success) {
          return Response.json({ ...item, index }, { headers: corsHeaders });
        }
      }
    } catch (err) {
      console.warn('[API] Supabase details update failed, writing to local DB:', err);
    }

    // Local fallback
    const db = getLocalDb();
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';
    
    const collection = db[normType as keyof typeof db];
    if (collection) {
      collection[index] = { ...item, index };
      saveLocalDb(db);
    }
    
    return Response.json({ ...item, index }, { headers: corsHeaders });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  return PUT(request, { type, index });
}

export async function DELETE(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  // Try deleting from Supabase first
  try {
    const { data: ctx } = await createSupabaseContext(request, { auth: 'publishable' });
    if (ctx?.supabase) {
      const success = await deleteFromSupabase(type, index, ctx.supabase);
      if (success) {
        return new Response(null, { status: 204, headers: corsHeaders });
      }
    }
  } catch (err) {
    console.warn('[API] Supabase delete failed, removing from local DB:', err);
  }

  // Local fallback
  const db = getLocalDb();
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';
  
  const collection = db[normType as keyof typeof db];
  if (collection && collection[index]) {
    delete collection[index];
    saveLocalDb(db);
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  return Response.json(
    { error: `Item '${index}' not found in '${type}'` },
    { status: 404, headers: corsHeaders }
  );
}
