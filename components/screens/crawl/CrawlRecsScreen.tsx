import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import BackButton from '../../ui/common/BackButton';
import { CrawlStop } from '../../../types/crawl';

const CrawlRecsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  
  const routeParams = route.params as { 
    crawl?: any; 
    stop?: CrawlStop; 
    stopNumber?: number;
  } | undefined;
  const crawl = routeParams?.crawl;
  const stop = routeParams?.stop;
  const stopNumber = routeParams?.stopNumber;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}> 
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Recommendations
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Recommendations
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {crawl ? `Crawl: ${crawl.name}` : 'No crawl selected'}
        </Text>
        <Text style={[styles.stopInfo, { color: theme.text.secondary }]}>
          {stop ? `Stop ${stopNumber}: ${stop.location_name || 'Unknown Location'}` : 'No stop selected'}
        </Text>
        <Text style={[styles.description, { color: theme.text.tertiary }]}>
          This is where we'll show recommendations for this stop.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  stopInfo: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CrawlRecsScreen; 