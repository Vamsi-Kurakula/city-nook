import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CrawlStop } from '../../../types/crawl';

interface CrossPlatformStopActionsProps {
  stop: CrawlStop;
  stopNumber: number;
  isCompleted: boolean;
  onStart: () => void;
  onRecs: () => void;
}

const CrossPlatformStopActions: React.FC<CrossPlatformStopActionsProps> = ({
  stop,
  stopNumber,
  isCompleted,
  onStart,
  onRecs,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.platformText, { color: theme.text.tertiary }]}>
        {Platform.OS}
      </Text>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Stop {stopNumber}: {stop.location_name || 'Location'}
      </Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.button.primary }]}
          onPress={onRecs}
        >
          <Text style={[styles.buttonText, { color: theme.text.button }]}>
            Recs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isCompleted ? theme.button.disabled : theme.button.secondary }
          ]}
          onPress={onStart}
          disabled={isCompleted}
        >
          <Text style={[styles.buttonText, { color: theme.text.button }]}>
            {isCompleted ? 'Completed' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
    // Platform-specific styling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  platformText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrossPlatformStopActions;
