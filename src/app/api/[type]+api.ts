import { getDb, saveDb } from '../../services/backend-db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: Request, { type }: { type: string }) {
  const db = getDb();
  
  // Normalize collection name
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';
  
  const collection = db[normType as keyof typeof db];
  
  if (!collection) {
    return Response.json(
      { error: `Collection '${type}' not found` },
      { status: 404, headers: corsHeaders }
    );
  }
  
  // Return the items converted to list item format
  const list = Object.values(collection).map((item: any) => ({
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
    
    // Add to collection
    collection[item.index] = item;
    saveDb(db);
    
    return Response.json(item, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
