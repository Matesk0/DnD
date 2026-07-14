import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LOADING_MESSAGES = [
  'Consulting the ancient scrolls...',
  'Summoning the bestiary...',
  'Gathering the party...',
  'Rolling initiative...',
  'Chanting the arcane incantations...',
  'Polishing the broadswords...',
  'Whispering to the animal companions...',
  'Seeking the dungeon master\'s approval...',
];

export function LoadingSpinner({ message }: { message?: string }) {
  const theme = useTheme();
  const [loadingText, setLoadingText] = useState(message || LOADING_MESSAGES[0]);

  useEffect(() => {
    if (message) {
      setLoadingText(message);
      return;
    }

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingText(LOADING_MESSAGES[randomIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, [message]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#d69e2e" />
      <ThemedText style={styles.text} themeColor="textSecondary">
        {loadingText}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  text: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
