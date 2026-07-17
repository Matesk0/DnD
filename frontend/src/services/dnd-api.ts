import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  DndListItem,
  SpellDetails,
  MonsterDetails,
  ClassDetails,
  RaceDetails,
} from '@shared/types';

export {
  DndListItem,
  SpellDetails,
  MonsterDetails,
  ClassDetails,
  RaceDetails,
};

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
  fetchCollection: async (type: string, ruleset: string = '5e'): Promise<DndListItem[]> => {
    const apiType = ruleset === '5e' ? type : `${ruleset}_${type}`;
    const response = await fetch(`${BASE_URL}/api/${apiType}`);
    if (!response.ok) {
      throw new Error(`[dndApi] Failed to fetch collection '${apiType}' from backend: status ${response.status}`);
    }
    return response.json();
  },

  fetchDetails: async (type: string, index: string, ruleset: string = '5e'): Promise<any> => {
    const apiType = ruleset === '5e' ? type : `${ruleset}_${type}`;
    const response = await fetch(`${BASE_URL}/api/${apiType}/${index}`);
    if (!response.ok) {
      throw new Error(`[dndApi] Failed to fetch details for '${apiType}/${index}' from backend: status ${response.status}`);
    }
    return response.json();
  },

  getSpells: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('spells', ruleset);
  },

  getSpellDetails: async (index: string, ruleset: string = '5e'): Promise<SpellDetails> => {
    return dndApi.fetchDetails('spells', index, ruleset);
  },

  getMonsters: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    // Monsters bestiary has been archived offline in this design, return empty list
    return Promise.resolve([]);
  },

  getMonsterDetails: async (index: string, ruleset: string = '5e'): Promise<any> => {
    return Promise.reject(new Error(`Monster bestiary has been archived offline.`));
  },

  getClasses: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('classes', ruleset);
  },

  getClassDetails: async (index: string, ruleset: string = '5e'): Promise<ClassDetails> => {
    return dndApi.fetchDetails('classes', index, ruleset);
  },

  getRaces: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('races', ruleset);
  },

  getRaceDetails: async (index: string, ruleset: string = '5e'): Promise<RaceDetails> => {
    return dndApi.fetchDetails('races', index, ruleset);
  },

  getBackgrounds: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('backgrounds', ruleset);
  },

  getBackgroundDetails: async (index: string, ruleset: string = '5e'): Promise<any> => {
    return dndApi.fetchDetails('backgrounds', index, ruleset);
  },

  getFeats: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('feats', ruleset);
  },

  getFeatDetails: async (index: string, ruleset: string = '5e'): Promise<any> => {
    return dndApi.fetchDetails('feats', index, ruleset);
  },

  getEquipment: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('equipment', ruleset);
  },

  getEquipmentDetails: async (index: string, ruleset: string = '5e'): Promise<any> => {
    return dndApi.fetchDetails('equipment', index, ruleset);
  },

  getMagicItems: async (ruleset: string = '5e'): Promise<DndListItem[]> => {
    return dndApi.fetchCollection('magic-items', ruleset);
  },

  getMagicItemDetails: async (index: string, ruleset: string = '5e'): Promise<any> => {
    return dndApi.fetchDetails('magic-items', index, ruleset);
  },

  saveHomebrew: async (item: any, ruleset: string = '5e'): Promise<void> => {
    const apiType = ruleset === '5e' ? 'homebrew' : `${ruleset}_homebrew`;
    const response = await fetch(`${BASE_URL}/api/${apiType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error(`[dndApi] Failed to save homebrew to backend: status ${response.status}`);
    }
  },
};
