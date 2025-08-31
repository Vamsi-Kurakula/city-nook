import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: any;
  // Allow customizing the gradient for different use cases
  variant?: 'full' | 'page' | 'modal';
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  style,
  variant = 'full'
}) => {
  // Different gradient configurations for different use cases
  const getGradientConfig = () => {
    switch (variant) {
      case 'page':
        // Page-level gradient - more subtle but still beautiful black-to-blue/grey
        return {
          colors: ['rgba(0, 0, 0, 0.85)', 'rgba(30, 30, 60, 0.75)', 'rgba(50, 50, 100, 0.65)'],
          locations: [0, 0.5, 1],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 }
        };
      case 'modal':
        // Modal-level gradient - very subtle but still beautiful black-to-blue/grey
        return {
          colors: ['rgba(0, 0, 0, 0.98)', 'rgba(30, 30, 60, 0.95)', 'rgba(50, 50, 100, 0.92)'],
          locations: [0, 0.5, 1],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 }
        };
      default:
        // Full app gradient - the original beautiful black-to-blue/grey design
        return {
          colors: ['#000000', '#1e1e3c', '#323264'],
          locations: [0, 0.5, 1],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 }
        };
    }
  };

  const gradientConfig = getGradientConfig();

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientConfig.colors as any}
        locations={gradientConfig.locations as any}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});

export default GradientBackground; 