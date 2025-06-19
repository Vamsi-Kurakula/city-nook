import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as yaml from 'js-yaml';

// Placeholder: We'll load this from a YAML file
const defaultCrawls = [
  { id: '1', name: 'Historic Downtown Crawl', description: "Explore the city's oldest landmarks." },
  { id: '2', name: 'Foodie Adventure', description: 'Taste the best local cuisine.' },
  { id: '3', name: 'Art & Culture Walk', description: 'Visit galleries and street art spots.' },
];

export default function App() {
  const [crawls, setCrawls] = useState(defaultCrawls);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCrawls = async () => {
      try {
        // Load the asset (YAML file) from the bundled assets
        const asset = Asset.fromModule(require('./assets/crawls.yml'));
        await asset.downloadAsync();
        const yamlString = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const data = yaml.load(yamlString);
        if (data && Array.isArray(data.crawls)) {
          setCrawls(data.crawls);
        } else {
          setCrawls(defaultCrawls);
        }
      } catch (e) {
        setCrawls(defaultCrawls);
      } finally {
        setLoading(false);
      }
    };
    loadCrawls();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>City Crawls</Text>
      <FlatList
        data={crawls}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.crawlCard}>
            <Text style={styles.crawlTitle}>{item.name}</Text>
            <Text style={styles.crawlDesc}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  crawlCard: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  crawlTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  crawlDesc: {
    fontSize: 15,
    color: '#555',
  },
});
