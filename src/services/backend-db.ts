import * as fs from 'fs';
import * as path from 'path';
import { createSupabaseContext } from '@supabase/server';
import {
  EXPANDED_SPELLS,
  EXPANDED_RACES,
  EXPANDED_CLASSES,
  EXPANDED_BACKGROUNDS,
  EXPANDED_FEATS,
  EXPANDED_EQUIPMENT,
  EXPANDED_MAGIC_ITEMS,
} from './dnd-static-data';

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'services', 'backend-db.json');

interface DbSchema {
  spells: Record<string, any>;
  races: Record<string, any>;
  classes: Record<string, any>;
  backgrounds: Record<string, any>;
  feats: Record<string, any>;
  equipment: Record<string, any>;
  magic_items: Record<string, any>;
}

const defaultDb: DbSchema = {
  spells: EXPANDED_SPELLS,
  races: EXPANDED_RACES,
  classes: EXPANDED_CLASSES,
  backgrounds: EXPANDED_BACKGROUNDS,
  feats: EXPANDED_FEATS,
  equipment: EXPANDED_EQUIPMENT,
  magic_items: EXPANDED_MAGIC_ITEMS,
};

let inMemoryDb: DbSchema | null = null;

// ────────────────────────────────────────────────────────────────────────────
// LOCAL FILE-BASED BACKEND OPERATIONS
// ────────────────────────────────────────────────────────────────────────────

export function getLocalDb(): DbSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(fileContent);
      return inMemoryDb!;
    }
  } catch (error) {
    console.error('Failed to read local database file, falling back to static:', error);
  }

  inMemoryDb = JSON.parse(JSON.stringify(defaultDb));
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write initial local database file:', error);
  }

  return inMemoryDb!;
}

export function saveLocalDb(db: DbSchema) {
  inMemoryDb = db;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local database file:', error);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SUPABASE BACKEND SYNCHRONIZATION HELPERS
// ────────────────────────────────────────────────────────────────────────────

export async function fetchFromSupabase(type: string, supabaseClient: any): Promise<any[] | null> {
  try {
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';

    const { data, error } = await supabaseClient
      .from(normType)
      .select('*');

    if (error) {
      console.warn(`[Supabase] Error reading table '${normType}':`, error.message);
      return null;
    }

    // Auto-seed empty tables with our expanded dataset
    if (data && data.length === 0) {
      console.info(`[Supabase] Table '${normType}' is empty. Seeding with expanded dataset...`);
      const localCollection = getLocalCollection(type);
      const itemsToInsert = Object.values(localCollection);
      
      const { error: seedError } = await supabaseClient
        .from(normType)
        .insert(itemsToInsert);

      if (seedError) {
        console.warn(`[Supabase] Failed to seed table '${normType}':`, seedError.message);
      } else {
        console.info(`[Supabase] Successfully seeded table '${normType}'.`);
        return itemsToInsert;
      }
    }

    return data;
  } catch (err: any) {
    console.warn(`[Supabase] Network or connection error:`, err.message || err);
    return null;
  }
}

export async function upsertToSupabase(type: string, item: any, supabaseClient: any): Promise<boolean> {
  try {
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';

    const { error } = await supabaseClient
      .from(normType)
      .upsert(item);

    if (error) {
      console.warn(`[Supabase] Failed to upsert to '${normType}':`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Network error during upsert:`, err.message || err);
    return false;
  }
}

export async function deleteFromSupabase(type: string, index: string, supabaseClient: any): Promise<boolean> {
  try {
    let normType = type;
    if (type === 'magic-items') normType = 'magic_items';

    const { error } = await supabaseClient
      .from(normType)
      .delete()
      .eq('index', index);

    if (error) {
      console.warn(`[Supabase] Failed to delete from '${normType}':`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Network error during delete:`, err.message || err);
    return false;
  }
}

// Helper to get local collection
export function getLocalCollection(type: string): Record<string, any> {
  const db = getLocalDb();
  let normType = type;
  if (type === 'magic-items') normType = 'magic_items';
  return db[normType as keyof DbSchema] || {};
}
