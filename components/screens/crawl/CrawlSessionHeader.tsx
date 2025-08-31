import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import BackButton from '../../ui/common/BackButton';

interface CrawlSessionHeaderProps {
  onExit: () => void;
  progressPercent: number;
  currentStop: number;
  totalStops: number;
}

const CrawlSessionHeader: React.FC<CrawlSessionHeaderProps> = ({
  onExit,
  progressPercent,
  currentStop,
  totalStops,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Top Section - Exit Button */}
      <View style={[styles.topSection, { borderBottomColor: theme.border.secondary }]}>
        <BackButton onPress={onExit} style={styles.exitButton} />
        <View style={styles.topRightButtons}>
          {/* Future buttons will go here */}
        </View>
      </View>

      {/* Progress Section */}
      <View style={[styles.progressSection, { backgroundColor: theme.background.tertiary }]}>
        <View style={styles.progressBarWrapper}>
          <View style={[styles.progressBarBg, { backgroundColor: theme.border.secondary }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.status.success }]} />
          </View>
          <Text style={[styles.progressPercentText, { color: theme.text.secondary }]}>
            {progressPercent}%
          </Text>
        </View>
        <Text style={[styles.progressText, { color: theme.text.secondary }]}>
          Stop {currentStop} of {totalStops}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  exitButton: { 
    padding: 8,
    borderRadius: 6,
  },
  topRightButtons: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default CrawlSessionHeader;
