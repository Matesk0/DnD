import React, { useState, useEffect, useMemo } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Lineicons } from '@lineiconshq/react-native-lineicons';
import { dndApi, DndListItem } from '@/services/dnd-api';
import {
  GamePadModern1Stroke,
  User4Stroke,
  Shield2Stroke,
  Book1Stroke,
  Home2Stroke,
  PlusStroke,
  Trash3Stroke,
  XmarkStroke,
  HeartStroke,
  Bolt2Stroke,
  Crown3Stroke,
  Trophy1Stroke,
  Pencil1Stroke,
} from '@lineiconshq/free-icons';

interface GamePlatform {
  name: string;
  icon: any;
  description: string;
  tagline: string;
  url: string;
  badge: string;
  badgeColor: string;
}

const PLATFORMS: GamePlatform[] = [
  {
    name: 'D&D Beyond',
    icon: User4Stroke,
    tagline: 'Official D&D Digital Companion',
    description:
      'Access official digital books, character creator, campaign manager, and official rules integration. Great for tracking campaigns online.',
    url: 'https://www.dndbeyond.com',
    badge: 'Official',
    badgeColor: '#dfb15b',
  },
  {
    name: 'Roll20',
    icon: GamePadModern1Stroke,
    tagline: 'Browser-Based Virtual Tabletop',
    description:
      'Play D&D online with video/voice chat, shared maps, dynamic lighting, character sheets, and built-in rules reference.',
    url: 'https://roll20.net',
    badge: 'Popular VTT',
    badgeColor: '#007aff',
  },
  {
    name: 'Foundry VTT',
    icon: Home2Stroke,
    tagline: 'Modern Self-Hosted Virtual Tabletop',
    description:
      'A feature-rich, downloadable VTT for GMs that runs in the browser for players. Incredible community modules and visual effects.',
    url: 'https://foundryvtt.com',
    badge: 'Self-Hosted',
    badgeColor: '#ff9500',
  },
];

interface Player {
  name: string;
  characterName: string;
  class: string;
  status: 'online' | 'offline' | 'dm';
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'message' | 'roll' | 'narrative';
  timestamp: string;
}

interface InventoryItem {
  id: string;
  name: string;
  qty: number;
}

export function PlayView() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  // Active play mode: 'directory' (VTT links) or 'session' (built-in table)
  const [playMode, setPlayMode] = useState<'directory' | 'session'>('session');

  // Load characters list for dropdown selector
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // Load characters on load
  useEffect(() => {
    // Default seed characters or load from local vault list
    setCharacters([
      {
        id: 'char_1',
        name: 'Thorrall Ironbreaker',
        class: 'Cleric',
        race: 'Dwarf',
        stats: { strength: 14, dexterity: 8, constitution: 16, intelligence: 10, wisdom: 15, charisma: 12 },
        hp: 11,
        speed: 25,
      },
      {
        id: 'char_2',
        name: 'Elysia Moonwhisper',
        class: 'Wizard',
        race: 'Elf',
        stats: { strength: 8, dexterity: 15, constitution: 12, intelligence: 16, wisdom: 13, charisma: 10 },
        hp: 7,
        speed: 30,
      },
    ]);
  }, []);

  const activeChar = useMemo(() => {
    return characters.find((c) => c.id === selectedCharId) || null;
  }, [characters, selectedCharId]);

  // Player list status
  const players: Player[] = [
    { name: 'DM Dave', characterName: 'Dungeon Master', class: 'DM', status: 'dm' },
    { name: 'Thorrall User', characterName: 'Thorrall Ironbreaker', class: 'Cleric', status: 'online' },
    { name: 'Elysia User', characterName: 'Elysia Moonwhisper', class: 'Wizard', status: 'offline' },
    { name: 'Kaelen User', characterName: 'Kaelen Shadowstep', class: 'Fighter', status: 'online' },
  ];

  // Chat message logs
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'DM Dave',
      text: 'The heavy stone door creaks open, revealing a damp chamber filled with glowing neon blue fungi. A low growl echoes from the shadows...',
      type: 'narrative',
      timestamp: '12:00',
    },
    {
      id: 'm2',
      sender: 'Thorrall Ironbreaker',
      text: 'I raise my shield, preparing to cast Light.',
      type: 'message',
      timestamp: '12:02',
    },
  ]);

  const [messageText, setMessageText] = useState('');

  // Personal Backpack and Shared Treasure Chest
  const [backpack, setBackpack] = useState<InventoryItem[]>([
    { id: 'b1', name: 'Studded Leather Armor', qty: 1 },
    { id: 'b2', name: 'Potion of Healing', qty: 2 },
    { id: 'b3', name: 'Rations', qty: 5 },
  ]);

  const [sharedChest, setSharedChest] = useState<InventoryItem[]>([
    { id: 's1', name: 'Bag of Holding', qty: 1 },
    { id: 's2', name: 'Gold Pieces (GP)', qty: 450 },
    { id: 's3', name: 'Flawless Emerald', qty: 1 },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemTarget, setNewItemTarget] = useState<'backpack' | 'shared'>('backpack');

  // Roll helper
  const executeRoll = (label: string, die: number, modifier: number = 0) => {
    const result = Math.floor(Math.random() * die) + 1;
    const total = result + modifier;
    const modifierText = modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '';
    const newRoll: ChatMessage = {
      id: `roll_${Date.now()}`,
      sender: activeChar ? activeChar.name : 'Adventurer',
      text: `rolled ${label}: d${die}${modifierText} ➔ [${result}] = ${total}`,
      type: 'roll',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatLogs((prev) => [...prev, newRoll]);
  };

  // Skill definitions and modifiers resolver
  const getStatModifier = (val: number) => Math.floor((val - 10) / 2);

  const skills = useMemo(() => {
    if (!activeChar) return [];
    const stats = activeChar.stats;
    return [
      { name: 'Acrobatics', ability: 'DEX', val: getStatModifier(stats.dexterity) },
      { name: 'Athletics', ability: 'STR', val: getStatModifier(stats.strength) },
      { name: 'Arcana', ability: 'INT', val: getStatModifier(stats.intelligence) },
      { name: 'History', ability: 'INT', val: getStatModifier(stats.intelligence) },
      { name: 'Insight', ability: 'WIS', val: getStatModifier(stats.wisdom) },
      { name: 'Investigation', ability: 'INT', val: getStatModifier(stats.intelligence) },
      { name: 'Perception', ability: 'WIS', val: getStatModifier(stats.wisdom) },
      { name: 'Persuasion', ability: 'CHA', val: getStatModifier(stats.charisma) },
      { name: 'Stealth', ability: 'DEX', val: getStatModifier(stats.dexterity) },
      { name: 'Survival', ability: 'WIS', val: getStatModifier(stats.wisdom) },
    ];
  }, [activeChar]);

  // Send message
  const sendMessage = () => {
    if (!messageText.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: activeChar ? activeChar.name : 'Adventurer',
      text: messageText,
      type: 'message',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatLogs((prev) => [...prev, newMsg]);
    setMessageText('');
  };

  // Add Item to inventory
  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: InventoryItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      qty: 1,
    };
    if (newItemTarget === 'backpack') {
      setBackpack((prev) => [...prev, newItem]);
    } else {
      setSharedChest((prev) => [...prev, newItem]);
    }
    setNewItemName('');
  };

  // Transfer item
  const transferToBackpack = (item: InventoryItem) => {
    // Remove from shared chest
    setSharedChest((prev) => prev.filter((i) => i.id !== item.id));
    // Add to backpack
    setBackpack((prev) => [...prev, item]);
  };

  // Directory VTT links view
  const renderDirectory = () => {
    return (
      <View style={styles.directoryContainer}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Lineicons icon={GamePadModern1Stroke} size={28} color="#dfb15b" />
            <ThemedText type="subtitle" style={styles.title}>
              Online VTT Directories
            </ThemedText>
          </View>
          <Pressable style={styles.toggleBtn} onPress={() => setPlayMode('session')}>
            <ThemedText style={styles.toggleBtnText}>← Join Play Session</ThemedText>
          </Pressable>
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
              onPress={() => Linking.openURL(platform.url)}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Lineicons icon={platform.icon} size={26} color="#dfb15b" />
                </View>
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
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  // Active Play Session workspace
  const renderSession = () => {
    return (
      <View style={styles.sessionContainer}>
        {/* Sub-Header bar */}
        <View style={styles.sessionSubHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
            <Lineicons icon={Crown3Stroke} size={18} color="#dfb15b" />
            <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: 'bold' }}>
              Echoes of the Underdark
            </ThemedText>
          </View>

          {/* Active Character Selector Dropdown */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
            <ThemedText type="small" themeColor="textSecondary">Character:</ThemedText>
            <View style={styles.dropdownRow}>
              {characters.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.characterSelectBtn,
                    selectedCharId === c.id && styles.characterSelectBtnActive,
                  ]}
                  onPress={() => setSelectedCharId(c.id)}>
                  <ThemedText style={[styles.characterSelectText, selectedCharId === c.id && styles.characterSelectTextActive]}>
                    {c.name.split(' ')[0]}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.directoryToggleBtn} onPress={() => setPlayMode('directory')}>
              <ThemedText style={styles.directoryToggleText}>VTT Directory</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Main session board layout */}
        <View style={[styles.sessionBoard, isLargeScreen && styles.sessionBoardLarge]}>
          
          {/* COLUMN 1: Players & Inventories (Personal / Shared) */}
          <View style={[styles.leftCol, isLargeScreen && styles.leftColLarge]}>
            
            {/* Active Players status block */}
            <ThemedView type="backgroundElement" style={styles.panelCard}>
              <ThemedText type="smallBold" style={styles.panelTitle}>Active Players</ThemedText>
              <View style={styles.playerList}>
                {players.map((p, idx) => (
                  <View key={idx} style={styles.playerItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={[
                        styles.statusIndicator,
                        p.status === 'online' && { backgroundColor: '#34c759' },
                        p.status === 'dm' && { backgroundColor: '#dfb15b' },
                        p.status === 'offline' && { backgroundColor: '#777' },
                      ]} />
                      <ThemedText type="smallBold">{p.characterName}</ThemedText>
                    </View>
                    <ThemedText type="code" style={{ fontSize: 9 }} themeColor="textSecondary">
                      {p.status === 'dm' ? 'Dungeon Master' : p.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>

            {/* Backpack / Shared Loot */}
            <ThemedView type="backgroundElement" style={[styles.panelCard, { flex: 1 }]}>
              <ThemedText type="smallBold" style={styles.panelTitle}>🎒 Inventories</ThemedText>
              
              <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                {/* Personal Backpack */}
                <View style={styles.invSection}>
                  <ThemedText type="smallBold" style={styles.invHeader}>Personal Backpack ({activeChar ? activeChar.name.split(' ')[0] : 'None'})</ThemedText>
                  {backpack.map((item) => (
                    <View key={item.id} style={styles.invItemRow}>
                      <ThemedText type="small">{item.name}</ThemedText>
                      <ThemedText type="code" themeColor="textSecondary">x{item.qty}</ThemedText>
                    </View>
                  ))}
                </View>

                {/* Shared Party Treasure Chest */}
                <View style={[styles.invSection, { marginTop: Spacing.three }]}>
                  <ThemedText type="smallBold" style={styles.invHeader}>📦 Shared Chest (Party loot)</ThemedText>
                  {sharedChest.map((item) => (
                    <View key={item.id} style={styles.invItemRow}>
                      <ThemedText type="small">{item.name}</ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
                        <ThemedText type="code" themeColor="textSecondary">x{item.qty}</ThemedText>
                        <Pressable onPress={() => transferToBackpack(item)}>
                          <ThemedText style={styles.takeBtnText}>Claim</ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Add item form */}
              <View style={styles.addItemForm}>
                <TextInput
                  style={[styles.addItemInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                  placeholder="New item name..."
                  placeholderTextColor={theme.textSecondary}
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <View style={styles.addItemActions}>
                  <Pressable
                    style={[styles.addItemTargetBtn, newItemTarget === 'backpack' && styles.addItemTargetBtnActive]}
                    onPress={() => setNewItemTarget('backpack')}>
                    <ThemedText style={styles.addItemTargetText}>Backpack</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.addItemTargetBtn, newItemTarget === 'shared' && styles.addItemTargetBtnActive]}
                    onPress={() => setNewItemTarget('shared')}>
                    <ThemedText style={styles.addItemTargetText}>Shared</ThemedText>
                  </Pressable>
                  <Pressable style={styles.addItemSubmitBtn} onPress={addItem}>
                    <Lineicons icon={PlusStroke} size={14} color="#fff" />
                  </Pressable>
                </View>
              </View>
            </ThemedView>
          </View>

          {/* COLUMN 2: Narrative Logs & Chat Area */}
          <View style={styles.middleCol}>
            <ThemedView type="backgroundElement" style={styles.chatArea}>
              <ThemedText type="smallBold" style={styles.panelTitle}>Cinematic Log</ThemedText>
              
              <FlatList
                data={chatLogs}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
                renderItem={({ item }) => (
                  <View style={[
                    styles.chatMessageItem,
                    item.type === 'narrative' && styles.narrativeMsg,
                    item.type === 'roll' && styles.rollMsg,
                  ]}>
                    <View style={styles.msgHeader}>
                      <ThemedText type="smallBold" style={[
                        styles.msgSender,
                        item.sender === 'Dungeon Master' && { color: '#dfb15b' },
                      ]}>
                        {item.sender}
                      </ThemedText>
                      <ThemedText type="code" style={{ fontSize: 9 }} themeColor="textSecondary">
                        {item.timestamp}
                      </ThemedText>
                    </View>
                    <ThemedText type="small" style={[
                      styles.msgText,
                      item.type === 'narrative' && { fontStyle: 'italic', color: '#dedede' },
                      item.type === 'roll' && { color: '#dfb15b', fontWeight: 'bold' },
                    ]}>
                      {item.text}
                    </ThemedText>
                  </View>
                )}
              />

              {/* Chat Send Message input */}
              <View style={styles.chatInputRow}>
                <TextInput
                  style={[styles.chatInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}
                  placeholder="Cast spells, roll d20s, or describe actions..."
                  placeholderTextColor={theme.textSecondary}
                  value={messageText}
                  onChangeText={setMessageText}
                  onSubmitEditing={sendMessage}
                />
                <Pressable style={styles.chatSendBtn} onPress={sendMessage}>
                  <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Send</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>

          {/* COLUMN 3: Character stats & skill rollers */}
          {isLargeScreen && (
            <View style={styles.rightCol}>
              <ThemedView type="backgroundElement" style={styles.panelCard}>
                <ThemedText type="smallBold" style={styles.panelTitle}>🎲 Table Roller</ThemedText>
                <View style={styles.diceGrid}>
                  {[4, 6, 8, 10, 12, 20, 100].map((die) => (
                    <Pressable
                      key={die}
                      style={({ pressed }) => [styles.sessionDieBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => executeRoll(`d${die}`, die)}>
                      <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>d{die}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </ThemedView>

              <ThemedView type="backgroundElement" style={[styles.panelCard, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.panelTitle}>📜 Character Skills</ThemedText>
                
                {!activeChar ? (
                  <View style={styles.centerContent}>
                    <ThemedText style={{ fontStyle: 'italic', fontSize: 12 }} themeColor="textSecondary">
                      Select character at the top to roll skills!
                    </ThemedText>
                  </View>
                ) : (
                  <ScrollView nestedScrollEnabled style={{ flex: 1 }}>
                    <View style={styles.skillsList}>
                      {skills.map((skill) => (
                        <Pressable
                          key={skill.name}
                          style={({ pressed }) => [styles.skillRollItem, pressed && { opacity: 0.7 }]}
                          onPress={() => executeRoll(`${skill.name} (${skill.ability})`, 20, skill.val)}>
                          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                            <Lineicons icon={Pencil1Stroke} size={11} color="#dfb15b" />
                            <ThemedText type="small">{skill.name}</ThemedText>
                          </View>
                          <ThemedText type="code" style={{ color: '#dfb15b', fontWeight: 'bold' }}>
                            {skill.val >= 0 ? `+${skill.val}` : skill.val}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </ThemedView>
            </View>
          )}

        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {playMode === 'directory' ? renderDirectory() : renderSession()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  directoryContainer: {
    flex: 1,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 800,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    color: '#dfb15b',
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  toggleBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#dfb15b',
  },
  toggleBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
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
    borderLeftColor: '#dfb15b',
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(223, 177, 91, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(223, 177, 91, 0.1)',
  },
  titleBlock: {
    flex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  cardTag: {
    fontSize: 10,
    marginTop: Spacing.half,
    color: '#dfb15b',
  },
  desc: {
    lineHeight: 18,
    flexGrow: 1,
    fontSize: 13,
  },
  sessionContainer: {
    flex: 1,
    width: '100%',
  },
  sessionSubHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1d21',
    backgroundColor: '#0a0a0d',
    gap: Spacing.two,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 4,
  },
  characterSelectBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262629',
    backgroundColor: '#121215',
  },
  characterSelectBtnActive: {
    borderColor: '#dfb15b',
    backgroundColor: 'rgba(223, 177, 91, 0.1)',
  },
  characterSelectText: {
    fontSize: 11,
    color: '#888',
    fontWeight: 'bold',
  },
  characterSelectTextActive: {
    color: '#dfb15b',
  },
  directoryToggleBtn: {
    marginLeft: Spacing.two,
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
    backgroundColor: '#262629',
  },
  directoryToggleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sessionBoard: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sessionBoardLarge: {
    flexDirection: 'row',
  },
  leftCol: {
    gap: Spacing.three,
  },
  leftColLarge: {
    width: 260,
  },
  middleCol: {
    flex: 2,
  },
  rightCol: {
    width: 240,
    gap: Spacing.three,
  },
  panelCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#1d1d21',
    gap: Spacing.two,
  },
  panelTitle: {
    color: '#dfb15b',
    fontSize: 13,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(223, 177, 91, 0.15)',
    paddingBottom: Spacing.one,
  },
  playerList: {
    gap: Spacing.two,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.half,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  invSection: {
    gap: Spacing.one,
  },
  invHeader: {
    fontSize: 11,
    color: '#dfb15b',
    marginBottom: Spacing.half,
  },
  invItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  takeBtnText: {
    fontSize: 9,
    color: '#dfb15b',
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#dfb15b',
    borderRadius: 2,
  },
  addItemForm: {
    marginTop: Spacing.two,
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#1d1d21',
  },
  addItemInput: {
    height: 32,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    fontSize: 11,
  },
  addItemActions: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  addItemTargetBtn: {
    flex: 1,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262629',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemTargetBtnActive: {
    backgroundColor: '#dfb15b',
    borderColor: '#dfb15b',
  },
  addItemTargetText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  addItemSubmitBtn: {
    width: 26,
    height: 26,
    backgroundColor: '#dfb15b',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#1d1d21',
    padding: Spacing.three,
  },
  chatList: {
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  chatMessageItem: {
    padding: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255,255,255,0.01)',
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#262629',
  },
  narrativeMsg: {
    backgroundColor: 'rgba(223, 177, 91, 0.02)',
    borderLeftColor: '#dfb15b',
  },
  rollMsg: {
    backgroundColor: 'rgba(223, 177, 91, 0.05)',
    borderLeftColor: '#dfb15b',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  msgSender: {
    fontSize: 11,
  },
  msgText: {
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  chatSendBtn: {
    height: 38,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#dfb15b',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  sessionDieBtn: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: '#1d1d21',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262629',
  },
  skillsList: {
    gap: 4,
  },
  skillRollItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
});
