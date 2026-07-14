import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  EXPANDED_SPELLS,
  EXPANDED_RACES,
  EXPANDED_CLASSES,
  EXPANDED_BACKGROUNDS,
  EXPANDED_FEATS,
  EXPANDED_EQUIPMENT,
  EXPANDED_MAGIC_ITEMS,
} from './dnd-static-data';

export interface DndListItem {
  index: string;
  name: string;
  url?: string;
  level?: number; // for spells
}

export interface SpellDetails {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: { name: string };
  classes: { name: string }[];
}

export interface MonsterDetails {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { type: string; value: number }[];
  hit_points: number;
  hit_dice: string;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: number;
  xp: number;
  actions?: { name: string; desc: string }[];
  special_abilities?: { name: string; desc: string }[];
}

export interface ClassDetails {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: { choose: number; type: string; from: { options: { item: { name: string } }[] } }[];
  proficiencies: { name: string }[];
  saving_throws: { name: string }[];
  subclasses?: { name: string }[];
}

export interface RaceDetails {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: { ability_score: { name: string }; bonus: number }[];
  alignment: string;
  age: string;
  size: string;
  language_desc: string;
  languages: { name: string }[];
  traits: { name: string }[];
}

// ────────────────────────────────────────────────────────────────────────────
// BASE URL RESOLVER FOR LOCAL API BACKEND
// ────────────────────────────────────────────────────────────────────────────

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }
  // Native mobile requires resolving the packager IP address
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8081`;
  }
  return 'http://localhost:8081';
};

const BASE_URL = getBaseUrl();

// Helper to convert data record to List Items
function toList(data: Record<string, any>): DndListItem[] {
  return Object.values(data).map((item) => ({
    index: item.index,
    name: item.name,
    level: item.level,
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// BACKEND API CLIENT WITH STATIC FALLBACKS
// ────────────────────────────────────────────────────────────────────────────

export const dndApi = {
  // Generic fetch wrapper with fallback
  fetchCollection: async (type: string, staticData: Record<string, any>): Promise<DndListItem[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/${type}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn(`[dndApi] API call failed for '${type}'. Falling back to local static data.`, e);
    }
    return toList(staticData);
  },

  fetchDetails: async (type: string, index: string, staticData: Record<string, any>): Promise<any> => {
    try {
      const response = await fetch(`${BASE_URL}/api/${type}/${index}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn(`[dndApi] API details call failed for '${type}/${index}'. Falling back to local static details.`, e);
    }
    const item = staticData[index];
    if (!item) return Promise.reject(new Error(`Item '${index}' not found in static ${type}`));
    return item;
  },

  getSpells: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('spells', EXPANDED_SPELLS);
  },

  getSpellDetails: async (index: string): Promise<SpellDetails> => {
    return dndApi.fetchDetails('spells', index, EXPANDED_SPELLS);
  },

  getMonsters: async (): Promise<DndListItem[]> => {
    // Monsters bestiary has been archived offline in this design, return empty list
    return Promise.resolve([]);
  },

  getMonsterDetails: async (index: string): Promise<any> => {
    return Promise.reject(new Error(`Monster bestiary has been archived offline.`));
  },

  getClasses: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('classes', EXPANDED_CLASSES);
  },

  getClassDetails: async (index: string): Promise<ClassDetails> => {
    return dndApi.fetchDetails('classes', index, EXPANDED_CLASSES);
  },

  getRaces: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('races', EXPANDED_RACES);
  },

  getRaceDetails: async (index: string): Promise<RaceDetails> => {
    return dndApi.fetchDetails('races', index, EXPANDED_RACES);
  },

  getBackgrounds: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('backgrounds', EXPANDED_BACKGROUNDS);
  },

  getBackgroundDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('backgrounds', index, EXPANDED_BACKGROUNDS);
  },

  getFeats: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('feats', EXPANDED_FEATS);
  },

  getFeatDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('feats', index, EXPANDED_FEATS);
  },

  getEquipment: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('equipment', EXPANDED_EQUIPMENT);
  },

  getEquipmentDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('equipment', index, EXPANDED_EQUIPMENT);
  },

  getMagicItems: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('magic-items', EXPANDED_MAGIC_ITEMS);
  },

  getMagicItemDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('magic-items', index, EXPANDED_MAGIC_ITEMS);
  },
};
