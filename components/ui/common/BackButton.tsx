import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, style, testID }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.backButton,
        { backgroundColor: theme.background.tertiary, shadowColor: theme.shadow.primary },
        style,
      ]}
      testID={testID}
    >
      <Ionicons name="arrow-back" size={24} color={theme.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    marginRight: 8,
  },
});

export default BackButton; 