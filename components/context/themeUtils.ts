import { StyleSheet } from 'react-native';
import { Theme } from './ThemeContext';

// Common button styles
export const createButtonStyles = (theme: Theme) => StyleSheet.create({
  primary: {
    backgroundColor: theme.button.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.button.secondary,
  },
  tertiary: {
    backgroundColor: theme.button.tertiary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: theme.button.disabled,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  danger: {
    backgroundColor: theme.button.danger,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Common text styles
export const createTextStyles = (theme: Theme) => StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text.primary,
  },
  body: {
    fontSize: 16,
    color: theme.text.primary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    color: theme.text.tertiary,
    lineHeight: 18,
  },
  button: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.inverse,
  },
  link: {
    fontSize: 16,
    color: theme.button.primary,
    fontWeight: '500',
  },
});

// Common input styles
export const createInputStyles = (theme: Theme) => StyleSheet.create({
  base: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  focused: {
    borderColor: theme.border.accent,
    borderWidth: 2,
  },
  error: {
    borderColor: theme.status.error,
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: theme.background.tertiary,
    opacity: 0.6,
  },
});

// Common card styles
export const createCardStyles = (theme: Theme) => StyleSheet.create({
  base: {
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  flat: {
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
});

// Common spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Common border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
} as const;

// Common shadows
export const createShadowStyles = (theme: Theme) => StyleSheet.create({
  small: {
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: theme.shadow.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
