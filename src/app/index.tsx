import React, { useState, useEffect } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlayView } from '@/components/play-view';
import { CharacterView } from '@/components/character-view';
import { NotesView } from '@/components/notes-view';
import { CompendiumView } from '@/components/compendium-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabSection = 'home' | 'play' | 'character' | 'notes' | 'compendium';

// Dice Roller State for native platforms only
interface RollLog {
  id: string;
  die: string;
  result: number;
  isNat20: boolean;
  isNat1: boolean;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  const [activeTab, setActiveTab] = useState<TabSection>('home');

  // Dice Roller State (Only shown on native mobile, hidden on Web)
  const [lastRoll, setLastRoll] = useState<RollLog | null>(null);
  const [rollHistory, setRollHistory] = useState<RollLog[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDie = (sides: number) => {
    setIsRolling(true);
    setLastRoll(null);
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      const isNat20 = sides === 20 && result === 20;
      const isNat1 = sides === 20 && result === 1;

      const newRoll: RollLog = {
        id: Date.now().toString(),
        die: `d${sides}`,
        result,
        isNat20,
        isNat1,
      };

      setLastRoll(newRoll);
      setRollHistory((prev) => [newRoll, ...prev.slice(0, 4)]);
      setIsRolling(false);
    }, 300);
  };

  // Render navigation links
  const renderNavLinks = () => {
    const tabs: { id: TabSection; label: string }[] = [
      { id: 'home', label: 'Home' },
      { id: 'play', label: 'Play' },
      { id: 'character', label: 'Character' },
      { id: 'notes', label: 'Notes' },
      { id: 'compendium', label: 'Compendium' },
    ];

    return (
      <View style={[styles.navLinks, !isLargeScreen && styles.navLinksMobile]}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.navLinkBtn,
                isSelected && styles.navLinkBtnActive,
              ]}
              onPress={() => setActiveTab(tab.id)}>
              <ThemedText
                style={[
                  styles.navLinkLabel,
                  isSelected && styles.navLinkLabelActive,
                ]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'play':
        return <PlayView />;
      case 'character':
        return <CharacterView />;
      case 'notes':
        return <NotesView />;
      case 'compendium':
        return <CompendiumView />;
      default:
        return renderHomeTab();
    }
  };

  // Render Home/Welcome Hub
  const renderHomeTab = () => {
    return (
      <ScrollView contentContainerStyle={styles.homeScroll}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>
            D&D 5th Edition API
          </ThemedText>
          <ThemedText style={styles.heroSubtitle} themeColor="textSecondary">
            The 5e System Reference Document, compiled as a web companion.
          </ThemedText>
        </View>

        {/* Feature Grid */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Choose Your Destination
          </ThemedText>

          <View style={[styles.grid, isLargeScreen && styles.gridLarge]}>
            {/* Play online */}
            <Pressable
              style={(state: any) => [
                styles.hubCard,
                { backgroundColor: theme.backgroundElement },
                state.hovered && styles.cardHover,
                state.pressed && styles.cardPress,
              ]}
              onPress={() => setActiveTab('play')}>
              <ThemedText style={styles.hubCardEmoji}>🎮</ThemedText>
              <ThemedText type="smallBold" style={styles.hubCardTitle}>
                Play Games
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.hubCardDesc}>
                Browse and launch popular VTT platforms like Roll20 and Foundry VTT.
              </ThemedText>
            </Pressable>

            {/* Character Sheets */}
            <Pressable
              style={(state: any) => [
                styles.hubCard,
                { backgroundColor: theme.backgroundElement },
                state.hovered && styles.cardHover,
                state.pressed && styles.cardPress,
              ]}
              onPress={() => setActiveTab('character')}>
              <ThemedText style={styles.hubCardEmoji}>🧙‍♂️</ThemedText>
              <ThemedText type="smallBold" style={styles.hubCardTitle}>
                Character sheets
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.hubCardDesc}>
                Design, roll stats, randomize, and manage saved characters.
              </ThemedText>
            </Pressable>

            {/* Adventure Journal */}
            <Pressable
              style={(state: any) => [
                styles.hubCard,
                { backgroundColor: theme.backgroundElement },
                state.hovered && styles.cardHover,
                state.pressed && styles.cardPress,
              ]}
              onPress={() => setActiveTab('notes')}>
              <ThemedText style={styles.hubCardEmoji}>📝</ThemedText>
              <ThemedText type="smallBold" style={styles.hubCardTitle}>
                Adventure Journal
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.hubCardDesc}>
                Log campaigns and connect notes in a visual backlinked network.
              </ThemedText>
            </Pressable>

            {/* Compendium Rules */}
            <Pressable
              style={(state: any) => [
                styles.hubCard,
                { backgroundColor: theme.backgroundElement },
                state.hovered && styles.cardHover,
                state.pressed && styles.cardPress,
              ]}
              onPress={() => setActiveTab('compendium')}>
              <ThemedText style={styles.hubCardEmoji}>📚</ThemedText>
              <ThemedText type="smallBold" style={styles.hubCardTitle}>
                Rules Library
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.hubCardDesc}>
                Search Spells, Races, Backgrounds, Feats, UA, and Homebrews.
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Dice Roller: HIDE on web, SHOW on native mobile */}
        {Platform.OS !== 'web' && (
          <ThemedView type="backgroundElement" style={styles.diceContainer}>
            <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 15 }}>
              🎲 Dice Roller (Mobile Companion)
            </ThemedText>
            <View style={styles.diceRow}>
              {[4, 6, 8, 10, 12, 20].map((sides) => (
                <Pressable
                  key={sides}
                  style={({ pressed }) => [styles.dieBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => rollDie(sides)}>
                  <ThemedText style={styles.dieBtnText}>d{sides}</ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Roll Output */}
            <View style={styles.rollOutputBox}>
              {isRolling ? (
                <ThemedText style={{ fontStyle: 'italic' }}>Rolling...</ThemedText>
              ) : lastRoll ? (
                <ThemedText style={{ fontWeight: 'bold' }}>
                  Rolled {lastRoll.result} on {lastRoll.die}!
                </ThemedText>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  Tap a die to roll.
                </ThemedText>
              )}
            </View>
          </ThemedView>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Red/Dark Navigation Header Bar */}
      <View style={styles.navBar}>
        <View style={styles.navContainer}>
          <Pressable onPress={() => setActiveTab('home')} style={styles.navBrand}>
            <ThemedText style={styles.navBrandText}>
              5e<View style={styles.redBox}><ThemedText style={styles.redBoxText}>API</ThemedText></View>
            </ThemedText>
          </Pressable>

          {isLargeScreen ? (
            renderNavLinks()
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={{ fontStyle: 'italic' }}>
              Companion Hub
            </ThemedText>
          )}
        </View>
      </View>

      {/* Mobile Tab Links (below header if screen is small) */}
      {!isLargeScreen && (
        <View style={styles.mobileNavContainer}>{renderNavLinks()}</View>
      )}

      {/* Main Render Area */}
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Simple Footer */}
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          Copyright © {new Date().getFullYear()} 5e-bits contributors. Built with the SRD.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navBar: {
    height: 56,
    backgroundColor: '#151515',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBrandText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  redBox: {
    backgroundColor: '#D81921',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Spacing.one,
    marginLeft: 2,
  },
  redBoxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navLinks: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  navLinksMobile: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingVertical: Spacing.one,
  },
  navLinkBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  navLinkBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#D81921',
  },
  navLinkLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
  },
  navLinkLabelActive: {
    color: '#fff',
  },
  mobileNavContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    backgroundColor: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
  },
  homeScroll: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 450,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  primaryBtn: {
    backgroundColor: '#D81921',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: '#888',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
  ghostBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  headlineWrapper: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
  headlineBuild: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headlinePhrase: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D81921',
    textDecorationLine: 'underline',
  },
  jsonPreview: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.two,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    marginTop: Spacing.two,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  jsonText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#dcdcaa',
  },
  endpointPath: {
    flexDirection: 'row',
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionContainer: {
    width: '100%',
    maxWidth: 800,
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  grid: {
    width: '100%',
    gap: Spacing.three,
  },
  gridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hubCard: {
    flex: 1,
    minWidth: 180,
    padding: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: Spacing.two,
    alignItems: 'center',
  },
  cardHover: {
    transform: [{ translateY: -2 }],
    borderColor: '#D81921',
  },
  cardPress: {
    opacity: 0.9,
  },
  hubCardEmoji: {
    fontSize: 32,
  },
  hubCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  hubCardDesc: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  diceContainer: {
    width: '100%',
    maxWidth: 800,
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.15)',
    gap: Spacing.two,
  },
  diceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    flexWrap: 'wrap',
    marginVertical: Spacing.one,
  },
  dieBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    borderWidth: 1,
    borderColor: '#D81921',
    backgroundColor: 'rgba(216, 25, 33, 0.05)',
  },
  dieBtnText: {
    color: '#D81921',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rollOutputBox: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: Spacing.one,
  },
  footer: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: '#222222',
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
});
