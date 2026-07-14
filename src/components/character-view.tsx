import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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

  const [activeSubTab, setActiveSubTab] = useState<CharacterSubTab>('sheet');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [isBuildingNew, setIsBuildingNew] = useState(false);

  // Seed default characters so the interface is not empty initially
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'char_1',
      name: 'Thorrall Ironbreaker',
      class: 'Cleric',
      race: 'Dwarf',
      stats: { strength: 14, dexterity: 8, constitution: 16, intelligence: 10, wisdom: 15, charisma: 12 },
      hp: 11,
      speed: 25,
      savingThrows: ['WIS', 'CHA'],
    },
    {
      id: 'char_2',
      name: 'Elysia Moonwhisper',
      class: 'Wizard',
      race: 'Elf',
      stats: { strength: 8, dexterity: 15, constitution: 12, intelligence: 16, wisdom: 13, charisma: 10 },
      hp: 7,
      speed: 30,
      savingThrows: ['INT', 'WIS'],
    },
  ]);

  // Form State for Builder / Editor
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

  // Prepopulate form when editing an existing character
  useEffect(() => {
    if (selectedCharId && activeSubTab === 'builder' && !isBuildingNew) {
      const char = characters.find((c) => c.id === selectedCharId);
      if (char) {
        setName(char.name);
        const cls = DND_CLASSES.find((c) => c.name === char.class) || DND_CLASSES[4];
        const rc = DND_RACES.find((r) => r.name === char.race) || DND_RACES[3];
        setSelectedClass(cls);
        setSelectedRace(rc);
        setStats({ ...char.stats });
      }
    }
  }, [selectedCharId, activeSubTab, isBuildingNew]);

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  // Roll 4d6 and drop the lowest
  const rollStat = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls[1] + rolls[2] + rolls[3];
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

  const saveCharacter = () => {
    if (!name.trim()) return;

    const conMod = getModifier(stats.constitution);
    const hitDie = selectedClass.hitDie;
    const hp = hitDie + conMod;
    const speed = selectedRace.speed + selectedClass.speedBonus;

    if (selectedCharId && !isBuildingNew) {
      // Edit existing character
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === selectedCharId
            ? {
                ...c,
                name,
                class: selectedClass.name,
                race: selectedRace.name,
                stats: { ...stats },
                hp: hp > 0 ? hp : 1,
                speed,
                savingThrows: [...selectedClass.saves],
              }
            : c
        )
      );
      setActiveSubTab('sheet');
    } else {
      // Create new character
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
      setIsBuildingNew(false);
      resetForm();
      setActiveSubTab('sheet');
    }
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
    setIsBuildingNew(false);
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

  // ────────────────────────────────────────────────────────────────────────────
  // CHARACTER HUB SELECTOR VIEW (DEFAULT STATE)
  // ────────────────────────────────────────────────────────────────────────────
  if (!selectedCharId && !isBuildingNew) {
    return (
      <View style={styles.container}>
        <View style={styles.mainHeader}>
          <ThemedText type="subtitle" style={styles.title}>
            🧙‍♂️ Character Hub
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Pressable
              style={({ pressed }) => [styles.randomBtn, pressed && { opacity: 0.8 }]}
              onPress={generateRandom}>
              <ThemedText style={styles.randomBtnText}>🎲 Quick Random</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                setIsBuildingNew(true);
                resetForm();
                setActiveSubTab('builder');
              }}>
              <ThemedText style={styles.createBtnText}>+ New Character</ThemedText>
            </Pressable>
          </View>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Select a character sheet from your vault to view details, edit stats, or manage your party:
        </ThemedText>

        <ScrollView contentContainerStyle={styles.vaultList}>
          {characters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={{ fontStyle: 'italic', textAlign: 'center' }} themeColor="textSecondary">
                Your character vault is currently empty. Click '+ New Character' above to forge a hero!
              </ThemedText>
            </View>
          ) : (
            characters.map((c) => (
              <Pressable
                key={c.id}
                style={({ hovered, pressed }) => [
                  styles.vaultCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                  hovered && { borderColor: '#D81921' },
                  pressed && { opacity: 0.95 },
                ]}
                onPress={() => {
                  setSelectedCharId(c.id);
                  setActiveSubTab('sheet');
                }}>
                <View style={styles.vaultAvatar}>
                  <ThemedText style={{ fontSize: 24 }}>
                    {DND_CLASSES.find((cls) => cls.name === c.class)?.emoji || '🛡️'}
                  </ThemedText>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {c.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Level 1 {c.race} {c.class}
                  </ThemedText>
                  <View style={styles.vaultCardMeta}>
                    <ThemedText style={styles.metaBadge}>❤️ {c.hp} HP</ThemedText>
                    <ThemedText style={styles.metaBadge}>👟 {c.speed} ft</ThemedText>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.vaultDeleteBtn, pressed && { opacity: 0.7 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteCharacter(c.id);
                  }}>
                  <ThemedText style={{ color: '#e53e3e', fontSize: 12 }}>Delete</ThemedText>
                </Pressable>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ACTIVE CHARACTER TABS VIEW (DETAILS & BUILDER)
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Red/Dark Sub-Header Bar with Navigation Back-Link */}
      <View style={styles.mainHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <Pressable
            style={({ pressed }) => [styles.hubBackBtn, pressed && { opacity: 0.8 }]}
            onPress={() => {
              setSelectedCharId(null);
              setIsBuildingNew(false);
            }}>
            <ThemedText style={styles.hubBackBtnText}>← Hub</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.title}>
            {isBuildingNew ? '🛠️ Character Builder' : `${selectedChar?.name.split(' ')[0]}'s Sheet`}
          </ThemedText>
        </View>

        {isBuildingNew && (
          <Pressable
            style={({ pressed }) => [styles.randomBtn, pressed && { opacity: 0.8 }]}
            onPress={generateRandom}>
            <ThemedText style={styles.randomBtnText}>🎲 Quick Randomizer</ThemedText>
          </Pressable>
        )}
      </View>

      {/* Tab Navigation (Only show if not building a new character) */}
      {!isBuildingNew && (
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabBtn, activeSubTab === 'sheet' && styles.activeTabBtn]}
            onPress={() => setActiveSubTab('sheet')}>
            <ThemedText style={[styles.tabBtnText, activeSubTab === 'sheet' && styles.activeTabBtnText]}>
              📜 Sheet
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeSubTab === 'builder' && styles.activeTabBtn]}
            onPress={() => setActiveSubTab('builder')}>
            <ThemedText style={[styles.tabBtnText, activeSubTab === 'builder' && styles.activeTabBtnText]}>
              🛠️ Editor
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
      )}

      {/* Tab Content Panels */}
      <View style={styles.tabContent}>
        {(activeSubTab === 'builder' || isBuildingNew) && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.fullSize}>
            <ScrollView style={styles.scrollColumn} contentContainerStyle={{ paddingBottom: Spacing.six }}>
              <ThemedView type="backgroundElement" style={styles.formCard}>
                <ThemedText type="smallBold" style={styles.formSectionTitle}>
                  {selectedCharId && !isBuildingNew ? 'Edit Character Attributes' : 'Forge a New Character'}
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
                  onPress={saveCharacter}>
                  <ThemedText style={styles.createBtnText}>
                    {selectedCharId && !isBuildingNew ? '💾 Update Attributes' : '💾 Forge Character'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          </Animated.View>
        )}

        {activeSubTab === 'sheet' && !isBuildingNew && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.fullSize}>
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

                {/* HP & Speed Cards */}
                <View style={styles.coreStatsRow}>
                  <ThemedView type="backgroundElement" style={styles.coreStatCard}>
                    <ThemedText type="small" themeColor="textSecondary">HIT POINTS</ThemedText>
                    <ThemedText type="title" style={{ color: '#D81921', fontSize: 28 }}>{selectedChar.hp}</ThemedText>
                  </ThemedView>
                  <ThemedView type="backgroundElement" style={styles.coreStatCard}>
                    <ThemedText type="small" themeColor="textSecondary">SPEED</ThemedText>
                    <ThemedText type="title" style={{ fontSize: 28 }}>{selectedChar.speed} ft</ThemedText>
                  </ThemedView>
                </View>

                {/* Abilities */}
                <ThemedText type="smallBold" style={styles.subTitle}>Ability Scores</ThemedText>
                <View style={styles.abilitiesGrid}>
                  {Object.entries(selectedChar.stats).map(([stat, val]) => {
                    const mod = getModifier(val);
                    return (
                      <ThemedView key={stat} type="backgroundElement" style={styles.statCard}>
                        <ThemedText type="code" style={styles.statLabel}>
                          {stat.slice(0, 3).toUpperCase()}
                        </ThemedText>
                        <ThemedText style={styles.statScore}>{val}</ThemedText>
                        <View style={styles.modBadge}>
                          <ThemedText style={styles.modText}>{mod >= 0 ? `+${mod}` : mod}</ThemedText>
                        </View>
                      </ThemedView>
                    );
                  })}
                </View>

                {/* Saving Throws */}
                <View style={{ marginTop: Spacing.four }}>
                  <ThemedText type="smallBold" style={styles.subTitle}>Saving Throws</ThemedText>
                  <View style={styles.savesContainer}>
                    <View style={styles.savesRow}>
                      {selectedChar.savingThrows.map((save) => (
                        <View key={save} style={styles.saveTag}>
                          <ThemedText style={styles.saveTagText}>{save} Proficient</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.centerContent}>
                <ThemedText themeColor="textSecondary">No character loaded.</ThemedText>
              </View>
            )}
          </Animated.View>
        )}

        {activeSubTab === 'party' && !isBuildingNew && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.fullSize}>
            <ScrollView contentContainerStyle={{ padding: Spacing.three }}>
              <ThemedText type="smallBold" style={styles.subTitle}>Active Party Vault</ThemedText>
              <View style={styles.charListContainer}>
                {characters.map((item) => (
                  <ThemedView
                    key={item.id}
                    type="backgroundElement"
                    style={[
                      styles.charListItem,
                      { borderColor: theme.backgroundSelected },
                      item.id === selectedCharId && { borderColor: '#D81921' },
                    ]}>
                    <View style={styles.partyItemLeft}>
                      <View style={styles.partyAvatar}>
                        <ThemedText style={{ fontSize: 18 }}>
                          {DND_CLASSES.find((c) => c.name === item.class)?.emoji || '🛡️'}
                        </ThemedText>
                      </View>
                      <View>
                        <ThemedText type="smallBold">{item.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          Level 1 {item.race} {item.class}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.partyItemRight}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.hubBackBtn,
                          { marginRight: 8, paddingVertical: 4, paddingHorizontal: 8 },
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => setSelectedCharId(item.id)}>
                        <ThemedText style={{ fontSize: 11, color: '#D81921', fontWeight: 'bold' }}>Load</ThemedText>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [styles.partyDeleteBtn, pressed && { opacity: 0.7 }]}
                        onPress={() => deleteCharacter(item.id)}>
                        <ThemedText style={styles.partyDeleteText}>🗑️</ThemedText>
                      </Pressable>
                    </View>
                  </ThemedView>
                ))}
              </View>
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
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#1c1c1c',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontWeight: 'bold',
    color: '#D81921',
  },
  subtitle: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
    fontSize: 13,
  },
  randomBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.4)',
  },
  randomBtnText: {
    color: '#D81921',
    fontWeight: 'bold',
    fontSize: 12,
  },
  createBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#D81921',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  hubBackBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#2d2d2d',
    borderWidth: 1,
    borderColor: '#3e3e3e',
  },
  hubBackBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  vaultList: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    gap: Spacing.three,
  },
  vaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaultCardMeta: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: 2,
  },
  metaBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#aaa',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  vaultDeleteBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  emptyContainer: {
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
    backgroundColor: '#151515',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  activeTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: '#D81921',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  activeTabBtnText: {
    color: '#D81921',
  },
  tabContent: {
    flex: 1,
  },
  fullSize: {
    flex: 1,
  },
  scrollColumn: {
    flex: 1,
    padding: Spacing.three,
  },
  formCard: {
    padding: Spacing.four,
    borderRadius: Spacing.two,
    gap: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.1)',
  },
  formSectionTitle: {
    fontSize: 16,
    color: '#D81921',
  },
  formGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
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
    fontSize: 11,
    fontWeight: '500',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  statField: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.one,
  },
  statInput: {
    width: '100%',
    height: 36,
    borderWidth: 1,
    borderRadius: Spacing.one,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sheetScroll: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  sheetName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
  },
  deleteButtonText: {
    color: '#e53e3e',
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#2d2d2d',
    marginVertical: Spacing.three,
  },
  coreStatsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  coreStatCard: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  subTitle: {
    fontSize: 14,
    color: '#D81921',
    marginBottom: Spacing.two,
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statCard: {
    width: '30%',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
