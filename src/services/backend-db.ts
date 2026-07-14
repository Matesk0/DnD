import * as fs from 'fs';
import * as path from 'path';
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

export function getDb(): DbSchema {
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
    console.error('Failed to read database file, falling back to static/in-memory:', error);
  }

  // Initialize and write database file if it doesn't exist
  inMemoryDb = JSON.parse(JSON.stringify(defaultDb));
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write initial database file:', error);
  }

  return inMemoryDb!;
}

export function saveDb(db: DbSchema) {
  inMemoryDb = db;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
  }
}
