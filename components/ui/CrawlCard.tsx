import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Crawl } from '../../types/crawl';
import { calculateCrawlStatus, formatTimeForDisplay, parseTimeString } from '../../utils/crawlStatus';
import { getHeroImageSource } from '../auto-generated/ImageLoader';
import { useTheme } from '../context/ThemeContext';

interface CrawlCardProps {
  crawl: Crawl;
  onPress: (crawl: Crawl) => void;
  onStart: (crawl: Crawl) => void;
  isExpanded: boolean;
  width?: number;
  marginHorizontal?: number;
}

const CrawlCard: React.FC<CrawlCardProps> = ({ crawl, onPress, onStart, isExpanded, width, marginHorizontal }) => {
  const [animation] = useState(new Animated.Value(1));
  const [crawlStatus, setCrawlStatus] = useState<any>(null);
  const { theme } = useTheme();

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isExpanded ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  // Calculate crawl status for public crawls
  useEffect(() => {
    if (crawl['public-crawl'] && crawl.start_time) {
      const status = calculateCrawlStatus(crawl.start_time, crawl.duration, crawl.stops);
      setCrawlStatus(status);
      
      // Update status every minute for ongoing crawls
      if (status.status === 'ongoing' || status.status === 'upcoming') {
        const interval = setInterval(() => {
          const updatedStatus = calculateCrawlStatus(crawl.start_time, crawl.duration, crawl.stops);
          setCrawlStatus(updatedStatus);
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
      }
    }
  }, [crawl]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return theme.status.info;
      case 'ongoing': return theme.status.success;
      case 'completed': return theme.status.completed;
      default: return theme.text.tertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '⏰ Upcoming';
      case 'ongoing': return '🔄 Ongoing';
      case 'completed': return '✅ Completed';
      default: return '❓ Unknown';
    }
  };

  const formatStartTime = (startTime: string) => {
    try {
      const date = parseTimeString(startTime);
      return formatTimeForDisplay(date);
    } catch {
      return startTime;
    }
  };

  return (
    <Animated.View style={[
      styles.crawlCard, 
      { 
        transform: [{ scale: animation }], 
        width: width,
        marginHorizontal: marginHorizontal ?? 20,
        backgroundColor: theme.background.secondary,
        shadowColor: theme.shadow.primary
      }
    ]}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => onPress(crawl)} 
        activeOpacity={0.7}
        disabled={isExpanded}
      >
        {/* Hero Image - Top Half */}
        <Image 
          source={getHeroImageSource(crawl.assetFolder)} 
          style={styles.heroImage}
          resizeMode="cover"
          onError={(error) => console.log('Image loading error:', error)}
        />
        
        {/* Content - Bottom Half */}
        <View style={styles.cardBody}>
          <View style={styles.cardLeft}>
            <Text style={[styles.crawlTitle, { color: theme.text.primary }]}>{crawl.name}</Text>
            {!isExpanded && (
              <Text style={[styles.crawlDesc, { color: theme.text.secondary }]} numberOfLines={2}>{crawl.description}</Text>
            )}
            
            {/* Public Crawl Status and Timing */}
            {crawl['public-crawl'] && crawl.start_time && crawlStatus && (
              <View style={styles.publicCrawlInfo}>
                <View style={styles.statusRow}>
                  <Text style={[styles.statusBadge, { color: getStatusColor(crawlStatus.status) }]}>
                    {getStatusText(crawlStatus.status)}
                  </Text>
                  <Text style={[styles.startTime, { color: theme.text.secondary }]}>
                    🕐 {formatStartTime(crawl.start_time)}
                  </Text>
                </View>
                
                {crawlStatus.status === 'upcoming' && crawlStatus.timeUntilStart && (
                  <Text style={[styles.timingInfo, { color: theme.text.secondary }]}>
                    {crawlStatus.timeUntilStart}
                  </Text>
                )}
                
                {crawlStatus.status === 'ongoing' && (
                  <View style={styles.ongoingInfo}>
                    <Text style={[styles.timingInfo, { color: theme.text.secondary }]}>
                      {crawlStatus.timeSinceStart}
                    </Text>
                    {crawlStatus.currentStopIndex !== undefined && crawl.stops && (
                      <Text style={[styles.currentStop, { color: theme.text.secondary }]}>
                        Stop {crawlStatus.currentStopIndex + 1} of {crawl.stops.length}
                      </Text>
                    )}
                  </View>
                )}
                
                {crawlStatus.status === 'completed' && (
                  <Text style={[styles.timingInfo, { color: theme.text.secondary }]}>
                    Ended {crawlStatus.estimatedEndTime && formatTimeForDisplay(crawlStatus.estimatedEndTime)}
                  </Text>
                )}
              </View>
            )}
            
            <View style={styles.crawlMeta}>
              <Text style={[styles.metaText, { color: theme.text.tertiary }]}>{crawl.duration}</Text>
              <Text style={[styles.metaText, { color: theme.text.tertiary }]}>{crawl.distance}</Text>
              {crawl.stops && (
                <Text style={[styles.metaText, { color: theme.text.tertiary }]}>{crawl.stops.length} stops</Text>
              )}
            </View>
          </View>
          
          {isExpanded && (
            <TouchableOpacity 
              style={[
                styles.startButton, 
                { backgroundColor: crawl['public-crawl'] && crawlStatus?.status === 'completed' ? theme.button.disabled : theme.button.primary }
              ]} 
              onPress={() => onStart(crawl)}
              activeOpacity={0.8}
              disabled={crawl['public-crawl'] && crawlStatus?.status === 'completed'}
            >
              <Text style={[
                styles.startButtonText,
                { color: crawl['public-crawl'] && crawlStatus?.status === 'completed' ? theme.text.disabled : theme.text.inverse }
              ]}>
                {crawl['public-crawl'] && crawlStatus?.status === 'completed' ? 'Passed' : 'Start'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  crawlCard: {
    borderRadius: 12,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'column',
    padding: 0,
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  crawlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  crawlDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  publicCrawlInfo: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  startTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  timingInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  ongoingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentStop: {
    fontSize: 12,
    fontWeight: '500',
  },
  crawlMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    // Will be overridden by theme
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    // Will be overridden by theme
  },
  heroImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBody: {
    padding: 16,
    flexDirection: 'row',
  },
});

export default CrawlCard; 