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
import { dndApi, DndListItem, MonsterDetails } from '@/services/dnd-api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LoadingSpinner } from './loading-spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRuleset } from '@/hooks/useRuleset';

export function MonstersView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { ruleset } = useRuleset();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [monsters, setMonsters] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Monster Details State
  const [selectedMonsterIndex, setSelectedMonsterIndex] = useState<string | null>(null);
  const [monsterDetails, setMonsterDetails] = useState<MonsterDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Fetch monsters list
  useEffect(() => {
    async function loadMonsters() {
      try {
        setLoadingList(true);
        const data = await dndApi.getMonsters(ruleset);
        setMonsters(data);
        setErrorList(null);
      } catch (err) {
        setErrorList('Failed to fetch the monster list. Are the dungeons sealed?');
      } finally {
        setLoadingList(false);
      }
    }
    loadMonsters();
  }, [ruleset]);

  // Fetch monster details when selected index changes
  useEffect(() => {
    if (!selectedMonsterIndex) {
      setMonsterDetails(null);
      return;
    }

    async function loadMonsterDetails() {
      try {
        setLoadingDetails(true);
        setErrorDetails(null);
        const details = await dndApi.getMonsterDetails(selectedMonsterIndex!, ruleset);
        setMonsterDetails(details);
      } catch (err) {
        setErrorDetails('Could not locate the monster stats.');
      } finally {
        setLoadingDetails(false);
      }
    }

    loadMonsterDetails();
  }, [selectedMonsterIndex, ruleset]);

  // Filtered monsters list
  const filteredMonsters = useMemo(() => {
    return monsters.filter((monster) =>
      monster.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [monsters, searchQuery]);

  // Ability modifier helper
  const getModifierText = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Render Monster Details Content
  const renderMonsterDetails = () => {
    if (loadingDetails) {
      return <LoadingSpinner message="Tracking the creature..." />;
    }

    if (errorDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorDetails}</ThemedText>
        </View>
      );
    }

    if (!monsterDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyStateText} themeColor="textSecondary">
            🐉 Select a beast from the bestiary to inspect its attributes.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        {/* Header */}
        <View style={styles.detailsHeader}>
          <ThemedText type="subtitle" style={styles.monsterTitle}>
            {monsterDetails.name}
          </ThemedText>
          <ThemedText type="small" style={{ fontStyle: 'italic' }} themeColor="textSecondary">
            {monsterDetails.size} {monsterDetails.type}, {monsterDetails.alignment}
          </ThemedText>
        </View>

        <View style={styles.divider} />

        {/* Vital Info */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">Armor Class (AC): </ThemedText>
            <ThemedText type="default">
              {monsterDetails.armor_class?.[0]?.value || '10'}
              {monsterDetails.armor_class?.[0]?.type ? ` (${monsterDetails.armor_class[0].type})` : ''}
            </ThemedText>
          </View>
          <View style={styles.vitalRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">Hit Points (HP): </ThemedText>
            <ThemedText type="default">
              {monsterDetails.hit_points} ({monsterDetails.hit_dice})
            </ThemedText>
          </View>
          <View style={styles.vitalRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">Speed: </ThemedText>
            <ThemedText type="default">
              {Object.entries(monsterDetails.speed || {})
                .map(([type, val]) => `${type}: ${val}`)
                .join(', ')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ability Scores Table */}
        <View style={styles.abilityTable}>
          {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((stat, i) => {
            let val = 10;
            switch (stat) {
              case 'STR': val = monsterDetails.strength; break;
              case 'DEX': val = monsterDetails.dexterity; break;
              case 'CON': val = monsterDetails.constitution; break;
              case 'INT': val = monsterDetails.intelligence; break;
              case 'WIS': val = monsterDetails.wisdom; break;
              case 'CHA': val = monsterDetails.charisma; break;
            }
            return (
              <View key={stat} style={styles.abilityCell}>
                <ThemedText type="smallBold" style={styles.abilityName} themeColor="textSecondary">
                  {stat}
                </ThemedText>
                <ThemedText type="default" style={styles.abilityValue}>
                  {val}
                </ThemedText>
                <ThemedText type="small" style={styles.abilityMod}>
                  ({getModifierText(val)})
                </ThemedText>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Extra Stats */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">Challenge Rating (CR): </ThemedText>
            <ThemedText type="default" style={{ fontWeight: 'bold', color: '#e53e3e' }}>
              {monsterDetails.challenge_rating} ({monsterDetails.xp ? `${monsterDetails.xp.toLocaleString()} XP` : '0 XP'})
            </ThemedText>
          </View>
        </View>

        {/* Special Abilities */}
        {monsterDetails.special_abilities && monsterDetails.special_abilities.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.sectionContainer}>
              <ThemedText type="smallBold" style={styles.sectionHeading}>
                Traits & Special Abilities
              </ThemedText>
              {monsterDetails.special_abilities.map((ability, i) => (
                <View key={i} style={styles.actionItem}>
                  <ThemedText type="default" style={styles.actionName}>
                    {ability.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.actionDesc} themeColor="text">
                    {ability.desc}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Actions */}
        {monsterDetails.actions && monsterDetails.actions.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.sectionContainer}>
              <ThemedText type="smallBold" style={styles.sectionHeading}>
                Actions
              </ThemedText>
              {monsterDetails.actions.map((action, i) => (
                <View key={i} style={styles.actionItem}>
                  <ThemedText type="default" style={styles.actionName}>
                    {action.name}
                  </ThemedText>
                  <ThemedText type="small" style={styles.actionDesc} themeColor="text">
                    {action.desc}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // Render Monster Item
  const renderMonsterItem = ({ item }: { item: DndListItem }) => {
    const isSelected = selectedMonsterIndex === item.index;
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
        onPress={() => setSelectedMonsterIndex(item.index)}>
        <View style={styles.listItemContent}>
          <ThemedText style={styles.monsterName} themeColor={isSelected ? 'text' : 'text'}>
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
          onPress={selectedMonsterIndex && !isLargeScreen ? () => setSelectedMonsterIndex(null) : onBack}>
          <ThemedText style={styles.backButtonText}>
            {selectedMonsterIndex && !isLargeScreen ? '← Back to List' : '← Main Menu'}
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          🐉 Monster Bestiary
        </ThemedText>
      </View>

      {/* Main Content */}
      {selectedMonsterIndex && !isLargeScreen ? (
        // Mobile Detail View
        <View style={styles.mobileDetailContainer}>{renderMonsterDetails()}</View>
      ) : (
        // Dual column or mobile list view
        <View style={styles.contentLayout}>
          {/* List Section */}
          <View style={[styles.listColumn, isLargeScreen && styles.listColumnLarge]}>
            {/* Search */}
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
                placeholder="Search bestiary..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* List */}
            {loadingList ? (
              <LoadingSpinner />
            ) : errorList ? (
              <View style={styles.centerContent}>
                <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorList}</ThemedText>
              </View>
            ) : filteredMonsters.length === 0 ? (
              <View style={styles.centerContent}>
                <ThemedText themeColor="textSecondary">No monsters spotted.</ThemedText>
              </View>
            ) : (
              <FlatList
                data={filteredMonsters}
                renderItem={renderMonsterItem}
                keyExtractor={(item) => item.index}
                contentContainerStyle={styles.listContent}
                initialNumToRender={15}
              />
            )}
          </View>

          {/* Details Section (Large Screen) */}
          {isLargeScreen && (
            <View style={styles.detailsColumn}>{renderMonsterDetails()}</View>
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
  filterSection: {
    marginBottom: Spacing.three,
  },
  searchInput: {
    height: 40,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    borderWidth: 1,
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
  monsterName: {
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
  monsterTitle: {
    fontSize: 26,
    color: '#e53e3e', // Red accent for monsters
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(214, 158, 46, 0.2)',
    marginVertical: Spacing.two,
  },
  vitalsContainer: {
    gap: Spacing.one,
  },
  vitalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  abilityTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  abilityCell: {
    alignItems: 'center',
    minWidth: 50,
    flex: 1,
    paddingVertical: Spacing.one,
  },
  abilityName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  abilityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.half,
  },
  abilityMod: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sectionContainer: {
    gap: Spacing.two,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d69e2e',
    marginBottom: Spacing.one,
  },
  actionItem: {
    marginBottom: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftWidth: 3,
    borderLeftColor: '#e53e3e',
  },
  actionName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: Spacing.half,
  },
  actionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
