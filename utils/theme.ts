// Color Theme System
export interface ColorTheme {
  // Background Colors
  background: {
    primary: string;      // Main app background
    secondary: string;    // Card backgrounds
    tertiary: string;     // Section backgrounds
    modal: string;        // Modal backgrounds
  };
  
  // Text Colors
  text: {
    primary: string;      // Main text color
    secondary: string;    // Secondary text (descriptions, captions)
    tertiary: string;     // Muted text (timestamps, metadata)
    inverse: string;      // Text on colored backgrounds
    disabled: string;     // Disabled text
    button: string;       // Text for buttons with colored backgrounds
  };
  
  // Button Colors
  button: {
    primary: string;      // Primary action buttons
    secondary: string;    // Secondary action buttons
    success: string;      // Success/complete buttons
    danger: string;       // Danger/delete buttons
    disabled: string;     // Disabled buttons
    text: string;         // Button text color
    textSecondary: string; // Secondary button text
  };
  
  // Status Colors
  status: {
    success: string;      // Success states
    warning: string;      // Warning states
    error: string;        // Error states
    info: string;         // Info states
    upcoming: string;     // Upcoming events
    ongoing: string;      // Ongoing events
    completed: string;    // Completed events
  };
  
  // Border Colors
  border: {
    primary: string;      // Main borders
    secondary: string;    // Light borders
    success: string;      // Success state borders
  };
  
  // Shadow Colors
  shadow: {
    primary: string;      // Main shadow color
  };
  
  // Special Colors
  special: {
    googleBlue: string;   // Google sign-in button
    avatarPlaceholder: string; // Avatar placeholder background
  };
  
  // Status Bar Configuration
  statusBar: {
    style: 'light-content' | 'dark-content';  // Status bar text/icons style
    backgroundColor: string;   // Status bar background color
  };
}

// Light Theme
export const lightTheme: ColorTheme = {
  background: {
    primary: '#f8f9fa',      // Main app background
    secondary: '#EB4335',    // Card backgrounds
    tertiary: '#f8f9fa',     // Section backgrounds
    modal: 'rgba(255, 255, 255, 0.95)', // Modal backgrounds
  },
  
  text: {
    primary: '#1a1a1a',      // Main text color
    secondary: '#666',       // Secondary text
    tertiary: '#999',        // Muted text
    inverse: '#fff',         // Text on colored backgrounds
    disabled: '#ccc',        // Disabled text
    button: '#000',          // Text for buttons with colored backgrounds (black in light mode)
  },
  
  button: {
    primary: '#EB4335',      // Primary action buttons
    secondary: '#f8f9fa',    // Secondary action buttons
    success: '#28a745',      // Success/complete buttons
    danger: '#ff4757',       // Danger/delete buttons
    disabled: '#ccc',        // Disabled buttons
    text: '#fff',            // Button text color
    textSecondary: '#1a1a1a', // Secondary button text
  },
  
  status: {
    success: '#28a745',      // Success states
    warning: '#FF9800',      // Warning states
    error: '#ff4757',        // Error states
    info: '#007AFF',         // Info states
    upcoming: '#007AFF',     // Upcoming events
    ongoing: '#28a745',      // Ongoing events
    completed: '#6c757d',    // Completed events
  },
  
  border: {
    primary: '#ddd',         // Main borders
    secondary: '#f0f0f0',    // Light borders
    success: '#28a745',      // Success state borders
  },
  
  shadow: {
    primary: '#000',         // Main shadow color
  },
  
  special: {
    googleBlue: '#4285F4',   // Google sign-in button
    avatarPlaceholder: '#e1e5e9', // Avatar placeholder background
  },
  
  statusBar: {
    style: 'dark-content' as const,  // Dark icons for light background
    backgroundColor: '#f8f9fa', // Light status bar background
  },
};

// Dark Theme (Default)
export const darkTheme: ColorTheme = {
  background: {
    primary: '#1a1a1a',      // Dark main background
    secondary: '#EB4335',    // Dark card backgrounds
    tertiary: '#333333',     // Dark section backgrounds
    modal: 'rgba(45, 45, 45, 0.95)', // Dark modal backgrounds
  },
  
  text: {
    primary: '#ffffff',      // Light main text
    secondary: '#cccccc',    // Light secondary text
    tertiary: '#999999',     // Light muted text
    inverse: '#1a1a1a',      // Dark text on light backgrounds
    disabled: '#666666',     // Dark disabled text
    button: '#ffffff',       // Text for buttons with colored backgrounds (white in dark mode)
  },
  
  button: {
    primary: '#EB4335',      // Primary action buttons
    secondary: '#3a3a3a',    // Dark secondary buttons
    success: '#30D158',      // iOS green for dark mode
    danger: '#FF453A',       // iOS red for dark mode
    disabled: '#666666',     // Dark disabled buttons
    text: '#ffffff',         // Light button text
    textSecondary: '#ffffff', // Light secondary button text
  },
  
  status: {
    success: '#30D158',      // iOS green
    warning: '#FF9F0A',      // iOS orange
    error: '#FF453A',        // iOS red
    info: '#0A84FF',         // iOS blue
    upcoming: '#0A84FF',     // iOS blue
    ongoing: '#30D158',      // iOS green
    completed: '#8E8E93',    // iOS gray
  },
  
  border: {
    primary: '#3a3a3a',      // Dark borders
    secondary: '#2d2d2d',    // Darker borders
    success: '#30D158',      // Dark success borders
  },
  
  shadow: {
    primary: '#000000',      // Dark shadow
  },
  
  special: {
    googleBlue: '#4285F4',   // Keep Google blue
    avatarPlaceholder: '#3a3a3a', // Dark avatar placeholder
  },
  
  statusBar: {
    style: 'light-content' as const,  // Light icons for dark background
    backgroundColor: '#1a1a1a', // Dark status bar background
  },
};



// Theme type for easy switching
export type ThemeType = 'light' | 'dark';

// Theme mapping
export const themes: Record<ThemeType, ColorTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

// Default theme
export const defaultTheme: ThemeType = 'dark'; 