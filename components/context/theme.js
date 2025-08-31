// City Crawler Theme Configuration
// This file is generated from theme.yaml and serves as the single source of truth
// for all theme colors in the React Native app

export const theme = {
  background: {
    primary: "#1a1a1a",      // Main app background
    secondary: "#2a2a2a",    // Card backgrounds
    tertiary: "#3a3a3a",     // Subtle backgrounds
    overlay: "rgba(0, 0, 0, 0.7)",  // Modal overlays
  },
  
  text: {
    primary: "#ffffff",       // Main text
    secondary: "#cccccc",     // Secondary text
    tertiary: "#999999",      // Muted text
    inverse: "#ffffff",       // Text on colored backgrounds
    placeholder: "#666666",   // Input placeholders
  },
  
  button: {
    primary: "#007AFF",       // Primary actions
    secondary: "#5856D6",     // Secondary actions
    tertiary: "#FF9500",      // Tertiary actions
    disabled: "#666666",      // Disabled state
    danger: "#FF3B30",        // Destructive actions
  },
  
  status: {
    success: "#34C759",       // Success states
    warning: "#FF9500",       // Warning states
    error: "#FF3B30",         // Error states
    info: "#007AFF",          // Information states
  },
  
  border: {
    primary: "#3a3a3a",       // Main borders
    secondary: "#4a4a4a",     // Subtle borders
    accent: "#007AFF",        // Accent borders
  },
  
  shadow: {
    primary: "rgba(0, 0, 0, 0.3)",   // Main shadows
    secondary: "rgba(0, 0, 0, 0.1)", // Subtle shadows
  },
  
  special: {
    accent: "#007AFF",        // Brand accent color
    highlight: "#FFD700",     // Highlight color
    gradient: {
      start: "#000000",       // Gradient start (black)
      end: "#1a1a2e",         // Gradient end (dark navy)
    },
  },
};

export default theme;
