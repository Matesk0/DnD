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
import { useRuleset } from '@/hooks/useRuleset';
import { Lineicons } from '@lineiconshq/react-native-lineicons';
import {
  Book1Stroke,
  Pencil1Stroke,
  User4Stroke,
  UserMultiple4Stroke,
  Shield2Stroke,
  Trophy1Stroke,
  MagicOutlined,
  Home2Stroke,
  PlusStroke
} from '@lineiconshq/free-icons';

type RulebookSection =
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

interface RulebookItem {
  id: RulebookSection;
  title: string;
  icon: any;
  desc: string;
}

const RULEBOOK_SECTIONS: RulebookItem[] = [
  { id: 'spells', title: 'Spells', icon: MagicOutlined, desc: 'Browse all official spell descriptions, levels, and magic schools.' },
  { id: 'races', title: 'Races', icon: User4Stroke, desc: 'View racial adjustments, size, speeds, and ancestral traits.' },
  { id: 'classes', title: 'Classes', icon: Shield2Stroke, desc: 'Inspect class hit dice, saving throws, and subclasses.' },
  { id: 'backgrounds', title: 'Backgrounds', icon: Book1Stroke, desc: 'Acquire proficiencies and feature tables from character origins.' },
  { id: 'items', title: 'Items & Magic Loot', icon: Trophy1Stroke, desc: 'Inspect general weapons, armor, tools, and enchanted magic items.' },
  { id: 'feats', title: 'Feats', icon: Trophy1Stroke, desc: 'Search custom training advantages and requirements.' },
  { id: 'chronicles', title: 'Heroic Chronicles', icon: Book1Stroke, desc: 'Flesh out family histories, ally relations, and fated prophecies.' },
  { id: 'racial_feats', title: 'Racial Feats', icon: UserMultiple4Stroke, desc: 'Ancestry-specific feats (e.g. Elven Accuracy, Bountiful Luck).' },
  { id: 'misc', title: 'Miscellaneous Rules', icon: Home2Stroke, desc: 'Review active conditions, combat actions, and stats variables.' },
  { id: 'homebrew', title: 'Homebrew Workshop', icon: Pencil1Stroke, desc: 'Create and log your own custom homebrew creations.' },
  { id: 'ua', title: 'Unearthed Arcana', icon: Book1Stroke, desc: 'Review official playtest subclasses and test features.' },
];

export function RulebookView() {
  const theme = useTheme();
  const { ruleset } = useRuleset();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [activeSection, setActiveSection] = useState<RulebookSection>('menu');

  // Generic List State for Backgrounds, Feats, Items, Chronicles, Racial Feats, Misc, UA
  const [listData, setListData] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeTab, setItemTypeTab] = useState<'standard' | 'magic'>('standard');

  // Details State
  const [selectedItemIndex, setSelectedItemIndex] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Homebrew list/form state
  const [homebrewTitle, setHomebrewTitle] = useState('');
  const [homebrewType, setHomebrewType] = useState('Spell');
  const [homebrewBody, setHomebrewBody] = useState('');
  const [homebrewList, setHomebrewList] = useState<any[]>([]);
  const [loadingHomebrew, setLoadingHomebrew] = useState(false);

  // Load Homebrews from Supabase via API
  const loadHomebrews = async () => {
    try {
      setLoadingHomebrew(true);
      const data = await dndApi.fetchCollection('homebrew', ruleset);
      setHomebrewList(data);
    } catch (err) {
      console.warn('Failed to load homebrews from API:', err);
    } finally {
      setLoadingHomebrew(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'homebrew') {
      loadHomebrews();
    }
  }, [activeSection, ruleset]);

  const saveHomebrew = async () => {
    if (!homebrewTitle.trim() || !homebrewBody.trim()) return;
    const newItem = {
      index: homebrewTitle.toLowerCase().replace(/\s+/g, '-'),
      name: homebrewTitle,
      type: homebrewType,
      desc: [homebrewBody],
    };
    try {
      await dndApi.saveHomebrew(newItem, ruleset);
      setHomebrewList((prev) => [newItem, ...prev]);
      setHomebrewTitle('');
      setHomebrewBody('');
    } catch (err) {
      console.error('Failed to save homebrew:', err);
    }
  };

  // Load generic lists depending on section
  useEffect(() => {
    if (activeSection === 'menu' || ['spells', 'races', 'classes', 'homebrew'].includes(activeSection)) {
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
          data = await dndApi.getBackgrounds(ruleset);
        } else if (activeSection === 'feats') {
          data = await dndApi.getFeats(ruleset);
        } else if (activeSection === 'items') {
          if (itemTypeTab === 'standard') {
            data = await dndApi.getEquipment(ruleset);
          } else {
            data = await dndApi.getMagicItems(ruleset);
          }
        } else {
          // Dynamic collections for other API-driven sections
          data = await dndApi.fetchCollection(activeSection, ruleset);
        }
        setListData(data);
      } catch (err) {
        console.error(`Failed to load list for '${activeSection}' from API:`, err);
      } finally {
        setLoadingList(false);
      }
    }
    loadData();
  }, [activeSection, itemTypeTab, ruleset]);

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
          data = await dndApi.getBackgroundDetails(index!, ruleset);
        } else if (activeSection === 'feats') {
          data = await dndApi.getFeatDetails(index!, ruleset);
        } else if (activeSection === 'items') {
          if (itemTypeTab === 'standard') {
            data = await dndApi.getEquipmentDetails(index!, ruleset);
          } else {
            data = await dndApi.getMagicItemDetails(index!, ruleset);
          }
        } else {
          // Dynamic details for other sections
          data = await dndApi.fetchDetails(activeSection, index!, ruleset);
        }
        setDetailsData(data);
      } catch (err) {
        console.error(`Failed to load details for '${activeSection}/${index}' from API:`, err);
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [selectedItemIndex, activeSection, itemTypeTab, ruleset]);

  // Filtered generic list
  const filteredList = useMemo(() => {
    return listData.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listData, searchQuery]);

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

        {/* Display secondary details for custom dynamic collections */}
        {detailsData.type && (
          <ThemedText type="code" style={styles.detailsSub}>
            Category: {detailsData.type}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(() => {
              const sec = RULEBOOK_SECTIONS.find((s) => s.id === activeSection);
              return sec ? <Lineicons icon={sec.icon} size={20} color="#dfb15b" /> : null;
            })()}
            <ThemedText type="subtitle" style={styles.listTitle}>
              {RULEBOOK_SECTIONS.find((s) => s.id === activeSection)?.title}
            </ThemedText>
          </View>
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

  // Render menu selection
  if (activeSection === 'menu') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.menuScroll}>
        <View style={styles.menuHeader}>
          <ThemedText type="subtitle" style={styles.title}>
            📚 {ruleset === '5e' ? 'D&D 5E Rulebook' : 'Pathfinder 2e Rulebook'}
          </ThemedText>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Consult the archives of D&D 5th Edition. Browse through official SRD datasets, playtest documents, and homebrew design modules.
          </ThemedText>
        </View>

        <View style={styles.grid}>
          {RULEBOOK_SECTIONS.map((sec) => (
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
                <View style={{ marginRight: Spacing.one }}>
                  <Lineicons icon={sec.icon} size={22} color="#dfb15b" />
                </View>
                <View>
                  <ThemedText type="smallBold" style={styles.cardTitle}>
                    {sec.title}
                  </ThemedText>
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

  // Static Homebrew Creator (Communicating with Supabase via API)
  if (activeSection === 'homebrew') {
    return (
      <View style={styles.genericListLayout}>
        <View style={styles.listHeader}>
          <Pressable style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]} onPress={() => setActiveSection('menu')}>
            <ThemedText style={styles.backBtnText}>← Library Menu</ThemedText>
          </Pressable>
          <ThemedText type="subtitle" style={styles.listTitle}>
            🧪 Homebrew Workshop
          </ThemedText>
        </View>
        
        <ScrollView contentContainerStyle={styles.detailsScroll} style={{ padding: Spacing.four }}>
          <ThemedView type="backgroundElement" style={styles.homebrewForm}>
            <ThemedText type="smallBold" style={{ color: '#dfb15b' }}>Forge Homebrew Content</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText type="small" themeColor="textSecondary">Creation Title</ThemedText>
              <TextInput
                style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected, marginBottom: 0 }]}
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
                    style={[styles.pickerBtn, { borderColor: theme.backgroundSelected }, homebrewType === t && { backgroundColor: '#dfb15b' }]}
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
            <ThemedText type="smallBold" themeColor="textSecondary">Forged Homebrew Vault (Supabase)</ThemedText>
            {loadingHomebrew ? (
              <LoadingSpinner />
            ) : homebrewList.length === 0 ? (
              <ThemedText type="small" style={{ fontStyle: 'italic', marginTop: 8 }} themeColor="textSecondary">
                No homebrews found in your vault. Forge one above!
              </ThemedText>
            ) : (
              homebrewList.map((item, idx) => (
                <ThemedView key={idx} type="backgroundElement" style={styles.homebrewCard}>
                  <View style={styles.homebrewCardHeader}>
                    <ThemedText type="smallBold">{item.name}</ThemedText>
                    <View style={styles.hbBadge}>
                      <ThemedText style={styles.hbBadgeText}>{item.type}</ThemedText>
                    </View>
                  </View>
                  <ThemedText type="small" style={styles.paragraph} themeColor="text">
                    {Array.isArray(item.desc) ? item.desc.join('\n') : item.desc}
                  </ThemedText>
                </ThemedView>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // All other sections (Chronicles, Racial Feats, Misc Rules, UA) use generic API layout
  return renderListLayout();
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
    color: '#dfb15b',
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
    borderLeftColor: '#dfb15b',
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
    borderColor: '#dfb15b',
  },
  backBtnText: {
    color: '#dfb15b',
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
    borderBottomColor: '#dfb15b',
  },
  itemTabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeItemTabBtnText: {
    color: '#dfb15b',
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
    color: '#dfb15b',
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
    color: '#dfb15b',
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
    color: '#dfb15b',
    fontSize: 15,
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
    backgroundColor: '#dfb15b',
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
    color: '#dfb15b',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
