import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { testSupabaseConnection } from '../../../utils/networkTest';
import { getImageUrlWithFallback } from '../../../utils/database/imageLoader';
import DatabaseImage from '../crawl/DatabaseImage';

interface ImageLoadingTestProps {
  onClose?: () => void;
}

export default function ImageLoadingTest({ onClose }: ImageLoadingTestProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runNetworkTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🧪 Starting Image Loading Test...');
    
    try {
      // Test network connectivity
      addResult('🔍 Testing network connectivity...');
      await testSupabaseConnection();
      addResult('✅ Network test completed');
      
      // Test URL fallback strategy
      addResult('🔍 Testing URL fallback strategy...');
      
      const testUrls = [
        'https://mrqyrxsmrffpaqgzudch.supabase.co/storage/v1/object/public/crawl-images/andersonville-brewery-crawl/hero.jpg',
        'https://mrqyrxsmrffpaqgzudch.supabase.co/storage/v1/object/public/crawl-images/historic-downtown-crawl/hero.jpg',
        'https://example.com/test-image.jpg',
        'assets/icon.png'
      ];
      
      for (const url of testUrls) {
        addResult(`📸 Testing URL: ${url}`);
        try {
          const result = await getImageUrlWithFallback(url);
          addResult(`✅ Result: ${result}`);
          
          if (result !== url) {
            addResult('🔄 URL was transformed (production fix applied)');
          } else {
            addResult('📁 URL unchanged (non-Supabase or fallback)');
          }
        } catch (error) {
          addResult(`❌ Error testing URL: ${error}`);
        }
      }
      
      addResult('✅ Image loading solution test completed!');
      addResult('📋 Check console logs for detailed network test results');
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Image Loading Test</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        onPress={runNetworkTest} 
        disabled={isRunning}
        style={[styles.testButton, isRunning && styles.testButtonDisabled]}
      >
        <Text style={styles.testButtonText}>
          {isRunning ? 'Running Test...' : 'Run Image Loading Test'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
      
      <View style={styles.imageTestContainer}>
        <Text style={styles.sectionTitle}>Live Image Test</Text>
        <DatabaseImage 
          heroImageUrl="https://mrqyrxsmrffpaqgzudch.supabase.co/storage/v1/object/public/crawl-images/andersonville-brewery-crawl/hero.jpg"
          style={styles.testImage}
          resizeMode="cover"
          onError={(error) => addResult(`❌ Image load error: ${error}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 4,
  },
  imageTestContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  testImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
}); 