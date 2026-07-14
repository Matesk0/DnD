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
import { dndApi, DndListItem, SpellDetails } from '@/services/dnd-api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LoadingSpinner } from './loading-spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SpellsView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [spells, setSpells] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Selected Spell Details State
  const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);
  const [spellDetails, setSpellDetails] = useState<SpellDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Fetch spells list
  useEffect(() => {
    async function loadSpells() {
      try {
        setLoadingList(true);
        const data = await dndApi.getSpells();
        setSpells(data);
        setErrorList(null);
      } catch (err) {
        setErrorList('Failed to fetch the ancient scrolls. Are you offline?');
      } finally {
        setLoadingList(false);
      }
    }
    loadSpells();
  }, []);

  // Fetch spell details when selected index changes
  useEffect(() => {
    if (!selectedSpellIndex) {
      setSpellDetails(null);
      return;
    }

    async function loadSpellDetails() {
      try {
        setLoadingDetails(true);
        setErrorDetails(null);
        const details = await dndApi.getSpellDetails(selectedSpellIndex!);
        setSpellDetails(details);
      } catch (err) {
        setErrorDetails('Could not decipher this spell.');
      } finally {
        setLoadingDetails(false);
      }
    }

    loadSpellDetails();
  }, [selectedSpellIndex]);

  // Filtered spells
  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      const matchesSearch = spell.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel =
        selectedLevel === null ||
        spell.level === selectedLevel ||
        // Fallback in case spell level isn't in list, we'll check index or fetch details,
        // but for now, we can trust the API or let level filter work if present.
        (spell.level === undefined);
      return matchesSearch && matchesLevel;
    });
  }, [spells, searchQuery, selectedLevel]);

  // Levels mapping for filter buttons
  const levels = [
    { label: 'All', value: null },
    { label: 'Cantrip', value: 0 },
    { label: '1st', value: 1 },
    { label: '2nd', value: 2 },
    { label: '3rd', value: 3 },
    { label: '4th', value: 4 },
    { label: '5th', value: 5 },
    { label: '6th', value: 6 },
    { label: '7th', value: 7 },
    { label: '8th', value: 8 },
    { label: '9th', value: 9 },
  ];

  // Render Spell details content
  const renderSpellDetails = () => {
    if (loadingDetails) {
      return <LoadingSpinner message="Deciphering the runes..." />;
    }

    if (errorDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorDetails}</ThemedText>
        </View>
      );
    }

    if (!spellDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyStateText} themeColor="textSecondary">
            ✨ Select a spell from the list to reveal its magical incantations.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        <View style={styles.detailsHeader}>
          <ThemedText type="subtitle" style={styles.spellTitle}>
            {spellDetails.name}
          </ThemedText>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: '#805ad5' }]}>
              <ThemedText style={styles.badgeText}>
                {spellDetails.level === 0 ? 'Cantrip' : `Level ${spellDetails.level}`}
              </ThemedText>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.badgeText, { color: theme.text }]}>
                {spellDetails.school?.name}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">Casting Time</ThemedText>
            <ThemedText style={styles.statValue}>{spellDetails.casting_time}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">Range</ThemedText>
            <ThemedText style={styles.statValue}>{spellDetails.range}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">Duration</ThemedText>
            <ThemedText style={styles.statValue}>
              {spellDetails.concentration ? 'Concentration, ' : ''}
              {spellDetails.duration}
            </ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">Components</ThemedText>
            <ThemedText style={styles.statValue}>
              {spellDetails.components?.join(', ')}
            </ThemedText>
          </View>
        </View>

        {spellDetails.material && (
          <View style={styles.materialCard}>
            <ThemedText type="small" style={{ fontStyle: 'italic' }} themeColor="textSecondary">
              Material: {spellDetails.material}
            </ThemedText>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.descriptionSection}>
          <ThemedText type="smallBold" style={styles.sectionHeading} themeColor="text">
            Description
          </ThemedText>
          {spellDetails.desc?.map((paragraph, index) => (
            <ThemedText key={index} selectable style={styles.paragraph} themeColor="text">
              {paragraph}
            </ThemedText>
          ))}
        </View>

        {spellDetails.higher_level && spellDetails.higher_level.length > 0 && (
          <View style={styles.higherLevelSection}>
            <ThemedText type="smallBold" style={styles.sectionHeading} themeColor="text">
              At Higher Levels
            </ThemedText>
            {spellDetails.higher_level.map((paragraph, index) => (
              <ThemedText key={index} selectable style={styles.paragraph} themeColor="text">
                {paragraph}
              </ThemedText>
            ))}
          </View>
        )}

        <View style={styles.classesSection}>
          <ThemedText type="small" themeColor="textSecondary">
            Available to:{' '}
            <ThemedText type="smallBold" themeColor="text">
              {spellDetails.classes?.map((c) => c.name).join(', ') || 'None'}
            </ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    );
  };

  // Render Spell List Item
  const renderSpellItem = ({ item }: { item: DndListItem }) => {
    const isSelected = selectedSpellIndex === item.index;
    return (
      <Pressable
        style={(state: any) => [
          styles.listItem,
          {
            backgroundColor: isSelected
              ? theme.backgroundSelected
              : state.pressed
              ? theme.backgroundSelected
              : 'transparent',
            borderColor: theme.backgroundElement,
          },
          state.hovered && { backgroundColor: theme.backgroundSelected },
        ]}
        onPress={() => setSelectedSpellIndex(item.index)}>
        <View style={styles.listItemContent}>
          <ThemedText style={styles.spellName} themeColor={isSelected ? 'text' : 'text'}>
            {item.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.level !== undefined ? (item.level === 0 ? 'Cantrip' : `Level ${item.level}`) : 'Spell'}
          </ThemedText>
        </View>
        <ThemedText style={styles.arrow} themeColor="textSecondary">
          {isLargeScreen ? '→' : '›'}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={selectedSpellIndex && !isLargeScreen ? () => setSelectedSpellIndex(null) : onBack}>
          <ThemedText style={styles.backButtonText}>
            {selectedSpellIndex && !isLargeScreen ? '← Back to List' : '← Main Menu'}
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          🪄 Spells Codex
        </ThemedText>
      </View>

      {/* Main Content Area */}
      {selectedSpellIndex && !isLargeScreen ? (
        // Mobile Detail View
        <View style={styles.mobileDetailContainer}>{renderSpellDetails()}</View>
      ) : (
        // Dual column or mobile list view
        <View style={styles.contentLayout}>
          {/* List Section (takes left column or full screen on mobile) */}
          <View style={[styles.listColumn, isLargeScreen && styles.listColumnLarge]}>
            {/* Filters */}
            <View style={styles.filterSection}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
                placeholder="Search spells..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.levelFilterScroll}
                contentContainerStyle={styles.levelFilterContainer}>
                {levels.map((lvl) => (
                  <Pressable
                    key={lvl.label}
                    style={[
                      styles.filterTag,
                      {
                        backgroundColor:
                          selectedLevel === lvl.value ? '#805ad5' : theme.backgroundElement,
                      },
                    ]}
                    onPress={() => setSelectedLevel(lvl.value)}>
                    <ThemedText
                      style={[
                        styles.filterTagText,
                        {
                          color: selectedLevel === lvl.value ? '#fff' : theme.text,
                        },
                      ]}>
                      {lvl.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* List */}
            {loadingList ? (
              <LoadingSpinner />
            ) : errorList ? (
              <View style={styles.centerContent}>
                <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorList}</ThemedText>
              </View>
            ) : filteredSpells.length === 0 ? (
              <View style={styles.centerContent}>
                <ThemedText themeColor="textSecondary">No spells match your filters.</ThemedText>
              </View>
            ) : (
              <FlatList
                data={filteredSpells}
                renderItem={renderSpellItem}
                keyExtractor={(item) => item.index}
                contentContainerStyle={styles.listContent}
                initialNumToRender={15}
              />
            )}
          </View>

          {/* Details Section (only on large screens) */}
          {isLargeScreen && (
            <View style={styles.detailsColumn}>{renderSpellDetails()}</View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 158, 46, 0.2)', // gold border
    gap: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(214, 158, 46, 0.1)',
    borderWidth: 1,
    borderColor: '#d69e2e',
  },
  backButtonText: {
    color: '#d69e2e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  listColumn: {
    flex: 1,
    padding: Spacing.three,
  },
  listColumnLarge: {
    maxWidth: 320,
    borderRightWidth: 1,
    borderRightColor: 'rgba(214, 158, 46, 0.1)',
  },
  detailsColumn: {
    flex: 2,
    padding: Spacing.four,
  },
  mobileDetailContainer: {
    flex: 1,
    padding: Spacing.four,
  },
  filterSection: {
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    borderWidth: 1,
  },
  levelFilterScroll: {
    flexGrow: 0,
  },
  levelFilterContainer: {
    gap: Spacing.one,
    paddingVertical: Spacing.half,
  },
  filterTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderRadius: Spacing.two,
    marginVertical: Spacing.half,
  },
  listItemContent: {
    flex: 1,
  },
  spellName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  arrow: {
    fontSize: 18,
    marginLeft: Spacing.two,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 15,
    fontStyle: 'italic',
  },
  detailsScrollContent: {
    paddingBottom: Spacing.six,
  },
  detailsHeader: {
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  spellTitle: {
    fontSize: 26,
    color: '#d69e2e', // Gold accent
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginVertical: Spacing.two,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(214, 158, 46, 0.1)',
    backgroundColor: 'rgba(214, 158, 46, 0.03)',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: Spacing.half,
  },
  materialCard: {
    padding: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Spacing.two,
    marginVertical: Spacing.one,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(214, 158, 46, 0.2)',
    marginVertical: Spacing.three,
  },
  descriptionSection: {
    gap: Spacing.two,
  },
  sectionHeading: {
    fontSize: 16,
    color: '#d69e2e',
    marginBottom: Spacing.one,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  higherLevelSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  classesSection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(214, 158, 46, 0.1)',
  },
});
