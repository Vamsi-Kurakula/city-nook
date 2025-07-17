import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendFriendRequest, getPendingRequests, acceptFriendRequest } from '../../utils/database/friendRequestOperations';
import { getFriendsList, areFriends } from '../../utils/database/friendshipOperations';
import { getPersonalProfile } from '../../utils/database/profileOperations';
import { SocialError } from '../../types/social';
import { useAuthContext } from '../context/AuthContext';

export default function SocialTestScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { user } = useAuthContext();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        addResult('❌ No authenticated user found');
        return;
      }

      // Test basic profile operations with real user ID
      const profile = await getPersonalProfile(user.id);
      addResult('✅ Database connection successful');
      addResult(`✅ User profile loaded: ${profile.full_name}`);
    } catch (error) {
      if (error instanceof SocialError) {
        addResult(`❌ ${error.message} (${error.code})`);
      } else {
        addResult(`❌ Unexpected error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testFriendRequest = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        addResult('❌ No authenticated user found');
        return;
      }

      // This will fail with proper error handling - self-friending
      await sendFriendRequest(user.id, user.id, 'Test message');
      addResult('❌ Should have failed - self-friending');
    } catch (error) {
      if (error instanceof SocialError && error.code === 'CANNOT_REQUEST_SELF') {
        addResult('✅ Self-friending properly prevented');
      } else {
        addResult(`❌ Unexpected error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testGetFriendsList = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        addResult('❌ No authenticated user found');
        return;
      }

      const friends = await getFriendsList(user.id);
      addResult(`✅ Friends list retrieved: ${friends.length} friends`);
    } catch (error) {
      if (error instanceof SocialError) {
        addResult(`❌ ${error.message} (${error.code})`);
      } else {
        addResult(`❌ Unexpected error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testAreFriends = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        addResult('❌ No authenticated user found');
        return;
      }

      // Test with the same user (should return false)
      const isFriends = await areFriends(user.id, user.id);
      addResult(`✅ Are friends check: ${isFriends ? 'Yes' : 'No'} (should be No for same user)`);
    } catch (error) {
      if (error instanceof SocialError) {
        addResult(`❌ ${error.message} (${error.code})`);
      } else {
        addResult(`❌ Unexpected error: ${(error as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Features Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testDatabaseConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Database Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testFriendRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Friend Request</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testGetFriendsList}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Get Friends List</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={testAreFriends}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Are Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>{result}</Text>
        ))}
        {results.length === 0 && (
          <Text style={styles.noResults}>No tests run yet</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  noResults: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
}); 