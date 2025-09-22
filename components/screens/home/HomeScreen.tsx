import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, createTextStyles, spacing } from '../../context';
import { AuthorizedStackParamList } from '../../navigation/AuthorizedNavigator';

type HomeScreenNavigationProp = StackNavigationProp<AuthorizedStackParamList, 'Home'>;

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const textStyles = createTextStyles(theme);

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.content}>
          <Text style={[textStyles.subtitle, { color: theme.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Crawls
          </Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Image
              source={{ 
                uri: user?.imageUrl || 'https://via.placeholder.com/50x50/666666/FFFFFF?text=U'
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
