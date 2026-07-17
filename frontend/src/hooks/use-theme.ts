import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRuleset } from './useRuleset';

export function useTheme() {
  try {
    const { activeThemeColors } = useRuleset();
    return activeThemeColors;
  } catch (e) {
    // Fallback if not wrapped inside RulesetProvider
    return {
      text: '#ffffff',
      background: '#08080a',
      backgroundElement: '#121215',
      backgroundSelected: '#202025',
      textSecondary: '#9ca3af',
      accent: '#dfb15b',
      borderColor: '#1d1d21',
    };
  }
}
