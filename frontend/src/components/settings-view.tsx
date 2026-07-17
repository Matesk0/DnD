import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRuleset, ThemeKey } from '@/hooks/useRuleset';

export function SettingsView() {
  const theme = useTheme();
  const {
    ruleset,
    setRuleset,
    globalPrefs,
    updateGlobalPrefs,
    localPrefs,
    updateLocalPrefs,
  } = useRuleset();

  const activeLocalPrefs = localPrefs[ruleset];

  const themes: { key: ThemeKey; color: string; label: string }[] = [
    { key: 'crimson', color: '#ff4d4d', label: 'Crimson Red (5e)' },
    { key: 'grey', color: '#a0aec0', label: 'Grey (PF2e)' },
    { key: 'amber', color: '#dfb15b', label: 'Amber Gold' },
    { key: 'purple', color: '#af52de', label: 'Gothic Purple' },
    { key: 'forest', color: '#34c759', label: 'Druid Forest' },
    { key: 'azure', color: '#007aff', label: 'Storm Azure' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={[styles.title, { color: theme.accent }]}>
          ⚙️ Companion Settings
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Configure your tabletop environment, rulesets, and visual themes.
        </ThemedText>
      </View>

      {/* ────────────────── GLOBAL SETTINGS ────────────────── */}
      <View style={styles.section}>
        <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.accent }]}>
          Global Settings (All Rulesets)
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          {/* Light/Dark Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <ThemedText type="smallBold">Theme Mode</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Select Light or Dark app presentation.
              </ThemedText>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  globalPrefs.themeMode === 'light' && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ themeMode: 'light' })}>
                <ThemedText style={[styles.toggleBtnText, globalPrefs.themeMode === 'light' && { color: '#000' }]}>
                  Light
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  globalPrefs.themeMode === 'dark' && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ themeMode: 'dark' })}>
                <ThemedText style={[styles.toggleBtnText, globalPrefs.themeMode === 'dark' && { color: '#000' }]}>
                  Dark
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Use Ruleset-Specific Themes Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <ThemedText type="smallBold">Ruleset-Specific Themes</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Each ruleset carries its own distinct fantasy colors (Crimson for 5e, Purple for PF2e).
              </ThemedText>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  globalPrefs.useLocalThemes && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ useLocalThemes: true })}>
                <ThemedText style={[styles.toggleBtnText, globalPrefs.useLocalThemes && { color: '#000' }]}>
                  Yes
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  !globalPrefs.useLocalThemes && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ useLocalThemes: false })}>
                <ThemedText style={[styles.toggleBtnText, !globalPrefs.useLocalThemes && { color: '#000' }]}>
                  No
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Global Theme Selector (Only shown if local themes is false) */}
          {!globalPrefs.useLocalThemes && (
            <View style={{ marginTop: Spacing.two }}>
              <ThemedText type="smallBold" style={{ marginBottom: Spacing.one }}>
                Global App Theme
              </ThemedText>
              <View style={styles.themePalette}>
                {themes.map((t) => {
                  const isSelected = globalPrefs.globalTheme === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      style={[
                        styles.themeOption,
                        { backgroundColor: t.color },
                        isSelected && [styles.themeOptionSelected, { borderColor: theme.text }]
                      ]}
                      onPress={() => updateGlobalPrefs({ globalTheme: t.key })}>
                      {isSelected && (
                        <ThemedText style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>✓</ThemedText>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* WebGL accelerator toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <ThemedText type="smallBold">Map Accelerator (WebGL)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Accelerate tactical dungeon grid token graphics.
              </ThemedText>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  globalPrefs.enableMapAcceleration && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ enableMapAcceleration: true })}>
                <ThemedText style={[styles.toggleBtnText, globalPrefs.enableMapAcceleration && { color: '#000' }]}>
                  On
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  !globalPrefs.enableMapAcceleration && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateGlobalPrefs({ enableMapAcceleration: false })}>
                <ThemedText style={[styles.toggleBtnText, !globalPrefs.enableMapAcceleration && { color: '#000' }]}>
                  Off
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* ────────────────── LOCAL SETTINGS (RULESET-SPECIFIC) ────────────────── */}
      <View style={styles.section}>
        <View style={styles.localHeader}>
          <ThemedText type="smallBold" style={[styles.sectionTitle, { color: theme.accent }]}>
            Local Settings ({ruleset === '5e' ? 'DnD5e Only' : 'PF2e Only'})
          </ThemedText>
          <Pressable onPress={() => setRuleset(ruleset === '5e' ? 'pf2e' : '5e')} style={styles.swapBtn}>
            <ThemedText style={{ fontSize: 10, color: theme.accent, fontWeight: 'bold' }}>
              Switch ruleset view
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          {/* Ruleset Theme Selector */}
          {globalPrefs.useLocalThemes && (
            <View style={{ marginBottom: Spacing.two }}>
              <ThemedText type="smallBold" style={{ marginBottom: Spacing.one }}>
                Active Ruleset Theme ({ruleset === '5e' ? 'DnD5e' : 'PF2e'})
              </ThemedText>
              <View style={styles.themePalette}>
                {themes.map((t) => {
                  const isSelected = activeLocalPrefs.theme === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      style={[
                        styles.themeOption,
                        { backgroundColor: t.color },
                        isSelected && [styles.themeOptionSelected, { borderColor: theme.text }]
                      ]}
                      onPress={() => updateLocalPrefs(ruleset, { theme: t.key })}>
                      {isSelected && (
                        <ThemedText style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>✓</ThemedText>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Auto-log critical rolls */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <ThemedText type="smallBold">Auto-Log Critical Rolls</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Automatically generate linked Obsidian graph notes when Natural 20s or 1s are rolled.
              </ThemedText>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  activeLocalPrefs.autoLogCrits && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateLocalPrefs(ruleset, { autoLogCrits: true })}>
                <ThemedText style={[styles.toggleBtnText, activeLocalPrefs.autoLogCrits && { color: '#000' }]}>
                  Yes
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  !activeLocalPrefs.autoLogCrits && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateLocalPrefs(ruleset, { autoLogCrits: false })}>
                <ThemedText style={[styles.toggleBtnText, !activeLocalPrefs.autoLogCrits && { color: '#000' }]}>
                  No
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Offline database preference */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <ThemedText type="smallBold">Offline Database Fallbacks</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Use offline scrolls fallback if loading rulebooks, spells, or monsters fails.
              </ThemedText>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                style={[
                  styles.toggleBtn,
                  activeLocalPrefs.offlineFallback && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateLocalPrefs(ruleset, { offlineFallback: true })}>
                <ThemedText style={[styles.toggleBtnText, activeLocalPrefs.offlineFallback && { color: '#000' }]}>
                  On
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleBtn,
                  !activeLocalPrefs.offlineFallback && [styles.toggleBtnActive, { backgroundColor: theme.accent }],
                  { borderColor: theme.borderColor }
                ]}
                onPress={() => updateLocalPrefs(ruleset, { offlineFallback: false })}>
                <ThemedText style={[styles.toggleBtnText, !activeLocalPrefs.offlineFallback && { color: '#000' }]}>
                  Off
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    marginBottom: Spacing.two,
    gap: 4,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  localHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swapBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  settingTextGroup: {
    flex: 1,
    gap: 2,
    marginRight: Spacing.three,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  toggleBtnActive: {
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#888',
  },
  themePalette: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: Spacing.one,
  },
  themeOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOptionSelected: {
    borderWidth: 2,
  },
});
