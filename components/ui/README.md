# 🎨 UI Directory

## **Overview**

The `ui/` directory contains reusable UI components organized by functionality and purpose. These components follow a consistent design system and are designed to be composable, accessible, and performant across the application.

## **Directory Structure**

```
ui/
├── common/          # Shared UI components used across features
├── crawl/           # Crawl-specific UI components
├── social/          # Social feature UI components
└── stops/           # Stop type UI components
```

## **Design System**

### **Component Architecture**
- **Atomic Design**: Components follow atomic design principles
- **Composition**: Components are built to be composable
- **Consistency**: Uniform styling and behavior patterns
- **Accessibility**: Built with accessibility in mind

### **Styling Approach**
- **Theme-Based**: Components use theme context for styling
- **Responsive**: Adapt to different screen sizes
- **Platform-Aware**: Platform-specific styling when needed
- **Performance**: Optimized for smooth rendering

## **Component Categories**

### **1. Common Components (`common/`)**
- **LoadingScreen**: Application loading states
- **StatusBar**: Status bar management
- **BackButton**: Navigation back button
- **ImageLoadingTest**: Image loading testing component

### **2. Crawl Components (`crawl/`)**
- **CrawlCard**: Crawl preview and information display
- **CrawlList**: List of crawls with filtering
- **CrawlMap**: Interactive map for crawl visualization
- **DatabaseImage**: Image loading with fallback handling

### **3. Social Components (`social/`)**
- **FriendCard**: Friend profile display
- **FriendRequestCard**: Friend request management
- **UserSearchCard**: User search result display

### **4. Stop Components (`stops/`)**
- **LocationStop**: Location-based stop interaction
- **PhotoStop**: Photo capture and upload stop
- **RiddleStop**: Riddle/question stop interaction
- **ButtonStop**: Simple button-based stop
- **StopComponent**: Base stop component wrapper

## **Component Patterns**

### **1. Props Interface**
```typescript
interface ComponentProps {
  // Required props
  requiredProp: string;
  
  // Optional props with defaults
  optionalProp?: string;
  
  // Event handlers
  onPress?: () => void;
  onChange?: (value: string) => void;
  
  // Styling props
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}
```

### **2. Component Structure**
```typescript
const Component: React.FC<ComponentProps> = ({
  requiredProp,
  optionalProp = 'default',
  onPress,
  style,
  containerStyle,
}) => {
  // State management
  const [state, setState] = useState(initialState);
  
  // Effects
  useEffect(() => {
    // Component logic
  }, [dependencies]);
  
  // Event handlers
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);
  
  // Render
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Component content */}
    </View>
  );
};
```

### **3. Styling Pattern**
```typescript
const styles = StyleSheet.create({
  container: {
    // Base styles
  },
  content: {
    // Content styles
  },
  // Variant styles
  primary: {
    // Primary variant
  },
  secondary: {
    // Secondary variant
  },
});
```

## **API Integration**

### **Data Loading**
- **Async Data**: Components handle loading states
- **Error Handling**: Graceful error display
- **Caching**: Efficient data caching strategies
- **Refresh**: Pull-to-refresh and manual refresh

### **User Interactions**
- **Touch Handling**: Responsive touch interactions
- **Gesture Recognition**: Swipe and gesture support
- **Form Validation**: Input validation and feedback
- **Accessibility**: Screen reader and accessibility support

## **Performance Optimization**

### **Rendering Optimization**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Memoize expensive calculations
- **useCallback**: Memoize event handlers
- **Lazy Loading**: Load components on demand

### **Image Optimization**
- **Progressive Loading**: Load images progressively
- **Caching**: Efficient image caching
- **Compression**: Optimized image sizes
- **Fallbacks**: Graceful fallback handling

## **Accessibility**

### **Accessibility Features**
- **Screen Reader**: Proper accessibility labels
- **Focus Management**: Logical focus order
- **Color Contrast**: Sufficient color contrast
- **Touch Targets**: Adequate touch target sizes

### **Accessibility Props**
```typescript
const accessibilityProps = {
  accessible: true,
  accessibilityLabel: 'Component description',
  accessibilityHint: 'Component action hint',
  accessibilityRole: 'button',
  accessibilityState: { disabled: false },
};
```

## **Testing Strategy**

### **Component Testing**
- **Unit Tests**: Individual component functionality
- **Visual Tests**: Component appearance testing
- **Interaction Tests**: User interaction testing
- **Accessibility Tests**: Accessibility compliance testing

### **Test Utilities**
```typescript
// Component test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThemeProvider>
);

// Component test utilities
const renderComponent = (props: ComponentProps) => {
  return render(
    <TestWrapper>
      <Component {...props} />
    </TestWrapper>
  );
};
```

## **Development Guidelines**

### **Component Creation**
1. **Define Purpose**: Determine component's role and responsibility
2. **Design Interface**: Create clear props interface
3. **Implement Logic**: Add component logic and state management
4. **Add Styling**: Apply consistent design patterns
5. **Handle Interactions**: Implement user interactions
6. **Add Accessibility**: Ensure accessibility compliance
7. **Test Thoroughly**: Verify functionality and edge cases

### **Component Best Practices**
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Design components to be reusable
- **Composition**: Use composition over inheritance
- **Performance**: Optimize for performance
- **Accessibility**: Build with accessibility in mind
- **Documentation**: Document component usage and props

## **Theme Integration**

### **Theme Usage**
```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
});
```

### **Theme Properties**
- **Colors**: Primary, secondary, accent colors
- **Typography**: Font sizes, weights, and families
- **Spacing**: Consistent spacing values
- **Shadows**: Elevation and shadow styles
- **Borders**: Border radius and styles

## **Dependencies**

### **External Dependencies**
- **React Native**: Core UI components
- **React Native Maps**: Map components
- **Expo**: Platform-specific components
- **React Native Elements**: UI component library

### **Internal Dependencies**
- **Context**: Theme and authentication contexts
- **Utils**: UI utility functions
- **Types**: Component type definitions
- **Constants**: Design system constants

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 