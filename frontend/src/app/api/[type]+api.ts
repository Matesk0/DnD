import { createSupabaseContext } from '@supabase/server';
import { fetchFromSupabase, upsertToSupabase } from '../../services/backend-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: Request, { type }: { type: string }) {
  try {
    const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
    if (authError || !ctx?.supabase) {
      return Response.json(
        { error: authError?.message || 'Unauthorized context' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseData = await fetchFromSupabase(type, ctx.supabase);
    const list = supabaseData.map((item: any) => ({
      index: item.index,
      name: item.name,
      level: item.level,
    }));
    
    return Response.json(list, { headers: corsHeaders });
  } catch (err: any) {
    return Response.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
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
    
    const { data: ctx, error: authError } = await createSupabaseContext(request, { auth: 'publishable' });
    if (authError || !ctx?.supabase) {
      return Response.json(
        { error: authError?.message || 'Unauthorized context' },
        { status: 401, headers: corsHeaders }
      );
    }

    await upsertToSupabase(type, item, ctx.supabase);
    
    return Response.json(item, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
