import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { dndApi, DndListItem } from '@/services/dnd-api';
import { SpellsView } from './spells-view';
import { ClassesView } from './classes-view';
import { RacesView } from './races-view';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LoadingSpinner } from './loading-spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CompendiumSection =
  | 'menu'
  | 'spells'
  | 'races'
  | 'classes'
  | 'backgrounds'
  | 'feats'
  | 'items'
  | 'chronicles'
  | 'racial_feats'
  | 'misc'
  | 'homebrew'
  | 'ua';

interface CompendiumItem {
  id: CompendiumSection;
  title: string;
  emoji: string;
  desc: string;
  source: 'api' | 'static';
}

const COMPENDIUM_SECTIONS: CompendiumItem[] = [
  { id: 'spells', title: 'Spells', emoji: '🪄', desc: 'Browse all official spell descriptions, levels, and magic schools.', source: 'api' },
  { id: 'races', title: 'Races', emoji: '🧝', desc: 'View racial adjustments, size, speeds, and ancestral traits.', source: 'api' },
  { id: 'classes', title: 'Classes', emoji: '🛡️', desc: 'Inspect class hit dice, saving throws, and subclasses.', source: 'api' },
  { id: 'backgrounds', title: 'Backgrounds', emoji: '📜', desc: 'Acquire proficiencies and feature tables from character origins.', source: 'api' },
  { id: 'items', title: 'Items & Magic Loot', emoji: '⚔️', desc: 'Inspect general weapons, armor, tools, and enchanted magic items.', source: 'api' },
  { id: 'feats', title: 'Feats', emoji: '⚡', desc: 'Search custom training advantages and requirements.', source: 'api' },
  { id: 'chronicles', title: 'Heroic Chronicles', emoji: '📖', desc: 'Flesh out family histories, ally relations, and fated prophecies.', source: 'static' },
  { id: 'racial_feats', title: 'Racial Feats', emoji: '🧬', desc: 'Ancestry-specific feats (e.g. Elven Accuracy, Bountiful Luck).', source: 'static' },
  { id: 'misc', title: 'Miscellaneous Rules', emoji: '⚙️', desc: 'Review active conditions, combat actions, and stats variables.', source: 'static' },
  { id: 'homebrew', title: 'Homebrew Workshop', emoji: '🧪', desc: 'Create and log your own custom homebrew creations.', source: 'static' },
  { id: 'ua', title: 'Unearthed Arcana', emoji: '🌌', desc: 'Review official playtest subclasses and test features.', source: 'static' },
];

export function CompendiumView() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [activeSection, setActiveSection] = useState<CompendiumSection>('menu');

  // Generic List State for Backgrounds, Feats, Items (Equipment/Magic Items)
  const [listData, setListData] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeTab, setItemTypeTab] = useState<'standard' | 'magic'>('standard');

  // Details State
  const [selectedItemIndex, setSelectedItemIndex] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load generic lists depending on section
  useEffect(() => {
    if (activeSection === 'menu' || ['spells', 'races', 'classes', 'chronicles', 'racial_feats', 'misc', 'homebrew', 'ua'].includes(activeSection)) {
      setListData([]);
      setSelectedItemIndex(null);
      return;
    }

    async function loadData() {
      try {
        setLoadingList(true);
        setListData([]);
        setSelectedItemIndex(null);
        setDetailsData(null);

        let data: DndListItem[] = [];
        if (activeSection === 'backgrounds') {
          data = await dndApi.getBackgrounds();
        } else if (activeSection === 'feats') {
          data = await dndApi.getFeats();
        } else if (activeSection === 'items') {
          if (itemTypeTab === 'standard') {
            data = await dndApi.getEquipment();
          } else {
            data = await dndApi.getMagicItems();
          }
        }
        setListData(data);
      } catch (err) {
        console.error('Failed to load list in compendium:', err);
      } finally {
        setLoadingList(false);
      }
    }
    loadData();
  }, [activeSection, itemTypeTab]);

  // Load generic item details
  useEffect(() => {
    const index = selectedItemIndex;
    if (!index) {
      setDetailsData(null);
      return;
    }

    async function loadDetails() {
      try {
        setLoadingDetails(true);
        setDetailsData(null);
        let data: any = null;

        if (activeSection === 'backgrounds') {
          data = await dndApi.getBackgroundDetails(index!);
        } else if (activeSection === 'feats') {
          data = await dndApi.getFeatDetails(index!);
        } else if (activeSection === 'items') {
          if (itemTypeTab === 'standard') {
            data = await dndApi.getEquipmentDetails(index!);
          } else {
            data = await dndApi.getMagicItemDetails(index!);
          }
        }
        setDetailsData(data);
      } catch (err) {
        console.error('Failed to load details in compendium:', err);
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [selectedItemIndex]);

  // Filtered generic list
  const filteredList = useMemo(() => {
    return listData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listData, searchQuery]);

  // Homebrew state
  const [homebrewTitle, setHomebrewTitle] = useState('');
  const [homebrewType, setHomebrewType] = useState('Spell');
  const [homebrewBody, setHomebrewBody] = useState('');
  const [homebrewList, setHomebrewList] = useState<any[]>([
    {
      title: 'Orb of Eldritch Doom',
      type: 'Magic Item',
      body: 'Requires attunement by a Warlock. This dark obsidian orb allows you to cast Eldritch Blast with an extra 1d6 force damage.',
    },
  ]);

  const saveHomebrew = () => {
    if (!homebrewTitle.trim() || !homebrewBody.trim()) return;
    setHomebrewList((prev) => [
      { title: homebrewTitle, type: homebrewType, body: homebrewBody },
      ...prev,
    ]);
    setHomebrewTitle('');
    setHomebrewBody('');
  };

  // Render generic list item details
  const renderItemDetails = () => {
    if (loadingDetails) return <LoadingSpinner message="Consulting library maps..." />;
    if (!detailsData) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={{ fontStyle: 'italic' }} themeColor="textSecondary">
            📜 Select an entry to read its description.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailsScroll}>
        <ThemedText type="subtitle" style={styles.detailsTitle}>
          {detailsData.name}
        </ThemedText>
        
        {activeSection === 'items' && itemTypeTab === 'standard' && (
          <ThemedText type="code" style={styles.detailsSub}>
            Cost: {detailsData.cost?.quantity} {detailsData.cost?.unit} | Weight: {detailsData.weight} lbs
          </ThemedText>
        )}

        {activeSection === 'items' && itemTypeTab === 'magic' && (
          <ThemedText type="code" style={styles.detailsSub}>
            Rarity: {detailsData.rarity?.name || 'Uncommon'}
          </ThemedText>
        )}

        <View style={styles.divider} />

        <View style={styles.descSection}>
          {/* Format descriptions */}
          {Array.isArray(detailsData.desc) ? (
            detailsData.desc.map((para: string, idx: number) => (
              <ThemedText key={idx} selectable style={styles.paragraph}>
                {para}
              </ThemedText>
            ))
          ) : (
            <ThemedText selectable style={styles.paragraph}>
              {detailsData.desc || 'No description found.'}
            </ThemedText>
          )}
        </View>

        {/* Render proficiencies for backgrounds */}
        {detailsData.starting_proficiencies && detailsData.starting_proficiencies.length > 0 && (
          <View style={styles.sectionBlock}>
            <ThemedText type="smallBold" style={styles.subHeading}>Proficiencies gained:</ThemedText>
            <View style={styles.tagContainer}>
              {detailsData.starting_proficiencies.map((prof: any, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={[styles.tagText, { color: theme.text }]}>{prof.name}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Feature for Background */}
        {detailsData.feature && (
          <View style={styles.sectionBlock}>
            <ThemedText type="smallBold" style={styles.subHeading}>Feature: {detailsData.feature.name}</ThemedText>
            {detailsData.feature.desc?.map((p: string, idx: number) => (
              <ThemedText key={idx} style={styles.paragraph} themeColor="textSecondary">
                {p}
              </ThemedText>
            ))}
          </View>
        )}

        {/* Prerequisites for feats */}
        {detailsData.prerequisites && detailsData.prerequisites.length > 0 && (
          <View style={styles.sectionBlock}>
            <ThemedText type="smallBold" style={{ color: '#e53e3e' }}>Prerequisites:</ThemedText>
            {detailsData.prerequisites.map((prereq: any, i: number) => (
              <ThemedText key={i} style={styles.paragraph}>
                {prereq.ability_score?.name ? `${prereq.ability_score.name} ${prereq.minimum_score}+` : prereq.desc}
              </ThemedText>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // Render List view layout
  const renderListLayout = () => {
    return (
      <View style={styles.genericListLayout}>
        <View style={styles.listHeader}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={selectedItemIndex && !isLargeScreen ? () => setSelectedItemIndex(null) : () => setActiveSection('menu')}>
            <ThemedText style={styles.backBtnText}>
              {selectedItemIndex && !isLargeScreen ? '← Back to List' : '← Library Menu'}
            </ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.listTitle}>
            {COMPENDIUM_SECTIONS.find((s) => s.id === activeSection)?.emoji} {COMPENDIUM_SECTIONS.find((s) => s.id === activeSection)?.title}
          </ThemedText>
        </View>

        {selectedItemIndex && !isLargeScreen ? (
          // Mobile Details
          <View style={styles.mobileDetailsContainer}>{renderItemDetails()}</View>
        ) : (
          <View style={styles.columns}>
            <View style={[styles.leftListCol, isLargeScreen && styles.leftListColLarge]}>
              {/* Search */}
              <TextInput
                style={[styles.searchInput, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
                placeholder="Search..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Items standard/magic selector tab */}
              {activeSection === 'items' && (
                <View style={styles.itemsTabs}>
                  <Pressable
                    style={[styles.itemTabBtn, itemTypeTab === 'standard' && styles.activeItemTabBtn]}
                    onPress={() => setItemTypeTab('standard')}>
                    <ThemedText style={[styles.itemTabBtnText, itemTypeTab === 'standard' && styles.activeItemTabBtnText]}>
                      Equipment
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.itemTabBtn, itemTypeTab === 'magic' && styles.activeItemTabBtn]}
                    onPress={() => setItemTypeTab('magic')}>
                    <ThemedText style={[styles.itemTabBtnText, itemTypeTab === 'magic' && styles.activeItemTabBtnText]}>
                      Magic Items
                    </ThemedText>
                  </Pressable>
                </View>
              )}

              {loadingList ? (
                <LoadingSpinner />
              ) : filteredList.length === 0 ? (
                <View style={styles.centerContent}>
                  <ThemedText themeColor="textSecondary">No items found.</ThemedText>
                </View>
              ) : (
                <FlatList
                  data={filteredList}
                  keyExtractor={(item) => item.index}
                  renderItem={({ item }) => {
                    const isSel = item.index === selectedItemIndex;
                    return (
                      <Pressable
                        style={(state: any) => [
                          styles.listItemBtn,
                          {
                            backgroundColor: isSel ? theme.backgroundSelected : 'transparent',
                            borderColor: theme.backgroundElement,
                          },
                          state.hovered && { backgroundColor: theme.backgroundSelected },
                        ]}
                        onPress={() => setSelectedItemIndex(item.index)}>
                        <ThemedText style={styles.listItemText}>{item.name}</ThemedText>
                        <ThemedText style={{ fontSize: 16 }} themeColor="textSecondary">›</ThemedText>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
            {isLargeScreen && (
              <View style={styles.rightDetailsCol}>{renderItemDetails()}</View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render static guides
  const renderStaticGuide = (title: string, content: React.ReactNode) => {
    return (
      <View style={styles.staticLayout}>
        <View style={styles.listHeader}>
          <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => setActiveSection('menu')}>
            <ThemedText style={styles.backBtnText}>← Library Menu</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.listTitle}>
            {title}
          </ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.staticContentScroll}>{content}</ScrollView>
      </View>
    );
  };

  // Render menu selection
  if (activeSection === 'menu') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.menuScroll}>
        <View style={styles.menuHeader}>
          <ThemedText type="subtitle" style={styles.title}>
            📚 Rules & Content Library
          </ThemedText>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Consult the archives of D&D 5th Edition. Browse through official SRD datasets, playtest documents, and homebrew design modules.
          </ThemedText>
        </View>

        <View style={styles.grid}>
          {COMPENDIUM_SECTIONS.map((sec) => (
            <Pressable
              key={sec.id}
              style={(state: any) => [
                styles.menuCard,
                { backgroundColor: theme.backgroundElement },
                state.hovered && styles.cardHover,
                state.pressed && styles.cardPress,
              ]}
              onPress={() => {
                setActiveSection(sec.id);
                setSearchQuery('');
              }}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.emoji}>{sec.emoji}</ThemedText>
                <View>
                  <ThemedText type="smallBold" style={styles.cardTitle}>
                    {sec.title}
                  </ThemedText>
                  <View style={[styles.sourceBadge, { backgroundColor: sec.source === 'api' ? '#D81921' : '#ff9500' }]}>
                    <ThemedText style={styles.sourceText}>{sec.source.toUpperCase()}</ThemedText>
                  </View>
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
                {sec.desc}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Subsections
  if (activeSection === 'spells') {
    return <SpellsView onBack={() => setActiveSection('menu')} />;
  }

  if (activeSection === 'races') {
    return <RacesView onBack={() => setActiveSection('menu')} />;
  }

  if (activeSection === 'classes') {
    return <ClassesView onBack={() => setActiveSection('menu')} />;
  }

  if (['backgrounds', 'feats', 'items'].includes(activeSection)) {
    return renderListLayout();
  }

  // Static Chronicles
  if (activeSection === 'chronicles') {
    return renderStaticGuide(
      '📖 Heroic Chronicles',
      <View style={styles.staticContentBlock}>
        <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 16 }}>Fleshing out Backstories</ThemedText>
        <ThemedText style={styles.paragraph}>
          The Heroic Chronicle is a system designed to tie characters directly to the lore and history of their home realms. It generates relationships, family status, major childhood events, and fateful prophecies.
        </ThemedText>
        
        <ThemedText type="smallBold" style={styles.staticSubHeading}>Rollable Chronicle Tables</ThemedText>
        <View style={styles.staticTable}>
          <View style={styles.tableRowHeader}>
            <ThemedText style={[styles.tableCell, { fontWeight: 'bold' }]}>d10</ThemedText>
            <ThemedText style={[styles.tableCell, { fontWeight: 'bold', flex: 3 }]}>Fateful Prophecy / Event</ThemedText>
          </View>
          <View style={styles.tableRow}>
            <ThemedText style={styles.tableCell}>1</ThemedText>
            <ThemedText style={[styles.tableCell, { flex: 3 }]}>Born under a crimson comet. You possess an innate magical sigil.</ThemedText>
          </View>
          <View style={styles.tableRow}>
            <ThemedText style={styles.tableCell}>5</ThemedText>
            <ThemedText style={[styles.tableCell, { flex: 3 }]}>Accidentally opened a rift to the Shadowfell in childhood. You have a shadow companion.</ThemedText>
          </View>
          <View style={styles.tableRow}>
            <ThemedText style={styles.tableCell}>10</ThemedText>
            <ThemedText style={[styles.tableCell, { flex: 3 }]}>An ancient silver dragon blessed you as a baby. You bear dragon markings.</ThemedText>
          </View>
        </View>
      </View>
    );
  }

  // Static Racial Feats
  if (activeSection === 'racial_feats') {
    return renderStaticGuide(
      '🧬 Racial Feats Reference',
      <View style={styles.staticContentBlock}>
        <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 16 }}>Xanathar\'s Feats for Ancestries</ThemedText>
        <View style={styles.featCard}>
          <ThemedText type="smallBold" style={styles.featTitle}>Elven Accuracy</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Prerequisite: Elf or Half-Elf</ThemedText>
          <ThemedText style={styles.paragraph}>
            Increase your DEX, INT, WIS, or CHA by 1. Whenever you have advantage on an attack roll using one of these scores, you can reroll one of the dice once. (Often called "Triple Advantage").
          </ThemedText>
        </View>

        <View style={styles.featCard}>
          <ThemedText type="smallBold" style={styles.featTitle}>Bountiful Luck</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Prerequisite: Halfling</ThemedText>
          <ThemedText style={styles.paragraph}>
            When an ally you can see within 30 feet rolls a 1 on the d20 for an attack, check, or saving throw, you can use your reaction to let them reroll the die.
          </ThemedText>
        </View>
      </View>
    );
  }

  // Static Misc Rules
  if (activeSection === 'misc') {
    return renderStaticGuide(
      '⚙️ Miscellaneous Rules',
      <View style={styles.staticContentBlock}>
        <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 16 }}>Standard Combat Actions</ThemedText>
        <ThemedText style={styles.paragraph}>
          On your turn, you can take one movement, one action, and potentially one bonus action/reaction. Action choices include: Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, or Use an Object.
        </ThemedText>

        <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 16, marginTop: Spacing.three }}>Active Conditions</ThemedText>
        <View style={styles.conditionCard}>
          <ThemedText type="smallBold" style={{ color: '#ff9500' }}>Blinded</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            • A blinded creature automatically fails any ability check that requires sight. {'\n'}
            • Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage.
          </ThemedText>
        </View>
      </View>
    );
  }

  // Static Homebrew Creator
  if (activeSection === 'homebrew') {
    return renderStaticGuide(
      '🧪 Homebrew Workshop',
      <View style={styles.staticContentBlock}>
        <ThemedView type="backgroundElement" style={styles.homebrewForm}>
          <ThemedText type="smallBold" style={{ color: '#D81921' }}>Forge Homebrew Content</ThemedText>
          
          <View style={styles.formGroup}>
            <ThemedText type="small" themeColor="textSecondary">Creation Title</ThemedText>
            <TextInput
              style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
              placeholder="e.g. Ring of Spell Reflection"
              placeholderTextColor={theme.textSecondary}
              value={homebrewTitle}
              onChangeText={setHomebrewTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText type="small" themeColor="textSecondary">Type</ThemedText>
            <View style={styles.pickerRow}>
              {['Spell', 'Race', 'Class', 'Magic Item', 'Feat'].map((t) => (
                <Pressable
                  key={t}
                  style={[styles.pickerBtn, { borderColor: theme.backgroundSelected }, homebrewType === t && { backgroundColor: '#D81921' }]}
                  onPress={() => setHomebrewType(t)}>
                  <ThemedText style={[styles.pickerBtnText, homebrewType === t && { color: '#fff' }]}>{t}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText type="small" themeColor="textSecondary">Rules Text & Attributes</ThemedText>
            <TextInput
              style={[styles.textarea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
              placeholder="Spell slot level, damage, ranges, or properties..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              value={homebrewBody}
              onChangeText={setHomebrewBody}
            />
          </View>

          <Pressable style={({ pressed }) => [styles.saveHomebrewBtn, pressed && { opacity: 0.8 }]} onPress={saveHomebrew}>
            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Forge Creation</ThemedText>
          </Pressable>
        </ThemedView>

        <View style={styles.homebrewList}>
          <ThemedText type="smallBold" themeColor="textSecondary">Forged Homebrew Library</ThemedText>
          {homebrewList.map((item, idx) => (
            <View key={idx} style={styles.homebrewCard}>
              <View style={styles.homebrewCardHeader}>
                <ThemedText type="smallBold">{item.title}</ThemedText>
                <View style={styles.hbBadge}>
                  <ThemedText style={styles.hbBadgeText}>{item.type}</ThemedText>
                </View>
              </View>
              <ThemedText type="small" style={styles.paragraph} themeColor="text">
                {item.body}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Static Unearthed Arcana
  if (activeSection === 'ua') {
    return renderStaticGuide(
      '🌌 Unearthed Arcana Playtest',
      <View style={styles.staticContentBlock}>
        <ThemedText type="smallBold" style={{ color: '#D81921', fontSize: 16 }}>Unearthed Arcana Archive</ThemedText>
        <ThemedText style={styles.paragraph}>
          Unearthed Arcana (UA) consists of playtest articles released by Wizards of the Coast for community feedback. They are not officially legal for Adventurers League unless stated.
        </ThemedText>

        <View style={styles.uaCard}>
          <ThemedText type="smallBold" style={styles.uaTitle}>Subclass: Mystic Conflux (Sorcerer)</ThemedText>
          <ThemedText style={styles.paragraph}>
            Sorcerers who draw magic from plane alignment nexuses. They gain the ability to shift their spell damage types to force or radiant and can briefly teleport when spending Sorcery Points.
          </ThemedText>
        </View>

        <View style={styles.uaCard}>
          <ThemedText type="smallBold" style={styles.uaTitle}>Subclass: College of Chant (Bard)</ThemedText>
          <ThemedText style={styles.paragraph}>
            Bards specializing in sustained battle chants. Their Bardic Inspiration dice can be added to an ally\'s saving throws recursively for 1 minute.
          </ThemedText>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuScroll: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    alignItems: 'center',
  },
  menuHeader: {
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
    gap: Spacing.two,
  },
  menuCard: {
    width: '100%',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    gap: Spacing.one,
    borderLeftWidth: 3,
    borderLeftColor: '#D81921',
  },
  cardHover: {
    transform: [{ translateY: -1 }],
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  cardPress: {
    opacity: 0.95,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  sourceBadge: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
    borderRadius: Spacing.one,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sourceText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: Spacing.half,
  },
  genericListLayout: {
    flex: 1,
    width: '100%',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 25, 33, 0.2)',
    gap: Spacing.three,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    borderWidth: 1,
    borderColor: '#D81921',
  },
  backBtnText: {
    color: '#D81921',
    fontWeight: 'bold',
    fontSize: 13,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  leftListCol: {
    flex: 1,
    padding: Spacing.three,
  },
  leftListColLarge: {
    maxWidth: 300,
    borderRightWidth: 1,
    borderRightColor: 'rgba(216, 25, 33, 0.1)',
  },
  rightDetailsCol: {
    flex: 2,
    padding: Spacing.four,
  },
  mobileDetailsContainer: {
    flex: 1,
    padding: Spacing.four,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  itemsTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 25, 33, 0.1)',
  },
  itemTabBtn: {
    flex: 1,
    paddingVertical: Spacing.one,
    alignItems: 'center',
  },
  activeItemTabBtn: {
    borderBottomWidth: 2,
    borderBottomColor: '#D81921',
  },
  itemTabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeItemTabBtnText: {
    color: '#D81921',
  },
  listItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  detailsScroll: {
    paddingBottom: Spacing.six,
  },
  detailsTitle: {
    fontSize: 24,
    color: '#D81921',
    fontWeight: 'bold',
  },
  detailsSub: {
    fontSize: 11,
    marginTop: Spacing.half,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    marginVertical: Spacing.two,
  },
  descSection: {
    marginVertical: Spacing.one,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  sectionBlock: {
    marginVertical: Spacing.two,
    gap: Spacing.one,
  },
  subHeading: {
    fontSize: 14,
    color: '#D81921',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  staticLayout: {
    flex: 1,
    width: '100%',
  },
  staticContentScroll: {
    padding: Spacing.four,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  staticContentBlock: {
    gap: Spacing.three,
  },
  staticSubHeading: {
    fontSize: 14,
    color: '#D81921',
    fontWeight: 'bold',
    marginTop: Spacing.two,
  },
  staticTable: {
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.2)',
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    padding: Spacing.two,
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216, 25, 33, 0.1)',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
  featCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  featTitle: {
    color: '#D81921',
    fontSize: 15,
  },
  conditionCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff9500',
    gap: Spacing.one,
  },
  homebrewForm: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.1)',
    gap: Spacing.three,
  },
  formGroup: {
    gap: Spacing.one,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  pickerBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  pickerBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textarea: {
    height: 80,
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  saveHomebrewBtn: {
    backgroundColor: '#D81921',
    height: 38,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homebrewList: {
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  homebrewCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: Spacing.one,
  },
  homebrewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hbBadge: {
    backgroundColor: 'rgba(216, 25, 33, 0.1)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  hbBadgeText: {
    color: '#D81921',
    fontSize: 9,
    fontWeight: 'bold',
  },
  uaCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(216, 25, 33, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff9500',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginVertical: Spacing.one,
  },
  uaTitle: {
    color: '#ff9500',
    fontSize: 14,
    marginBottom: Spacing.one,
  },
});
