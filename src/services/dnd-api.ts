import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

// ────────────────────────────────────────────────────────────────────────────
// SUPABASE BACKEND ONLY API CLIENT
// ────────────────────────────────────────────────────────────────────────────

export const dndApi = {
  fetchCollection: async (type: string): Promise<DndListItem[]> => {
    const response = await fetch(`${BASE_URL}/api/${type}`);
    if (!response.ok) {
      throw new Error(`[dndApi] Failed to fetch collection '${type}' from backend: status ${response.status}`);
    }
    return response.json();
  },

  fetchDetails: async (type: string, index: string): Promise<any> => {
    const response = await fetch(`${BASE_URL}/api/${type}/${index}`);
    if (!response.ok) {
      throw new Error(`[dndApi] Failed to fetch details for '${type}/${index}' from backend: status ${response.status}`);
    }
    return response.json();
  },

  getSpells: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('spells');
  },

  getSpellDetails: async (index: string): Promise<SpellDetails> => {
    return dndApi.fetchDetails('spells', index);
  },

  getMonsters: async (): Promise<DndListItem[]> => {
    // Monsters bestiary has been archived offline in this design, return empty list
    return Promise.resolve([]);
  },

  getMonsterDetails: async (index: string): Promise<any> => {
    return Promise.reject(new Error(`Monster bestiary has been archived offline.`));
  },

  getClasses: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('classes');
  },

  getClassDetails: async (index: string): Promise<ClassDetails> => {
    return dndApi.fetchDetails('classes', index);
  },

  getRaces: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('races');
  },

  getRaceDetails: async (index: string): Promise<RaceDetails> => {
    return dndApi.fetchDetails('races', index);
  },

  getBackgrounds: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('backgrounds');
  },

  getBackgroundDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('backgrounds', index);
  },

  getFeats: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('feats');
  },

  getFeatDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('feats', index);
  },

  getEquipment: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('equipment');
  },

  getEquipmentDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('equipment', index);
  },

  getMagicItems: async (): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('magic-items');
  },

  getMagicItemDetails: async (index: string): Promise<any> => {
    return dndApi.fetchDetails('magic-items', index);
  },
};
