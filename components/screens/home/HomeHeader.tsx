import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HomeHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function HomeHeader({ 
  title = "Crawls", 
  subtitle = "" 
}: HomeHeaderProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: 'transparent' }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { 
            color: theme.text.primary,
            textShadowColor: '#000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 0,
                         fontSize: 48,
             fontWeight: '400',
             lineHeight: 67.2,
            letterSpacing: -0.96,
            fontFamily: 'System', // Note: Pridi font would need to be changed to Pridi when font files are added
          }]}>{title}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('UserProfile')}
          >
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profilePlaceholder, { backgroundColor: theme.special.avatarPlaceholder }]}>
                <Text style={[styles.profilePlaceholderText, { color: theme.text.secondary }]}>
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
         paddingTop: 10,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  title: {
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 
