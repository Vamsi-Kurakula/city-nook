import React from 'react';
import { StatusBar as RNStatusBar, StatusBarStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const StatusBar: React.FC = () => {
  const { theme } = useTheme();

  return (
    <RNStatusBar
      barStyle={theme.statusBar.style as StatusBarStyle}
      backgroundColor={theme.statusBar.backgroundColor}
      translucent={false}
    />
  );
};

export default StatusBar; 