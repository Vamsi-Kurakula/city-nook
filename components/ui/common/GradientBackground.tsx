import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const GradientBackground: React.FC<GradientBackgroundProps> = memo(({ children, style }) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.background.gradient.start, theme.background.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          flex: 1,
          position: 'relative',
        },
        style
      ]}
      pointerEvents="box-none"
    >
      {children}
    </LinearGradient>
  );
});

GradientBackground.displayName = 'GradientBackground';

export default GradientBackground; 