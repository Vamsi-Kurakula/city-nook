import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HomeHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function HomeHeader({ 
  title = "City Crawler", 
  subtitle = "Discover your city, one stop at a time" 
}: HomeHeaderProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.secondary }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
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