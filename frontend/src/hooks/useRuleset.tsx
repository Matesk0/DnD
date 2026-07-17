import React, { createContext, useContext, useState, useMemo } from 'react';

export type Ruleset = '5e' | 'pf2e';
export type ThemeKey = 'crimson' | 'grey' | 'amber' | 'purple' | 'forest' | 'azure';

export interface GlobalPreferences {
  themeMode: 'dark' | 'light';
  globalTheme: ThemeKey;
  useLocalThemes: boolean;
  username: string;
  enableMapAcceleration: boolean;
}

export interface LocalPreferences {
  theme: ThemeKey;
  autoLogCrits: boolean;
  offlineFallback: boolean;
}

interface RulesetContextType {
  ruleset: Ruleset;
  setRuleset: (ruleset: Ruleset) => void;
  // Preferences state
  globalPrefs: GlobalPreferences;
  updateGlobalPrefs: (prefs: Partial<GlobalPreferences>) => void;
  localPrefs: Record<Ruleset, LocalPreferences>;
  updateLocalPrefs: (ruleset: Ruleset, prefs: Partial<LocalPreferences>) => void;
  activeThemeColors: {
    text: string;
    background: string;
    backgroundElement: string;
    backgroundSelected: string;
    textSecondary: string;
    accent: string;
    borderColor: string;
  };
}

const ACCENTS: Record<ThemeKey, string> = {
  crimson: '#ff4d4d', // Red (DnD Default)
  grey: '#a0aec0',    // Grey (PF2e Default)
  amber: '#dfb15b',   // Gold
  purple: '#af52de',  // Purple
  forest: '#34c759',  // Green
  azure: '#007aff',   // Blue
};

const BASE_BACKGROUNDS = {
  dark: {
    background: '#08080a',        // Immersive pitch charcoal
    backgroundElement: '#121215', // Sleek cards
  },
  light: {
    background: '#ffffff',        // Pure white
    backgroundElement: '#F0F0F3', // Light cards
  }
};

const SELECTED_BACKGROUNDS = {
  dark: {
    crimson: 'rgba(255, 77, 77, 0.15)',
    grey: 'rgba(160, 174, 192, 0.15)',
    amber: 'rgba(223, 177, 91, 0.15)',
    purple: 'rgba(175, 82, 222, 0.15)',
    forest: 'rgba(52, 199, 89, 0.15)',
    azure: 'rgba(0, 122, 255, 0.15)',
  },
  light: {
    crimson: 'rgba(255, 77, 77, 0.08)',
    grey: 'rgba(160, 174, 192, 0.08)',
    amber: 'rgba(223, 177, 91, 0.08)',
    purple: 'rgba(175, 82, 222, 0.08)',
    forest: 'rgba(52, 199, 89, 0.08)',
    azure: 'rgba(0, 122, 255, 0.08)',
  }
};

const RulesetContext = createContext<RulesetContextType | undefined>(undefined);

export function RulesetProvider({ children }: { children: React.ReactNode }) {
  const [ruleset, setRuleset] = useState<Ruleset>('5e');

  const [globalPrefs, setGlobalPrefs] = useState<GlobalPreferences>({
    themeMode: 'dark',
    globalTheme: 'crimson',
    useLocalThemes: true,
    username: 'Adventurer',
    enableMapAcceleration: true,
  });

  const [localPrefs, setLocalPrefs] = useState<Record<Ruleset, LocalPreferences>>({
    '5e': {
      theme: 'crimson', // Default 5e theme is Red
      autoLogCrits: true,
      offlineFallback: true,
    },
    'pf2e': {
      theme: 'grey', // Default PF2e theme is Grey
      autoLogCrits: true,
      offlineFallback: true,
    },
  });

  const updateGlobalPrefs = (prefs: Partial<GlobalPreferences>) => {
    setGlobalPrefs((prev) => ({ ...prev, ...prefs }));
  };

  const updateLocalPrefs = (rs: Ruleset, prefs: Partial<LocalPreferences>) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [rs]: { ...prev[rs], ...prefs },
    }));
  };

  const activeThemeColors = useMemo(() => {
    const mode = globalPrefs.themeMode;
    const activeThemeKey = globalPrefs.useLocalThemes
      ? localPrefs[ruleset].theme
      : globalPrefs.globalTheme;

    return {
      text: mode === 'dark' ? '#ffffff' : '#000000',
      textSecondary: mode === 'dark' ? '#9ca3af' : '#60646C',
      borderColor: mode === 'dark' ? '#1d1d21' : '#e2e8f0',
      accent: ACCENTS[activeThemeKey],
      backgroundSelected: SELECTED_BACKGROUNDS[mode][activeThemeKey],
      ...BASE_BACKGROUNDS[mode]
    };
  }, [ruleset, globalPrefs, localPrefs]);

  return (
    <RulesetContext.Provider
      value={{
        ruleset,
        setRuleset,
        globalPrefs,
        updateGlobalPrefs,
        localPrefs,
        updateLocalPrefs,
        activeThemeColors,
      }}>
      {children}
    </RulesetContext.Provider>
  );
}

export function useRuleset() {
  const context = useContext(RulesetContext);
  if (context === undefined) {
    throw new Error('useRuleset must be used within a RulesetProvider');
  }
  return context;
}
