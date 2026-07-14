import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface GamePlatform {
  name: string;
  emoji: string;
  description: string;
  tagline: string;
  url: string;
  badge: string;
  badgeColor: string;
}

const PLATFORMS: GamePlatform[] = [
  {
    name: 'D&D Beyond',
    emoji: '🧙‍♂️',
    tagline: 'Official D&D Digital Companion',
    description:
      'Access official digital books, character creator, campaign manager, and official rules integration. Great for tracking campaigns online.',
    url: 'https://www.dndbeyond.com',
    badge: 'Official',
    badgeColor: '#D81921',
  },
  {
    name: 'Roll20',
    emoji: '🎲',
    tagline: 'Browser-Based Virtual Tabletop',
    description:
      'Play D&D online with video/voice chat, shared maps, dynamic lighting, character sheets, and built-in rules reference.',
    url: 'https://roll20.net',
    badge: 'Popular VTT',
    badgeColor: '#007aff',
  },
  {
    name: 'Foundry VTT',
    emoji: '⚙️',
    tagline: 'Modern Self-Hosted Virtual Tabletop',
    description:
      'A feature-rich, downloadable VTT for GMs that runs in the browser for players. Incredible community modules and visual effects.',
    url: 'https://foundryvtt.com',
    badge: 'Self-Hosted',
    badgeColor: '#ff9500',
  },
  {
    name: 'Owlbear Rodeo',
    emoji: '🦉',
    tagline: 'Simple, Account-Free Map Sharing',
    description:
      'A lightweight web-based VTT focused on simple map sharing and tokens. Zero setup required—create a room and share the link.',
    url: 'https://www.owlbear.rodeo',
    badge: 'No Setup',
    badgeColor: '#34c759',
  },
  {
    name: 'Fantasy Grounds',
    emoji: '🛡️',
    tagline: 'High-Automation Classic Tabletop',
    description:
      'A highly automated tabletop client that handles calculations, maps, modules, and rolls. Great for complex games and rules enforcement.',
    url: 'https://www.fantasygrounds.com',
    badge: 'Automated',
    badgeColor: '#8e44ad',
  },
  {
    name: 'Tabletop Simulator',
    emoji: '🌐',
    tagline: '3D Physics VTT Sandbox',
    description:
      'A complete 3D simulator where you can load actual 3D dungeons, flip tables, throw physical 3D dice, and move custom miniatures.',
    url: 'https://www.tabletopsimulator.com',
    badge: '3D Physics',
    badgeColor: '#1abc9c',
  },
];

export function PlayView() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const handleLaunch = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open platform link:', err)
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          🎮 Selection of Online Games
        </ThemedText>
        <ThemedText style={styles.tagline} themeColor="textSecondary">
          Launch your campaign on the web. Select a virtual tabletop (VTT) or rule companion to start playing Dungeons & Dragons online with your group.
        </ThemedText>
      </View>

      <View style={[styles.grid, isLargeScreen && styles.gridLarge]}>
        {PLATFORMS.map((platform) => (
          <Pressable
            key={platform.name}
            style={(state: any) => [
              styles.card,
              { backgroundColor: theme.backgroundElement },
              state.hovered && styles.cardHover,
              state.pressed && styles.cardPress,
            ]}
            onPress={() => handleLaunch(platform.url)}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.emoji}>{platform.emoji}</ThemedText>
              <View style={styles.titleBlock}>
                <ThemedText type="smallBold" style={styles.cardName}>
                  {platform.name}
                </ThemedText>
                <ThemedText type="code" style={styles.cardTag}>
                  {platform.tagline}
                </ThemedText>
              </View>
            </View>

            <ThemedText type="small" style={styles.desc} themeColor="textSecondary">
              {platform.description}
            </ThemedText>

            <View style={styles.footer}>
              <View style={[styles.badge, { backgroundColor: platform.badgeColor }]}>
                <ThemedText style={styles.badgeText}>{platform.badge}</ThemedText>
              </View>
              <ThemedText type="smallBold" style={styles.launchLink}>
                Launch Platform →
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 800,
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  title: {
    color: '#D81921',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 600,
  },
  grid: {
    width: '100%',
    maxWidth: 800,
    gap: Spacing.three,
  },
  gridLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flex: 1,
    minWidth: 320,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: '#D81921',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    gap: Spacing.three,
    justifyContent: 'space-between',
    borderCurve: 'continuous',
  },
  cardHover: {
    transform: [{ translateY: -2 }],
    boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
  },
  cardPress: {
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 32,
  },
  titleBlock: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTag: {
    fontSize: 10,
    marginTop: Spacing.half,
    color: '#D81921',
  },
  desc: {
    lineHeight: 18,
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  launchLink: {
    color: '#D81921',
    fontSize: 12,
  },
});
