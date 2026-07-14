import { createSupabaseContext } from '@supabase/server';
import {
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
  try {
    const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
    if (authError || !ctx?.supabase) {
      return Response.json(
        { error: authError?.message || 'Unauthorized context' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseData = await fetchFromSupabase(type, ctx.supabase);
    const item = supabaseData.find((i: any) => i.index === index);
    if (!item) {
      return Response.json(
        { error: `Item '${index}' not found in '${type}'` },
        { status: 404, headers: corsHeaders }
      );
    }
    
    return Response.json(item, { headers: corsHeaders });
  } catch (err: any) {
    return Response.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  try {
    const item = await request.json();
    
    const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
    if (authError || !ctx?.supabase) {
      return Response.json(
        { error: authError?.message || 'Unauthorized context' },
        { status: 401, headers: corsHeaders }
      );
    }

    await upsertToSupabase(type, { ...item, index }, ctx.supabase);
    
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
  try {
    const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
    if (authError || !ctx?.supabase) {
      return Response.json(
        { error: authError?.message || 'Unauthorized context' },
        { status: 401, headers: corsHeaders }
      );
    }

    await deleteFromSupabase(type, index, ctx.supabase);
    
    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
