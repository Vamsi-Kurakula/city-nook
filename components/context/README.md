# 🔄 Context Directory

## **Overview**

The `context/` directory contains React Context providers that manage global application state. These contexts provide data and functionality to components throughout the application, ensuring consistent state management and reducing prop drilling.

## **Files**

### **AuthContext.tsx**
**Purpose**: Manages user authentication state and session data

**Key Features**:
- User authentication status
- User profile data
- Session management
- Authentication token handling

**API Integration**:
- **Clerk**: Primary authentication provider
- **Supabase**: JWT token management for database access

**State Properties**:
```typescript
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

**Usage Example**:
```typescript
const { user, isAuthenticated, signIn } = useAuthContext();
```

### **CrawlContext.tsx**
**Purpose**: Manages crawl state, progress tracking, and crawl-related operations

**Key Features**:
- Current crawl state
- Progress tracking
- Stop completion management
- Crawl session persistence

**API Integration**:
- **Supabase**: Crawl data and progress storage
- **Local Storage**: Offline progress caching
- **Location Services**: GPS tracking for stops

**State Properties**:
```typescript
{
  currentCrawl: Crawl | null
  isCrawlActive: boolean
  currentProgress: CrawlProgress | null
  completeStop: (stopNumber: number, answer: string) => Promise<void>
  nextStop: () => void
  getCurrentStop: () => number
}
```

**Usage Example**:
```typescript
const { currentCrawl, completeStop, getCurrentStop } = useCrawlContext();
```

### **ThemeContext.tsx**
**Purpose**: Manages application theming and appearance settings

**Key Features**:
- Light/dark theme switching
- Color scheme management
- Consistent styling across components

**API Integration**:
- **Local Storage**: Theme preference persistence
- **System Settings**: Automatic theme detection

**State Properties**:
```typescript
{
  theme: Theme
  themeType: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}
```

**Usage Example**:
```typescript
const { theme, themeType, toggleTheme } = useTheme();
```

## **Context Hierarchy**

```
AppNavigator
├── AuthContext (Authentication state)
├── CrawlContext (Crawl state)
└── ThemeContext (UI theming)
    ↓
  Screens
    ↓
  UI Components
```

## **Data Flow**

### **Authentication Flow**
```
Clerk Auth → AuthContext → Screens → UI Components
     ↓           ↓           ↓           ↓
  User Data   Session    Protected   User-Specific
              State      Routes      Content
```

### **Crawl Flow**
```
Supabase → CrawlContext → Crawl Screens → Map/UI
    ↓           ↓              ↓           ↓
Crawl Data   Progress      Real-time    Visual
             State         Updates      Display
```

### **Theme Flow**
```
User Input → ThemeContext → All Components → Styled UI
     ↓           ↓              ↓             ↓
Theme Toggle  Theme State   Re-render    Updated
              Update        Components   Appearance
```

## **State Management Patterns**

### **1. Centralized State**
- All global state managed in contexts
- Single source of truth for application data
- Consistent state updates across components

### **2. Context Composition**
- Contexts can be nested and composed
- Each context handles specific domain
- Clear separation of concerns

### **3. Performance Optimization**
- Context values memoized to prevent unnecessary re-renders
- Selective context consumption in components
- Efficient state updates

## **API Integration Details**

### **AuthContext API Integration**
```typescript
// Clerk Integration
const { user, isSignedIn } = useAuth();
const { getToken } = useAuth();

// Supabase Integration
const token = await getToken({ template: 'supabase' });
const supabase = createClient(url, key, { auth: { token } });
```

### **CrawlContext API Integration**
```typescript
// Supabase Operations
const { data, error } = await supabase
  .from('crawl_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('crawl_id', crawlId);

// Local Storage
await AsyncStorage.setItem('crawl_progress', JSON.stringify(progress));
```

### **ThemeContext API Integration**
```typescript
// Local Storage
const savedTheme = await AsyncStorage.getItem('theme');
const systemTheme = Appearance.getColorScheme();

// Theme Application
const theme = themes[themeType];
```

## **Error Handling**

### **Context Error Boundaries**
- Each context includes error handling
- Graceful degradation for API failures
- User-friendly error messages

### **State Recovery**
- Automatic state recovery from storage
- Fallback to default states
- Data validation and sanitization

## **Performance Considerations**

### **Context Optimization**
- **useMemo**: Memoize context values
- **useCallback**: Memoize context functions
- **Selective Consumption**: Only consume needed context values

### **Re-render Prevention**
- Split contexts to prevent unnecessary re-renders
- Use context selectors for specific state access
- Implement shouldComponentUpdate patterns

## **Testing Strategy**

### **Context Testing**
- **Unit Tests**: Individual context functionality
- **Integration Tests**: Context interaction testing
- **Mock Testing**: API integration testing

### **Test Utilities**
- **Context Wrappers**: Test context providers
- **Mock APIs**: Simulate API responses
- **State Assertions**: Verify state changes

## **Development Guidelines**

### **Context Creation**
1. **Identify State**: Determine what state needs to be global
2. **Define Interface**: Create clear state and function interfaces
3. **Implement Provider**: Create context provider with state logic
4. **Add API Integration**: Integrate with external APIs
5. **Handle Errors**: Add error handling and recovery
6. **Optimize Performance**: Implement memoization and optimization

### **Context Usage**
- **Consume Selectively**: Only consume needed context values
- **Avoid Over-consumption**: Don't consume entire context objects
- **Use Custom Hooks**: Create custom hooks for context consumption
- **Handle Loading States**: Always handle loading and error states

## **Dependencies**

### **External Dependencies**
- **React**: Context API and hooks
- **Clerk**: Authentication and user management
- **Supabase**: Database and real-time data
- **AsyncStorage**: Local data persistence

### **Internal Dependencies**
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and utilities
- **Constants**: Application constants and configuration

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 