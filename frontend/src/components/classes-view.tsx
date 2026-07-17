import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { dndApi, DndListItem, ClassDetails } from '@/services/dnd-api';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LoadingSpinner } from './loading-spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRuleset } from '@/hooks/useRuleset';

export function ClassesView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { ruleset } = useRuleset();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 700;

  const [classes, setClasses] = useState<DndListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Selected Class Details State
  const [selectedClassIndex, setSelectedClassIndex] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Fetch classes list
  useEffect(() => {
    async function loadClasses() {
      try {
        setLoadingList(true);
        const data = await dndApi.getClasses(ruleset);
        setClasses(data);
        setErrorList(null);
      } catch (err) {
        setErrorList('Failed to recruit classes. The tavern is empty.');
      } finally {
        setLoadingList(false);
      }
    }
    loadClasses();
  }, [ruleset]);

  // Fetch class details when selected index changes
  useEffect(() => {
    if (!selectedClassIndex) {
      setClassDetails(null);
      return;
    }

    async function loadClassDetails() {
      try {
        setLoadingDetails(true);
        setErrorDetails(null);
        const details = await dndApi.getClassDetails(selectedClassIndex!, ruleset);
        setClassDetails(details);
      } catch (err) {
        setErrorDetails('Could not read class scroll.');
      } finally {
        setLoadingDetails(false);
      }
    }

    loadClassDetails();
  }, [selectedClassIndex, ruleset]);

  // Render Class Details Content
  const renderClassDetails = () => {
    if (loadingDetails) {
      return <LoadingSpinner message="Consulting class masters..." />;
    }

    if (errorDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={{ color: '#e53e3e', textAlign: 'center' }}>{errorDetails}</ThemedText>
        </View>
      );
    }

    if (!classDetails) {
      return (
        <View style={styles.centerContent}>
          <ThemedText style={styles.emptyStateText} themeColor="textSecondary">
            🛡️ Select a class to discover its path and masteries.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.detailsScrollContent}>
        {/* Header */}
        <View style={styles.detailsHeader}>
          <ThemedText type="subtitle" style={styles.classTitle}>
            {classDetails.name}
          </ThemedText>
          <View style={styles.hitDieContainer}>
            <ThemedText type="smallBold" themeColor="textSecondary">Hit Die: </ThemedText>
            <View style={styles.diceBadge}>
              <ThemedText style={styles.diceText}>d{classDetails.hit_die}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Saving Throws */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionHeading}>
            Saving Throw Proficiencies
          </ThemedText>
          <View style={styles.tagContainer}>
            {classDetails.saving_throws?.map((save) => (
              <View key={save.name} style={[styles.tag, { backgroundColor: '#dd6b20' }]}>
                <ThemedText style={styles.tagText}>{save.name}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Proficiencies */}
        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionHeading}>
            Starting Proficiencies
          </ThemedText>
          <View style={styles.tagContainer}>
            {classDetails.proficiencies?.map((prof) => (
              <View key={prof.name} style={[styles.tag, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={[styles.tagText, { color: theme.text }]}>{prof.name}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Skill Proficiencies Choice */}
        {classDetails.proficiency_choices && classDetails.proficiency_choices.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionHeading}>
                Skill Selections
              </ThemedText>
              {classDetails.proficiency_choices.map((choice, index) => {
                const options = choice.from?.options?.map((opt) => opt.item?.name).join(', ') || '';
                return (
                  <View key={index} style={styles.choiceCard}>
                    <ThemedText type="smallBold" style={styles.choiceLabel}>
                      Choose {choice.choose} from:
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {options}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Subclasses */}
        {classDetails.subclasses && classDetails.subclasses.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionHeading}>
                Subclasses
              </ThemedText>
              <View style={styles.tagContainer}>
                {classDetails.subclasses.map((sub) => (
                  <View key={sub.name} style={[styles.tag, { backgroundColor: 'rgba(214, 158, 46, 0.1)', borderWidth: 1, borderColor: '#d69e2e' }]}>
                    <ThemedText style={[styles.tagText, { color: '#d69e2e' }]}>{sub.name}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // Render Class Item
  const renderClassItem = ({ item }: { item: DndListItem }) => {
    const isSelected = selectedClassIndex === item.index;
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
        onPress={() => setSelectedClassIndex(item.index)}>
        <View style={styles.listItemContent}>
          <ThemedText style={styles.className} themeColor={isSelected ? 'text' : 'text'}>
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
          onPress={selectedClassIndex && !isLargeScreen ? () => setSelectedClassIndex(null) : onBack}>
          <ThemedText style={styles.backButtonText}>
            {selectedClassIndex && !isLargeScreen ? '← Back to List' : '← Main Menu'}
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          🛡️ Class Guide
        </ThemedText>
      </View>

      {/* Main Content */}
      {selectedClassIndex && !isLargeScreen ? (
        // Mobile Detail View
        <View style={styles.mobileDetailContainer}>{renderClassDetails()}</View>
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
                data={classes}
                renderItem={renderClassItem}
                keyExtractor={(item) => item.index}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>

          {/* Details Section (Large Screen) */}
          {isLargeScreen && (
            <View style={styles.detailsColumn}>{renderClassDetails()}</View>
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
  className: {
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
  classTitle: {
    fontSize: 26,
    color: '#dd6b20', // Orange accent for classes
    fontWeight: 'bold',
  },
  hitDieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  diceBadge: {
    backgroundColor: '#dd6b20',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
    marginLeft: Spacing.one,
  },
  diceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
  choiceCard: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftWidth: 3,
    borderLeftColor: '#dd6b20',
    marginVertical: Spacing.half,
  },
  choiceLabel: {
    fontSize: 13,
    marginBottom: Spacing.half,
  },
});
