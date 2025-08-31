import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CrossPlatformProgressProps {
  currentStop: number;
  completedStops: number[];
  totalStops: number;
}

const CrossPlatformProgress: React.FC<CrossPlatformProgressProps> = ({
  currentStop,
  completedStops,
  totalStops,
}) => {
  const { theme } = useTheme();
  const progressPercent = totalStops > 0 ? Math.round((completedStops.length / totalStops) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.tertiary }]}>
      <Text style={[styles.platformText, { color: theme.text.tertiary }]}>
        {Platform.OS}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: theme.status.success }]} />
      </View>
      <Text style={[styles.progressText, { color: theme.text.secondary }]}>
        {progressPercent}% - Stop {currentStop} of {totalStops}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CrossPlatformProgress;
