import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Crawl } from '../types/crawl';
import { calculateCrawlStatus, formatTimeForDisplay, parseTimeString } from '../utils/crawlStatus';

interface CrawlCardProps {
  crawl: Crawl;
  onPress: (crawl: Crawl) => void;
  onStart: (crawl: Crawl) => void;
  isExpanded: boolean;
}

const CrawlCard: React.FC<CrawlCardProps> = ({ crawl, onPress, onStart, isExpanded }) => {
  const [animation] = useState(new Animated.Value(1));
  const [crawlStatus, setCrawlStatus] = useState<any>(null);

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isExpanded ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  // Calculate crawl status for public crawls
  useEffect(() => {
    if (crawl['public-crawl'] && crawl.start_time) {
      const status = calculateCrawlStatus(crawl.start_time, crawl.duration, crawl.steps);
      setCrawlStatus(status);
      
      // Update status every minute for ongoing crawls
      if (status.status === 'ongoing' || status.status === 'upcoming') {
        const interval = setInterval(() => {
          const updatedStatus = calculateCrawlStatus(crawl.start_time, crawl.duration, crawl.steps);
          setCrawlStatus(updatedStatus);
        }, 60000); // Update every minute
        
        return () => clearInterval(interval);
      }
    }
  }, [crawl]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#007AFF';
      case 'ongoing': return '#28a745';
      case 'completed': return '#6c757d';
      default: return '#999';
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
    <Animated.View style={[styles.crawlCard, { transform: [{ scale: animation }] }]}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => onPress(crawl)} 
        activeOpacity={0.7}
        disabled={isExpanded}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.crawlTitle}>{crawl.name}</Text>
          {!isExpanded && (
            <Text style={styles.crawlDesc} numberOfLines={2}>{crawl.description}</Text>
          )}
          
          {/* Public Crawl Status and Timing */}
          {crawl['public-crawl'] && crawl.start_time && crawlStatus && (
            <View style={styles.publicCrawlInfo}>
              <View style={styles.statusRow}>
                <Text style={[styles.statusBadge, { color: getStatusColor(crawlStatus.status) }]}>
                  {getStatusText(crawlStatus.status)}
                </Text>
                <Text style={styles.startTime}>
                  🕐 {formatStartTime(crawl.start_time)}
                </Text>
              </View>
              
              {crawlStatus.status === 'upcoming' && crawlStatus.timeUntilStart && (
                <Text style={styles.timingInfo}>
                  {crawlStatus.timeUntilStart}
                </Text>
              )}
              
              {crawlStatus.status === 'ongoing' && (
                <View style={styles.ongoingInfo}>
                  <Text style={styles.timingInfo}>
                    {crawlStatus.timeSinceStart}
                  </Text>
                  {crawlStatus.currentStepIndex !== undefined && crawl.steps && (
                    <Text style={styles.currentStep}>
                      Step {crawlStatus.currentStepIndex + 1} of {crawl.steps.length}
                    </Text>
                  )}
                </View>
              )}
              
              {crawlStatus.status === 'completed' && (
                <Text style={styles.timingInfo}>
                  Ended {crawlStatus.estimatedEndTime && formatTimeForDisplay(crawlStatus.estimatedEndTime)}
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.crawlMeta}>
            <Text style={styles.metaText}>{crawl.duration}</Text>
            <Text style={styles.metaText}>{crawl.distance}</Text>
            {crawl.steps && (
              <Text style={styles.metaText}>{crawl.steps.length} steps</Text>
            )}
          </View>
        </View>
        
        {isExpanded && (
          <TouchableOpacity 
            style={[
              styles.startButton, 
              crawl['public-crawl'] && crawlStatus?.status === 'completed' && styles.startButtonDisabled
            ]} 
            onPress={() => onStart(crawl)}
            activeOpacity={0.8}
            disabled={crawl['public-crawl'] && crawlStatus?.status === 'completed'}
          >
            <Text style={[
              styles.startButtonText,
              crawl['public-crawl'] && crawlStatus?.status === 'completed' && styles.startButtonTextDisabled
            ]}>
              {crawl['public-crawl'] && crawlStatus?.status === 'completed' ? 'Passed' : 'Start'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  crawlCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  crawlTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  crawlDesc: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    fontWeight: '500',
  },
  timingInfo: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  ongoingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentStep: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  crawlMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: '#999',
  },
});

export default CrawlCard; 