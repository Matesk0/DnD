import React, { useState, useEffect, useMemo } from 'react';
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
import { useRuleset } from '@/hooks/useRuleset';
import { Lineicons } from '@lineiconshq/react-native-lineicons';
import { Book1Stroke, Pencil1Stroke, UserMultiple4Stroke, User4Stroke, PlusStroke, GamePadModern1Stroke, HeartStroke, Bolt2Stroke, Shield2Stroke, MagicOutlined } from '@lineiconshq/free-icons';

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
  level: number;
  spells: string;
  ruleset: string;
}

const DND_CLASSES = [
  { name: 'Barbarian', hitDie: 12, saves: ['STR', 'CON'], speedBonus: 10, icon: Shield2Stroke },
  { name: 'Bard', hitDie: 8, saves: ['DEX', 'CHA'], speedBonus: 0, icon: MagicOutlined },
  { name: 'Cleric', hitDie: 8, saves: ['WIS', 'CHA'], speedBonus: 0, icon: MagicOutlined },
  { name: 'Druid', hitDie: 8, saves: ['INT', 'WIS'], speedBonus: 0, icon: MagicOutlined },
  { name: 'Fighter', hitDie: 10, saves: ['STR', 'CON'], speedBonus: 0, icon: Shield2Stroke },
  { name: 'Monk', hitDie: 8, saves: ['STR', 'DEX'], speedBonus: 10, icon: Shield2Stroke },
  { name: 'Paladin', hitDie: 10, saves: ['WIS', 'CHA'], speedBonus: 0, icon: Shield2Stroke },
  { name: 'Ranger', hitDie: 10, saves: ['STR', 'DEX'], speedBonus: 0, icon: Shield2Stroke },
  { name: 'Rogue', hitDie: 8, saves: ['DEX', 'INT'], speedBonus: 0, icon: Shield2Stroke },
  { name: 'Sorcerer', hitDie: 6, saves: ['CON', 'CHA'], speedBonus: 0, icon: MagicOutlined },
  { name: 'Warlock', hitDie: 8, saves: ['WIS', 'CHA'], speedBonus: 0, icon: MagicOutlined },
  { name: 'Wizard', hitDie: 6, saves: ['INT', 'WIS'], speedBonus: 0, icon: MagicOutlined },
];

const DND_RACES = [
  { name: 'Dwarf', speed: 25, bonus: { constitution: 2 }, icon: User4Stroke },
  { name: 'Elf', speed: 30, bonus: { dexterity: 2 }, icon: User4Stroke },
  { name: 'Halfling', speed: 25, bonus: { dexterity: 2 }, icon: User4Stroke },
  { name: 'Human', speed: 30, bonus: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 }, icon: User4Stroke },
  { name: 'Dragonborn', speed: 30, bonus: { strength: 2, charisma: 1 }, icon: User4Stroke },
  { name: 'Gnome', speed: 25, bonus: { intelligence: 2 }, icon: User4Stroke },
  { name: 'Half-Elf', speed: 30, bonus: { charisma: 2, dexterity: 1, constitution: 1 }, icon: User4Stroke },
  { name: 'Half-Orc', speed: 30, bonus: { strength: 2, constitution: 1 }, icon: User4Stroke },
  { name: 'Tiefling', speed: 30, bonus: { charisma: 2, intelligence: 1 }, icon: User4Stroke },
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
  const { ruleset } = useRuleset();
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
      level: 1,
      spells: 'Sacred Flame, Guidance, Cure Wounds, Bless',
      ruleset: '5e',
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
      level: 1,
      spells: 'Fire Bolt, Mage Hand, Magic Missile, Shield',
      ruleset: '5e',
    },
    {
      id: 'char_pf2e_1',
      name: 'Valeros',
      class: 'Fighter',
      race: 'Human',
      stats: { strength: 18, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 10 },
      hp: 20,
      speed: 25,
      savingThrows: ['STR', 'CON'],
      level: 1,
      spells: '',
      ruleset: 'pf2e',
    },
  ]);

  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => c.ruleset === ruleset);
  }, [characters, ruleset]);

  // Reset selected character when ruleset changes
  useEffect(() => {
    const matching = characters.filter((c) => c.ruleset === ruleset);
    setSelectedCharId(matching[0]?.id || null);
    setIsBuildingNew(false);
    setActiveSubTab('sheet');
  }, [ruleset]);

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
  const [level, setLevel] = useState(1);
  const [spells, setSpells] = useState('');

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
        setLevel(char.level || 1);
        setSpells(char.spells || '');
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
    // HP = Max at level 1 + Average for remaining + Con mod per level
    const hp = hitDie + Math.floor(hitDie / 2 + 1) * (level > 1 ? level - 1 : 0) + (conMod * level);
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
                level,
                spells,
                ruleset,
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
        level,
        spells,
        ruleset,
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
      level: 1,
      spells: '',
      ruleset,
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
    setLevel(1);
    setSpells('');
  };

  const selectedChar = characters.find((c) => c.id === selectedCharId);

  // ────────────────────────────────────────────────────────────────────────────
  // CHARACTER HUB SELECTOR VIEW (DEFAULT STATE)
  // ────────────────────────────────────────────────────────────────────────────
  if (!selectedCharId && !isBuildingNew) {
    return (
      <View style={styles.container}>
        <View style={styles.mainHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Lineicons icon={User4Stroke} size={24} color="#dfb15b" />
            <ThemedText type="subtitle" style={styles.title}>
              Character Hub
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Pressable
              style={({ pressed }) => [styles.randomBtn, pressed && { opacity: 0.8 }]}
              onPress={generateRandom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Lineicons icon={GamePadModern1Stroke} size={13} color="#fff" />
                <ThemedText style={styles.randomBtnText}>Quick Random</ThemedText>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                setIsBuildingNew(true);
                resetForm();
                setActiveSubTab('builder');
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Lineicons icon={PlusStroke} size={13} color="#fff" />
                <ThemedText style={styles.createBtnText}>New Character</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Select a character sheet from your vault to view details, edit stats, or manage your party:
        </ThemedText>

        <ScrollView contentContainerStyle={styles.vaultList}>
          {filteredCharacters.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={{ fontStyle: 'italic', textAlign: 'center' }} themeColor="textSecondary">
                Your character vault is currently empty. Click '+ New Character' above to forge a hero!
              </ThemedText>
            </View>
          ) : (
            filteredCharacters.map((c: Character) => (
              <Pressable
                key={c.id}
                style={({ hovered, pressed }) => [
                  styles.vaultCard,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                  hovered && {
                    borderColor: '#dfb15b',
                    shadowColor: '#dfb15b',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                  pressed && { opacity: 0.95 },
                ]}
                onPress={() => {
                  setSelectedCharId(c.id);
                  setActiveSubTab('sheet');
                }}>
                <View style={styles.vaultAvatar}>
                  <Lineicons icon={User4Stroke} size={20} color="#dfb15b" />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText type="subtitle" style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {c.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Level {c.level} {c.race} {c.class}
                  </ThemedText>
                  <View style={styles.vaultCardMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: Spacing.two }}>
                      <Lineicons icon={HeartStroke} size={11} color="#dfb15b" />
                      <ThemedText style={styles.metaBadge}>{c.hp} HP</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Lineicons icon={Bolt2Stroke} size={11} color="#dfb15b" />
                      <ThemedText style={styles.metaBadge}>{c.speed} ft</ThemedText>
                    </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lineicons icon={Book1Stroke} size={14} color={activeSubTab === 'sheet' ? '#dfb15b' : '#888'} />
              <ThemedText style={[styles.tabBtnText, activeSubTab === 'sheet' && styles.activeTabBtnText]}>
                Sheet
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeSubTab === 'builder' && styles.activeTabBtn]}
            onPress={() => setActiveSubTab('builder')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lineicons icon={Pencil1Stroke} size={14} color={activeSubTab === 'builder' ? '#dfb15b' : '#888'} />
              <ThemedText style={[styles.tabBtnText, activeSubTab === 'builder' && styles.activeTabBtnText]}>
                Editor
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, activeSubTab === 'party' && styles.activeTabBtn]}
            onPress={() => setActiveSubTab('party')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lineicons icon={UserMultiple4Stroke} size={14} color={activeSubTab === 'party' ? '#dfb15b' : '#888'} />
              <ThemedText style={[styles.tabBtnText, activeSubTab === 'party' && styles.activeTabBtnText]}>
                Party ({filteredCharacters.length})
              </ThemedText>
            </View>
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

                {/* Level Input */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Character Level
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}
                    keyboardType="numeric"
                    value={level.toString()}
                    onChangeText={(txt) => setLevel(parseInt(txt) || 1)}
                  />
                  <ThemedText type="small" style={{ color: '#dfb15b', marginTop: 4 }}>
                    Auto-calculated: Proficiency +{Math.floor(2 + (level - 1) / 4)}, Max Spell Level: {Math.ceil(level / 2)}
                  </ThemedText>
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
                            isSelected && { backgroundColor: '#dfb15b', borderColor: '#dfb15b' },
                          ]}
                          onPress={() => setSelectedRace(race)}>
                          <View style={{ marginVertical: Spacing.one }}>
                            <Lineicons icon={race.icon} size={18} color={isSelected ? '#fff' : '#dfb15b'} />
                          </View>
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
                            isSelected && { backgroundColor: '#dfb15b', borderColor: '#dfb15b' },
                          ]}
                          onPress={() => setSelectedClass(cls)}>
                          <View style={{ marginVertical: Spacing.one }}>
                            <Lineicons icon={cls.icon} size={18} color={isSelected ? '#fff' : '#dfb15b'} />
                          </View>
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
                      <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>
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

                {/* Spells Input */}
                <View style={styles.formGroup}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                    Spells Known
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top', color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}
                    placeholder="e.g. Fireball, Shield, Mage Armor..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    value={spells}
                    onChangeText={setSpells}
                  />
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
                    {(() => {
                      const cls = DND_CLASSES.find((c) => c.name === selectedChar.class);
                      return <Lineicons icon={cls?.icon || Shield2Stroke} size={24} color="#dfb15b" />;
                    })()}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle" style={styles.sheetName}>
                      {selectedChar.name}
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>
                      Level {selectedChar.level} {selectedChar.race} {selectedChar.class}
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
                    <ThemedText type="title" style={{ color: '#dfb15b', fontSize: 28 }}>{selectedChar.hp}</ThemedText>
                  </ThemedView>
                  <ThemedView type="backgroundElement" style={styles.coreStatCard}>
                    <ThemedText type="small" themeColor="textSecondary">SPEED</ThemedText>
                    <ThemedText type="title" style={{ fontSize: 28 }}>{selectedChar.speed} ft</ThemedText>
                  </ThemedView>
                  <ThemedView type="backgroundElement" style={styles.coreStatCard}>
                    <ThemedText type="small" themeColor="textSecondary">PROFICIENCY</ThemedText>
                    <ThemedText type="title" style={{ color: '#dfb15b', fontSize: 28 }}>+{Math.floor(2 + (selectedChar.level - 1) / 4)}</ThemedText>
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

                {/* Spells Display */}
                {selectedChar.spells && selectedChar.spells.trim().length > 0 && (
                  <View style={{ marginTop: Spacing.four }}>
                    <ThemedText type="smallBold" style={styles.subTitle}>Spells Known</ThemedText>
                    <ThemedView type="backgroundElement" style={{ padding: Spacing.three, borderRadius: Spacing.two, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' }}>
                      <ThemedText style={{ lineHeight: 22 }}>{selectedChar.spells}</ThemedText>
                    </ThemedView>
                  </View>
                )}
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
                {filteredCharacters.map((item: Character) => (
                  <ThemedView
                    key={item.id}
                    type="backgroundElement"
                    style={[
                      styles.charListItem,
                      { borderColor: theme.backgroundSelected },
                      item.id === selectedCharId && { borderColor: '#dfb15b' },
                    ]}>
                    <View style={styles.partyItemLeft}>
                      <View style={styles.partyAvatar}>
                        {(() => {
                          const cls = DND_CLASSES.find((c) => c.name === item.class);
                          return <Lineicons icon={cls?.icon || Shield2Stroke} size={18} color="#dfb15b" />;
                        })()}
                      </View>
                      <View>
                        <ThemedText type="smallBold">{item.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          Level {item.level} {item.race} {item.class}
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
                        <ThemedText style={{ fontSize: 11, color: '#dfb15b', fontWeight: 'bold' }}>Load</ThemedText>
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
    color: '#dfb15b',
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
    color: '#dfb15b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  createBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#dfb15b',
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
    borderBottomColor: '#dfb15b',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  activeTabBtnText: {
    color: '#dfb15b',
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
    color: '#dfb15b',
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
    color: '#dfb15b',
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
    color: '#dfb15b',
  },
  savesContainer: {
    gap: Spacing.one,
  },
  savesRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  saveTag: {
    backgroundColor: '#dfb15b',
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
