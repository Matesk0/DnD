import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { dndApi, DndListItem, RaceDetails } from '@/services/dnd-api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LoadingSpinner } from './loading-spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRuleset } from '@/hooks/useRuleset';

export function RacesView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { ruleset } = useRuleset();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [races, setRaces] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Selected Race Details State
  const [selectedRaceIndex, setSelectedRaceIndex] = useState<string | null>(null);
  const [raceDetails, setRaceDetails] = useState<RaceDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Fetch races list
  useEffect(() => {
    async function loadRaces() {
      try {
        setLoadingList(true);
        const data = await dndApi.getRaces(ruleset);
        setRaces(data);
        setErrorList(null);
      } catch (err) {
        setErrorList('Failed to gather races. The caravans are delayed.');
      } finally {
        setLoadingList(false);
      }
    }
    loadRaces();
  }, [ruleset]);

  // Fetch race details when selected index changes
  useEffect(() => {
    if (!selectedRaceIndex) {
      setRaceDetails(null);
      return;
    }

    async function loadRaceDetails() {
      try {
        setLoadingDetails(true);
        setErrorDetails(null);
        const details = await dndApi.getRaceDetails(selectedRaceIndex!, ruleset);
        setRaceDetails(details);
      } catch (err) {
        setErrorDetails('Could not read lineage scrolls.');
      } finally {
        setLoadingDetails(false);
      }
    }

    loadRaceDetails();
  }, [selectedRaceIndex, ruleset]);

  // Render Race Details Content
  const renderRaceDetails = () => {
    if (loadingDetails) {
      return <LoadingSpinner message="Tracing ancestry..." />;
    }

    if (errorDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorDetails}</ThemedText>
        </View>
      );
    }

    if (!raceDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyStateText} themeColor="textSecondary">
            🧝 Select a race to discover their traits, bonuses, and lore.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        {/* Header */}
        <View style={styles.detailsHeader}>
          <ThemedText type="subtitle" style={styles.raceTitle}>
            {raceDetails.name}
          </ThemedText>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: '#319795' }]}>
              <ThemedText style={styles.badgeText}>Speed: {raceDetails.speed} ft.</ThemedText>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.badgeText, { color: theme.text }]}>Size: {raceDetails.size}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ability Bonuses */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionHeading}>
            Ability Score Increases
          </ThemedText>
          {raceDetails.ability_bonuses && raceDetails.ability_bonuses.length > 0 ? (
            <View style={styles.bonusesRow}>
              {raceDetails.ability_bonuses.map((bonus, i) => (
                <View key={i} style={styles.bonusCard}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    {bonus.ability_score?.name || ''}
                  </ThemedText>
                  <ThemedText type="default" style={styles.bonusText}>
                    +{bonus.bonus}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Choose your own ability score increases (Tasha's rules).
            </ThemedText>
          )}
        </View>

        <View style={styles.divider} />

        {/* Languages */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionHeading}>
            Languages
          </ThemedText>
          <ThemedText type="small" style={styles.loreText} themeColor="text">
            {raceDetails.language_desc}
          </ThemedText>
          <View style={styles.tagContainer}>
            {raceDetails.languages?.map((lang) => (
              <View key={lang.name} style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={[styles.tagText, { color: theme.text }]}>{lang.name}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Alignment & Age Lore */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionHeading}>
            Lore & Traits
          </ThemedText>
          {raceDetails.alignment && (
            <View style={styles.loreBlock}>
              <ThemedText type="smallBold" style={{ color: '#d69e2e' }}>Alignment</ThemedText>
              <ThemedText type="small" style={styles.loreText} themeColor="text">
                {raceDetails.alignment}
              </ThemedText>
            </View>
          )}
          {raceDetails.age && (
            <View style={styles.loreBlock}>
              <ThemedText type="smallBold" style={{ color: '#d69e2e' }}>Age</ThemedText>
              <ThemedText type="small" style={styles.loreText} themeColor="text">
                {raceDetails.age}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Traits List */}
        {raceDetails.traits && raceDetails.traits.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionHeading}>
                Racial Traits
              </ThemedText>
              <View style={styles.tagContainer}>
                {raceDetails.traits.map((trait) => (
                  <View key={trait.name} style={[styles.tag, { backgroundColor: 'rgba(49, 151, 149, 0.1)', borderWidth: 1, borderColor: '#319795' }]}>
                    <ThemedText style={[styles.tagText, { color: '#319795' }]}>{trait.name}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // Render Race Item
  const renderRaceItem = ({ item }: { item: DndListItem }) => {
    const isSelected = selectedRaceIndex === item.index;
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
        onPress={() => setSelectedRaceIndex(item.index)}>
        <View style={styles.listItemContent}>
          <ThemedText style={styles.raceName} themeColor={isSelected ? 'text' : 'text'}>
            {item.name}
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
          onPress={selectedRaceIndex && !isLargeScreen ? () => setSelectedRaceIndex(null) : onBack}>
          <ThemedText style={styles.backButtonText}>
            {selectedRaceIndex && !isLargeScreen ? '← Back to List' : '← Main Menu'}
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          🧝 Races & Lineages
        </ThemedText>
      </View>

      {/* Main Content */}
      {selectedRaceIndex && !isLargeScreen ? (
        // Mobile Detail View
        <View style={styles.mobileDetailContainer}>{renderRaceDetails()}</View>
      ) : (
        // Dual column or mobile list view
        <View style={styles.contentLayout}>
          {/* List Section */}
          <View style={[styles.listColumn, isLargeScreen && styles.listColumnLarge]}>
            {loadingList ? (
              <LoadingSpinner />
            ) : errorList ? (
              <View style={styles.centerContent}>
                <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorList}</ThemedText>
              </View>
            ) : (
              <FlatList
                data={races}
                renderItem={renderRaceItem}
                keyExtractor={(item) => item.index}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>

          {/* Details Section (Large Screen) */}
          {isLargeScreen && (
            <View style={styles.detailsColumn}>{renderRaceDetails()}</View>
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
    borderBottomColor: 'rgba(214, 158, 46, 0.2)',
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
  raceName: {
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
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  raceTitle: {
    fontSize: 26,
    color: '#319795', // Teal accent for races
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(214, 158, 46, 0.2)',
    marginVertical: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d69e2e',
    marginBottom: Spacing.one,
  },
  bonusesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  bonusCard: {
    minWidth: 90,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(49, 151, 149, 0.2)',
    backgroundColor: 'rgba(49, 151, 149, 0.03)',
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#319795',
    marginTop: Spacing.half,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loreBlock: {
    marginBottom: Spacing.two,
  },
  loreText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.half,
  },
});
