# 🔧 Common UI Components

## **Overview**

The `common/` directory contains shared UI components that are used across multiple features and screens. These components provide consistent functionality and appearance throughout the application.

## **Files**

### **LoadingScreen.tsx**
**Purpose**: Displays loading states with customizable content and animations

**Key Features**:
- Customizable loading messages
- Animated loading indicators
- Progress tracking support
- Consistent loading UI across the app

**Props Interface**:
```typescript
interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Progress Tracking**: Displays progress for long-running operations
- **State Management**: Integrates with loading state from contexts
- **Animation**: Smooth loading animations

**Usage Example**:
```typescript
<LoadingScreen 
  message="Loading crawl data..." 
  showProgress={true} 
  progress={0.75} 
/>
```

### **StatusBar.tsx**
**Purpose**: Manages the device status bar appearance and behavior

**Key Features**:
- Dynamic status bar styling
- Theme-aware appearance
- Platform-specific behavior
- Consistent status bar management

**Props Interface**:
```typescript
interface StatusBarProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
  hidden?: boolean;
}
```

**API Integration**:
- **Theme Context**: Adapts to current theme
- **Platform APIs**: Uses platform-specific status bar APIs
- **Navigation**: Coordinates with navigation header styling

**Usage Example**:
```typescript
<StatusBar 
  backgroundColor={theme.colors.primary} 
  barStyle="light-content" 
/>
```

### **BackButton.tsx**
**Purpose**: Custom back button component with consistent styling and behavior

**Key Features**:
- Customizable appearance
- Navigation integration
- Accessibility support
- Platform-specific styling

**Props Interface**:
```typescript
interface BackButtonProps {
  onPress?: () => void;
  title?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}
```

**API Integration**:
- **React Navigation**: Integrates with navigation system
- **Theme Context**: Uses theme colors and styling
- **Accessibility**: Screen reader support

**Usage Example**:
```typescript
<BackButton 
  onPress={() => navigation.goBack()} 
  title="Back" 
  color={theme.colors.primary} 
/>
```

### **index.ts**
**Purpose**: Exports all common UI components for easy importing

**Exports**:
```typescript
export { default as LoadingScreen } from './LoadingScreen';
export { default as StatusBar } from './StatusBar';
export { default as BackButton } from './BackButton';
```

## **Component Patterns**

### **1. Consistent Styling**
All common components follow the same styling patterns:
- **Theme Integration**: Use theme context for colors and styling
- **Responsive Design**: Adapt to different screen sizes
- **Platform Awareness**: Platform-specific styling when needed
- **Accessibility**: Built-in accessibility support

### **2. Props Interface**
Common props pattern across all components:
```typescript
interface CommonComponentProps {
  // Styling props
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  
  // Event handlers
  onPress?: () => void;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Theme props
  color?: string;
  size?: 'small' | 'medium' | 'large';
}
```

### **3. Error Handling**
All components include error handling:
- **Graceful Degradation**: Fallback behavior for errors
- **User Feedback**: Clear error messages
- **Recovery Options**: Retry mechanisms where appropriate

## **Usage Patterns**

### **1. Loading States**
```typescript
// Simple loading
<LoadingScreen message="Loading..." />

// Progress loading
<LoadingScreen 
  message="Uploading photo..." 
  showProgress={true} 
  progress={uploadProgress} 
/>

// Custom styling
<LoadingScreen 
  message="Processing..." 
  style={customLoadingStyle} 
/>
```

### **2. Status Bar Management**
```typescript
// Theme-aware status bar
<StatusBar 
  backgroundColor={theme.colors.background} 
  barStyle={theme.isDark ? 'light-content' : 'dark-content'} 
/>

// Custom status bar
<StatusBar 
  backgroundColor="#007AFF" 
  barStyle="light-content" 
  translucent={true} 
/>
```

### **3. Navigation Back Button**
```typescript
// Default back button
<BackButton onPress={() => navigation.goBack()} />

// Custom back button
<BackButton 
  title="Cancel" 
  color={theme.colors.error} 
  onPress={handleCancel} 
/>
```

## **Theme Integration**

### **Theme Usage**
```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  loadingIndicator: {
    color: theme.colors.primary,
  },
});
```

### **Theme Properties Used**
- **Colors**: Primary, secondary, background, text colors
- **Typography**: Font sizes and weights
- **Spacing**: Consistent spacing values
- **Borders**: Border radius and styles

## **Accessibility Features**

### **Screen Reader Support**
```typescript
const accessibilityProps = {
  accessible: true,
  accessibilityLabel: 'Loading screen with progress',
  accessibilityHint: 'Shows the current loading progress',
  accessibilityRole: 'progressbar',
  accessibilityValue: {
    min: 0,
    max: 100,
    now: progress,
  },
};
```

### **Touch Target Sizes**
- **Minimum Size**: 44x44 points for touch targets
- **Spacing**: Adequate spacing between interactive elements
- **Visual Feedback**: Clear visual feedback for interactions

## **Performance Considerations**

### **Optimization Strategies**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers
- **Lazy Loading**: Load components on demand

### **Memory Management**
- **Cleanup**: Proper cleanup in useEffect
- **Event Listeners**: Remove event listeners on unmount
- **Animations**: Clean up animations on component unmount

## **Testing Strategy**

### **Component Testing**
```typescript
// LoadingScreen test
describe('LoadingScreen', () => {
  it('renders with custom message', () => {
    const { getByText } = render(
      <LoadingScreen message="Custom loading message" />
    );
    expect(getByText('Custom loading message')).toBeTruthy();
  });

  it('shows progress when enabled', () => {
    const { getByTestId } = render(
      <LoadingScreen showProgress={true} progress={50} />
    );
    expect(getByTestId('progress-indicator')).toBeTruthy();
  });
});
```

### **Accessibility Testing**
```typescript
// Accessibility test
it('has proper accessibility labels', () => {
  const { getByLabelText } = render(
    <BackButton accessibilityLabel="Go back" />
  );
  expect(getByLabelText('Go back')).toBeTruthy();
});
```

## **Development Guidelines**

### **Component Creation**
1. **Define Purpose**: Clear, single responsibility
2. **Design Interface**: Consistent props interface
3. **Add Styling**: Theme-aware styling
4. **Handle Interactions**: User interaction logic
5. **Add Accessibility**: Screen reader support
6. **Test Thoroughly**: Unit and integration tests

### **Best Practices**
- **Reusability**: Design for reuse across features
- **Consistency**: Follow established patterns
- **Performance**: Optimize for smooth rendering
- **Accessibility**: Build with accessibility in mind
- **Documentation**: Document usage and props

## **Dependencies**

### **External Dependencies**
- **React Native**: Core UI components
- **Expo**: Platform-specific APIs
- **React Navigation**: Navigation integration

### **Internal Dependencies**
- **Context**: Theme and navigation contexts
- **Utils**: Common utility functions
- **Types**: Component type definitions
- **Constants**: Design system constants

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 