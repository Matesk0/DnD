import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Character {
  id: string;
  name: string;
  class: string;
  race: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hp: number;
  speed: number;
  savingThrows: string[];
}

const DND_CLASSES = [
  { name: 'Barbarian', hitDie: 12, saves: ['STR', 'CON'], speedBonus: 10, emoji: '🪓' },
  { name: 'Bard', hitDie: 8, saves: ['DEX', 'CHA'], speedBonus: 0, emoji: '🪕' },
  { name: 'Cleric', hitDie: 8, saves: ['WIS', 'CHA'], speedBonus: 0, emoji: '✝️' },
  { name: 'Druid', hitDie: 8, saves: ['INT', 'WIS'], speedBonus: 0, emoji: '🍃' },
  { name: 'Fighter', hitDie: 10, saves: ['STR', 'CON'], speedBonus: 0, emoji: '⚔️' },
  { name: 'Monk', hitDie: 8, saves: ['STR', 'DEX'], speedBonus: 10, emoji: '🥋' },
  { name: 'Paladin', hitDie: 10, saves: ['WIS', 'CHA'], speedBonus: 0, emoji: '🛡️' },
  { name: 'Ranger', hitDie: 10, saves: ['STR', 'DEX'], speedBonus: 0, emoji: '🏹' },
  { name: 'Rogue', hitDie: 8, saves: ['DEX', 'INT'], speedBonus: 0, emoji: '🗡️' },
  { name: 'Sorcerer', hitDie: 6, saves: ['CON', 'CHA'], speedBonus: 0, emoji: '🔥' },
  { name: 'Warlock', hitDie: 8, saves: ['WIS', 'CHA'], speedBonus: 0, emoji: '👁️' },
  { name: 'Wizard', hitDie: 6, saves: ['INT', 'WIS'], speedBonus: 0, emoji: '🔮' },
];

const DND_RACES = [
  { name: 'Dwarf', speed: 25, bonus: { constitution: 2 }, emoji: '⛏️' },
  { name: 'Elf', speed: 30, bonus: { dexterity: 2 }, emoji: '🧝' },
  { name: 'Halfling', speed: 25, bonus: { dexterity: 2 }, emoji: '🍀' },
  { name: 'Human', speed: 30, bonus: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 }, emoji: '👨' },
  { name: 'Dragonborn', speed: 30, bonus: { strength: 2, charisma: 1 }, emoji: '🐉' },
  { name: 'Gnome', speed: 25, bonus: { intelligence: 2 }, emoji: '⚙️' },
  { name: 'Half-Elf', speed: 30, bonus: { charisma: 2, dexterity: 1, constitution: 1 }, emoji: '✨' },
  { name: 'Half-Orc', speed: 30, bonus: { strength: 2, constitution: 1 }, emoji: '👹' },
  { name: 'Tiefling', speed: 30, bonus: { charisma: 2, intelligence: 1 }, emoji: '😈' },
];

const RANDOM_NAMES = [
  'Thorrall Ironbreaker', 'Elysia Moonwhisper', 'Valen Sunblade',
  'Gimble Sparkfizz', 'Karrig Bloodfist', 'Seraphina Zephyr',
  'Brokk Stonefist', 'Lyra Windrunner', 'Kaelen Shadowstep',
  'Zepar Netherhorn', 'Dain Frostbeard', 'Morgra Deathweaver',
];

type CharacterSubTab = 'builder' | 'sheet' | 'party';

export function CharacterView() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [activeSubTab, setActiveSubTab] = useState<CharacterSubTab>('builder');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(DND_CLASSES[4]); // Fighter
  const [selectedRace, setSelectedRace] = useState(DND_RACES[3]); // Human
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  // Roll 4d6 and drop the lowest
  const rollStat = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls[1] + rolls[2] + rolls[3]; // sum top 3
  };

  const rollAllStats = () => {
    setStats({
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    });
  };

  const createCharacter = () => {
    if (!name.trim()) return;

    const conMod = getModifier(stats.constitution);
    const hitDie = selectedClass.hitDie;
    const hp = hitDie + conMod;
    const speed = selectedRace.speed + selectedClass.speedBonus;

    const newChar: Character = {
      id: Date.now().toString(),
      name,
      class: selectedClass.name,
      race: selectedRace.name,
      stats: { ...stats },
      hp: hp > 0 ? hp : 1,
      speed,
      savingThrows: [...selectedClass.saves],
    };

    setCharacters((prev) => [newChar, ...prev]);
    setSelectedCharId(newChar.id);
    resetForm();
    setActiveSubTab('sheet');
  };

  const generateRandom = () => {
    const randName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const randClass = DND_CLASSES[Math.floor(Math.random() * DND_CLASSES.length)];
    const randRace = DND_RACES[Math.floor(Math.random() * DND_RACES.length)];

    const randomStats = {
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    };

    // Apply race bonuses
    if (randRace.bonus) {
      Object.entries(randRace.bonus).forEach(([stat, val]) => {
        const key = stat as keyof typeof randomStats;
        randomStats[key] = (randomStats[key] || 10) + val;
      });
    }

    const conMod = Math.floor((randomStats.constitution - 10) / 2);
    const hp = randClass.hitDie + conMod;
    const speed = randRace.speed + randClass.speedBonus;

    const newChar: Character = {
      id: Date.now().toString(),
      name: randName,
      class: randClass.name,
      race: randRace.name,
      stats: randomStats,
      hp: hp > 0 ? hp : 1,
      speed,
      savingThrows: [...randClass.saves],
    };

    setCharacters((prev) => [newChar, ...prev]);
    setSelectedCharId(newChar.id);
    setActiveSubTab('sheet');
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    if (selectedCharId === id) {
      setSelectedCharId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedClass(DND_CLASSES[4]);
    setSelectedRace(DND_RACES[3]);
    setStats({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    });
  };

  const selectedChar = characters.find((c) => c.id === selectedCharId);

  return (
    <View style={styles.container}>
      {/* Red/Dark Sub-Header Bar */}
      <View style={styles.mainHeader}>
        <ThemedText type="subtitle" style={styles.title}>
          🧙‍♂️ Character Hub
        </ThemedText>
        <Pressable
          style={({ pressed }) => [styles.randomBtn, pressed && { opacity: 0.8 }]}
          onPress={generateRandom}>
          <ThemedText style={styles.randomBtnText}>🎲 Quick Randomizer</ThemedText>
        </Pressable>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabBtn, activeSubTab === 'builder' && styles.activeTabBtn]}
          onPress={() => setActiveSubTab('builder')}>
          <ThemedText style={[styles.tabBtnText, activeSubTab === 'builder' && styles.activeTabBtnText]}>
            🛠️ Builder
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeSubTab === 'sheet' && styles.activeTabBtn]}
          onPress={() => setActiveSubTab('sheet')}>
          <ThemedText style={[styles.tabBtnText, activeSubTab === 'sheet' && styles.activeTabBtnText]}>
            📜 Character Sheet {selectedChar ? `(${selectedChar.name.split(' ')[0]})` : ''}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeSubTab === 'party' && styles.activeTabBtn]}
          onPress={() => setActiveSubTab('party')}>
          <ThemedText style={[styles.tabBtnText, activeSubTab === 'party' && styles.activeTabBtnText]}>
            👥 Party ({characters.length})
          </ThemedText>
        </Pressable>
      </View>

      {/* Tab Content Panels */}
      <View style={styles.tabContent}>
        {activeSubTab === 'builder' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.fullSize}>
            <ScrollView style={styles.scrollColumn} contentContainerStyle={{ paddingBottom: Spacing.six }}>
              <ThemedView type="backgroundElement" style={styles.formCard}>
                <ThemedText type="smallBold" style={styles.formSectionTitle}>
                  Create New Character
                </ThemedText>

                {/* Name Input */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Character Name
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}
                    placeholder="e.g. Thorin Oakenshield"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Race Picker */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Select Race
                  </ThemedText>
                  <View style={styles.pickerGrid}>
                    {DND_RACES.map((race) => {
                      const isSelected = selectedRace.name === race.name;
                      return (
                        <Pressable
                          key={race.name}
                          style={[
                            styles.cardPickerBtn,
                            { borderColor: theme.backgroundSelected },
                            isSelected && { backgroundColor: '#D81921', borderColor: '#D81921' },
                          ]}
                          onPress={() => setSelectedRace(race)}>
                          <ThemedText style={styles.cardEmoji}>{race.emoji}</ThemedText>
                          <ThemedText style={[styles.cardBtnText, isSelected && { color: '#fff' }]}>
                            {race.name}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Class Picker */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Select Class
                  </ThemedText>
                  <View style={styles.pickerGrid}>
                    {DND_CLASSES.map((cls) => {
                      const isSelected = selectedClass.name === cls.name;
                      return (
                        <Pressable
                          key={cls.name}
                          style={[
                            styles.cardPickerBtn,
                            { borderColor: theme.backgroundSelected },
                            isSelected && { backgroundColor: '#D81921', borderColor: '#D81921' },
                          ]}
                          onPress={() => setSelectedClass(cls)}>
                          <ThemedText style={styles.cardEmoji}>{cls.emoji}</ThemedText>
                          <ThemedText style={[styles.cardBtnText, isSelected && { color: '#fff' }]}>
                            {cls.name}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Stats Roller */}
                <View style={styles.formGroup}>
                  <View style={styles.statsHeader}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                      Ability Scores
                    </ThemedText>
                    <Pressable onPress={rollAllStats}>
                      <ThemedText type="smallBold" style={{ color: '#D81921' }}>
                        🎲 Roll (4d6 drop lowest)
                      </ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.statsInputs}>
                    {Object.keys(stats).map((stat) => {
                      const key = stat as keyof typeof stats;
                      return (
                        <View key={stat} style={styles.statField}>
                          <ThemedText type="code" style={{ fontSize: 10, color: theme.textSecondary }}>
                            {stat.slice(0, 3).toUpperCase()}
                          </ThemedText>
                          <TextInput
                            style={[styles.statInput, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}
                            keyboardType="numeric"
                            value={stats[key].toString()}
                            onChangeText={(txt) => {
                              const val = parseInt(txt) || 0;
                              setStats((prev) => ({ ...prev, [key]: val }));
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.createBtn,
                    !name.trim() && { opacity: 0.5 },
                    pressed && { opacity: 0.8 },
                  ]}
                  disabled={!name.trim()}
                  onPress={createCharacter}>
                  <ThemedText style={styles.createBtnText}>💾 Save & View Character</ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          </Animated.View>
        )}

        {activeSubTab === 'sheet' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.fullSize}>
            {selectedChar ? (
              <ScrollView contentContainerStyle={styles.sheetScroll}>
                <View style={styles.sheetHeader}>
                  <View style={styles.avatarBox}>
                    <ThemedText style={styles.avatarEmoji}>
                      {DND_CLASSES.find((c) => c.name === selectedChar.class)?.emoji || '🛡️'}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle" style={styles.sheetName}>
                      {selectedChar.name}
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ color: '#D81921' }}>
                      Level 1 {selectedChar.race} {selectedChar.class}
                    </ThemedText>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      deleteCharacter(selectedChar.id);
                    }}>
                    <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
                  </Pressable>
                </View>

                <View style={styles.divider} />

                {/* HP, AC, Speed Vitals */}
                <View style={styles.vitalsRow}>
                  <View style={styles.vitalCard}>
                    <ThemedText type="smallBold" themeColor="textSecondary">Hit Points</ThemedText>
                    <ThemedText type="subtitle" style={{ color: '#34c759', fontWeight: 'bold' }}>
                      {selectedChar.hp}
                    </ThemedText>
                  </View>
                  <View style={styles.vitalCard}>
                    <ThemedText type="smallBold" themeColor="textSecondary">Armor Class</ThemedText>
                    <ThemedText type="subtitle" style={{ color: '#ff9500', fontWeight: 'bold' }}>
                      {10 + getModifier(selectedChar.stats.dexterity)}
                    </ThemedText>
                  </View>
                  <View style={styles.vitalCard}>
                    <ThemedText type="smallBold" themeColor="textSecondary">Speed</ThemedText>
                    <ThemedText type="subtitle" style={{ color: '#007aff', fontWeight: 'bold' }}>
                      {selectedChar.speed} ft.
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Ability Scores */}
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Ability Scores
                </ThemedText>
                <View style={styles.scoresGrid}>
                  {Object.entries(selectedChar.stats).map(([stat, val]) => {
                    const mod = getModifier(val);
                    const modText = mod >= 0 ? `+${mod}` : `${mod}`;
                    return (
                      <View key={stat} style={styles.scoreBox}>
                        <ThemedText type="code" style={styles.statLabel}>
                          {stat.slice(0, 3).toUpperCase()}
                        </ThemedText>
                        <ThemedText type="subtitle" style={styles.statScore}>
                          {val}
                        </ThemedText>
                        <View style={styles.modBadge}>
                          <ThemedText style={styles.modText}>{modText}</ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.divider} />

                {/* Saving Throws */}
                <View style={styles.savesContainer}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Saving Throw Proficiencies
                  </ThemedText>
                  <View style={styles.savesRow}>
                    {selectedChar.savingThrows.map((save) => (
                      <View key={save} style={styles.saveTag}>
                        <ThemedText style={styles.saveTagText}>{save}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.centerContent}>
                <ThemedText style={styles.emptyText} themeColor="textSecondary">
                  🧙‍♂️ No character selected. Create a character in the **Builder** tab or randomize one to inspect it here.
                </ThemedText>
              </View>
            )}
          </Animated.View>
        )}

        {activeSubTab === 'party' && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.fullSize}>
            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.four }}>
              {characters.length > 0 ? (
                <View style={styles.charListContainer}>
                  <ThemedText type="smallBold" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                    Your Party ({characters.length} Member{characters.length > 1 ? 's' : ''})
                  </ThemedText>
                  {characters.map((c) => {
                    const isActive = c.id === selectedCharId;
                    return (
                      <Pressable
                        key={c.id}
                        style={({ hovered }) => [
                          styles.charListItem,
                          {
                            backgroundColor: isActive ? theme.backgroundSelected : theme.backgroundElement,
                            borderColor: theme.backgroundSelected,
                          },
                          hovered && { backgroundColor: theme.backgroundSelected },
                        ]}
                        onPress={() => {
                          setSelectedCharId(c.id);
                          setActiveSubTab('sheet');
                        }}>
                        <View style={styles.partyItemLeft}>
                          <View style={styles.partyAvatar}>
                            <ThemedText style={{ fontSize: 18 }}>
                              {DND_CLASSES.find((cl) => cl.name === c.class)?.emoji || '🛡️'}
                            </ThemedText>
                          </View>
                          <View>
                            <ThemedText type="smallBold">{c.name}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                              {c.race} {c.class} • HP: {c.hp} • AC: {10 + getModifier(c.stats.dexterity)}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={styles.partyItemRight}>
                          <Pressable
                            style={({ pressed }) => [styles.partyDeleteBtn, pressed && { opacity: 0.7 }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              deleteCharacter(c.id);
                            }}>
                            <ThemedText style={styles.partyDeleteText}>🗑️</ThemedText>
                          </Pressable>
                          <ThemedText style={{ fontSize: 20, color: theme.textSecondary, marginLeft: Spacing.one }}>
                            ›
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.centerContent}>
                  <ThemedText style={styles.emptyText} themeColor="textSecondary">
                    👥 Your party is empty. Go to the **Builder** tab to create adventurers.
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.three,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    gap: Spacing.two,
  },
  title: {
    color: '#D81921',
    fontWeight: 'bold',
  },
  randomBtn: {
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    borderWidth: 1,
    borderColor: '#D81921',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  randomBtnText: {
    color: '#D81921',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Spacing.two,
    padding: 3,
    marginBottom: Spacing.three,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.one,
  },
  activeTabBtn: {
    backgroundColor: '#D81921',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#aaa',
  },
  activeTabBtnText: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  fullSize: {
    flex: 1,
  },
  scrollColumn: {
    flex: 1,
  },
  formCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.1)',
    gap: Spacing.four,
    borderCurve: 'continuous',
  },
  formSectionTitle: {
    fontSize: 16,
    color: '#D81921',
  },
  formGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#aaa',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cardPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 1,
    gap: Spacing.one,
  },
  cardEmoji: {
    fontSize: 14,
  },
  cardBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  statField: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  statInput: {
    width: '100%',
    height: 35,
    borderWidth: 1,
    borderRadius: Spacing.two,
    textAlign: 'center',
    fontSize: 13,
  },
  createBtn: {
    backgroundColor: '#D81921',
    height: 45,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.1)',
    borderRadius: Spacing.three,
    borderStyle: 'dashed',
    minHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sheetScroll: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 25, 33, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D81921',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  sheetName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  deleteButtonText: {
    color: '#e53e3e',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    marginVertical: Spacing.three,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  vitalCard: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#D81921',
    marginBottom: Spacing.two,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  scoreBox: {
    width: '30%',
    minWidth: 80,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    gap: Spacing.half,
  },
  statLabel: {
    fontSize: 11,
  },
  statScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modBadge: {
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  modText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D81921',
  },
  savesContainer: {
    gap: Spacing.one,
  },
  savesRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  saveTag: {
    backgroundColor: '#D81921',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  saveTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  charListContainer: {
    marginTop: Spacing.two,
  },
  charListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    marginVertical: Spacing.one,
  },
  partyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  partyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyDeleteBtn: {
    padding: Spacing.one,
  },
  partyDeleteText: {
    fontSize: 16,
  },
});
