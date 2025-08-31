import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SimpleMap: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <Text style={[styles.text, { color: theme.text.primary }]}>
        Map Placeholder
      </Text>
      <Text style={[styles.subtext, { color: theme.text.secondary }]}>
        Platform: {Platform.OS}
      </Text>
      <Text style={[styles.subtext, { color: theme.text.secondary }]}>
        Basic map will be added here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 10,
    // Platform-specific shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default SimpleMap;
