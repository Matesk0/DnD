import { getDb, saveDb } from '../../../services/backend-db';

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
  const db = getDb();
  
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';
  
  const collection = db[normType as keyof typeof db];
  if (!collection) {
    return Response.json(
      { error: `Collection '${type}' not found` },
      { status: 404, headers: corsHeaders }
    );
  }
  
  const item = collection[index];
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
    const db = getDb();
    
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';
    
    const collection = db[normType as keyof typeof db];
    if (!collection) {
      return Response.json(
        { error: `Collection '${type}' not found` },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Update (or create) the item
    collection[index] = { ...item, index }; // Ensure index matches
    saveDb(db);
    
    return Response.json(collection[index], { headers: corsHeaders });
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
  // Support POST as alternative to PUT for wider compatibility
  return PUT(request, { type, index });
}

export async function DELETE(
  request: Request,
  { type, index }: { type: string; index: string }
) {
  const db = getDb();
  
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';
  
  const collection = db[normType as keyof typeof db];
  if (!collection) {
    return Response.json(
      { error: `Collection '${type}' not found` },
      { status: 404, headers: corsHeaders }
    );
  }
  
  if (!collection[index]) {
    return Response.json(
      { error: `Item '${index}' not found in '${type}'` },
      { status: 404, headers: corsHeaders }
    );
  }
  
  delete collection[index];
  saveDb(db);
  
  return new Response(null, { status: 204, headers: corsHeaders });
}
