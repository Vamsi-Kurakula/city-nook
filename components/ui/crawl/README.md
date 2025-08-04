# 🗺️ Crawl UI Components

## **Overview**

The `crawl/` directory contains UI components specifically designed for crawl-related functionality. These components handle crawl display, interaction, mapping, and data visualization throughout the application.

## **Files**

### **CrawlCard.tsx**
**Purpose**: Displays crawl information in a card format with interactive elements

**Key Features**:
- Crawl preview with hero image
- Crawl metadata display (duration, difficulty, rating)
- Interactive buttons (start, favorite, share)
- Progress indicators for ongoing crawls

**Props Interface**:
```typescript
interface CrawlCardProps {
  crawl: Crawl;
  onPress?: (crawl: Crawl) => void;
  onStartPress?: (crawl: Crawl) => void;
  onFavoritePress?: (crawl: Crawl) => void;
  showProgress?: boolean;
  progress?: number;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Supabase**: Crawl data and metadata
- **Image Loading**: Hero image display with fallbacks
- **Progress Tracking**: Crawl completion status
- **User Actions**: Start, favorite, and share functionality

**Usage Example**:
```typescript
<CrawlCard 
  crawl={crawlData} 
  onPress={handleCrawlPress} 
  onStartPress={handleStartCrawl} 
  showProgress={true} 
  progress={0.6} 
/>
```

### **CrawlList.tsx**
**Purpose**: Renders a list of crawls with filtering and search capabilities

**Key Features**:
- Scrollable list of crawl cards
- Pull-to-refresh functionality
- Search and filtering options
- Loading and empty states
- Infinite scrolling support

**Props Interface**:
```typescript
interface CrawlListProps {
  crawls: Crawl[];
  onCrawlPress?: (crawl: Crawl) => void;
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
  searchQuery?: string;
  filters?: CrawlFilters;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Supabase**: Crawl data fetching and filtering
- **Search**: Real-time search functionality
- **Pagination**: Infinite scroll and load more
- **Caching**: Efficient data caching

**Usage Example**:
```typescript
<CrawlList 
  crawls={crawlList} 
  onCrawlPress={handleCrawlPress} 
  onRefresh={handleRefresh} 
  onLoadMore={handleLoadMore} 
  isLoading={isLoading} 
  hasMore={hasMoreData} 
/>
```

### **CrawlMap.tsx**
**Purpose**: Interactive map component for displaying crawl routes and stops

**Key Features**:
- Google Maps integration
- Route visualization with polylines
- Stop markers with custom callouts
- Real-time location tracking
- Zoom and pan controls

**Props Interface**:
```typescript
interface CrawlMapProps {
  crawl: Crawl;
  stops: CrawlStop[];
  currentStop?: number;
  userLocation?: LocationCoordinates;
  onStopPress?: (stop: CrawlStop) => void;
  onMapPress?: (coordinates: LocationCoordinates) => void;
  showRoute?: boolean;
  showUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

**API Integration**:
- **Google Maps**: Map rendering and interaction
- **Location Services**: GPS tracking and geolocation
- **Route Calculation**: Road route between stops
- **Real-time Updates**: Live location and progress updates

**Usage Example**:
```typescript
<CrawlMap 
  crawl={currentCrawl} 
  stops={crawlStops} 
  currentStop={activeStop} 
  userLocation={userLocation} 
  onStopPress={handleStopPress} 
  showRoute={true} 
  showUserLocation={true} 
/>
```

### **DatabaseImage.tsx**
**Purpose**: Image component with database integration and fallback handling

**Key Features**:
- Supabase Storage image loading
- Automatic fallback handling
- Loading and error states
- Image optimization and caching
- Production URL formatting

**Props Interface**:
```typescript
interface DatabaseImageProps {
  imageUrl: string;
  fallbackUrl?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

**API Integration**:
- **Supabase Storage**: Image URL handling and optimization
- **Image Loading**: Efficient image loading with caching
- **Error Handling**: Graceful fallback for failed loads
- **Production Optimization**: URL formatting for production builds

**Usage Example**:
```typescript
<DatabaseImage 
  imageUrl={crawl.heroImageUrl} 
  fallbackUrl={defaultCrawlImage} 
  style={styles.heroImage} 
  resizeMode="cover" 
/>
```

### **index.ts**
**Purpose**: Exports all crawl UI components for easy importing

**Exports**:
```typescript
export { default as CrawlCard } from './CrawlCard';
export { default as CrawlList } from './CrawlList';
export { default as CrawlMap } from './CrawlMap';
export { default as DatabaseImage } from './DatabaseImage';
```

## **Component Architecture**

### **Data Flow**
```
Crawl Data (Supabase)
      ↓
CrawlList Component
      ↓
CrawlCard Components
      ↓
DatabaseImage Components
      ↓
User Interactions
      ↓
API Updates
```

### **Map Integration**
```
Google Maps API
      ↓
CrawlMap Component
      ↓
Route Calculation
      ↓
Stop Markers
      ↓
User Location
      ↓
Real-time Updates
```

## **API Integration Details**

### **Supabase Integration**
```typescript
// Crawl data fetching
const { data: crawls, error } = await supabase
  .from('crawls')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });

// Image URL handling
const imageUrl = getImageUrlWithFallback(crawl.heroImageUrl);
```

### **Google Maps Integration**
```typescript
// Map configuration
const mapConfig = {
  apiKey: GOOGLE_MAPS_API_KEY,
  region: calculateMapRegion(stops),
  showsUserLocation: true,
  showsMyLocationButton: true,
};

// Route calculation
const route = await getRoadRouteForStops(stops);
```

### **Location Services**
```typescript
// Location tracking
const { location } = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

// Location updates
Location.watchPositionAsync(
  { accuracy: Location.Accuracy.High },
  handleLocationUpdate
);
```

## **Performance Optimization**

### **Image Optimization**
- **Lazy Loading**: Load images as needed
- **Caching**: Efficient image caching
- **Compression**: Optimized image sizes
- **Fallbacks**: Graceful fallback handling

### **Map Performance**
- **Marker Clustering**: Group nearby markers
- **Viewport Optimization**: Only render visible markers
- **Route Caching**: Cache calculated routes
- **Memory Management**: Clean up map resources

### **List Performance**
- **Virtualization**: Efficient list rendering
- **Pagination**: Load data in chunks
- **Memoization**: Prevent unnecessary re-renders
- **Debouncing**: Optimize search and filtering

## **User Experience**

### **Interactive Elements**
- **Touch Feedback**: Visual feedback for interactions
- **Loading States**: Clear loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Screen reader support

### **Visual Design**
- **Consistent Styling**: Uniform design language
- **Responsive Layout**: Adapt to different screen sizes
- **Theme Integration**: Dark/light theme support
- **Animations**: Smooth transitions and animations

## **Error Handling**

### **Image Loading Errors**
```typescript
const handleImageError = (error: Error) => {
  console.error('Image loading error:', error);
  // Use fallback image
  setImageUrl(fallbackUrl);
};
```

### **Map Loading Errors**
```typescript
const handleMapError = (error: Error) => {
  console.error('Map loading error:', error);
  // Show error state
  setMapError(error.message);
};
```

### **API Errors**
```typescript
const handleApiError = (error: Error) => {
  console.error('API error:', error);
  // Show user-friendly error message
  showErrorMessage('Failed to load crawl data');
};
```

## **Testing Strategy**

### **Component Testing**
```typescript
// CrawlCard test
describe('CrawlCard', () => {
  it('renders crawl information correctly', () => {
    const { getByText } = render(
      <CrawlCard crawl={mockCrawl} />
    );
    expect(getByText(mockCrawl.title)).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <CrawlCard crawl={mockCrawl} onPress={onPress} />
    );
    fireEvent.press(getByTestId('crawl-card'));
    expect(onPress).toHaveBeenCalledWith(mockCrawl);
  });
});
```

### **Map Testing**
```typescript
// Map component test
describe('CrawlMap', () => {
  it('renders map with stops', () => {
    const { getByTestId } = render(
      <CrawlMap crawl={mockCrawl} stops={mockStops} />
    );
    expect(getByTestId('crawl-map')).toBeTruthy();
  });
});
```

## **Development Guidelines**

### **Component Creation**
1. **Define Purpose**: Clear crawl-specific functionality
2. **Design Interface**: Consistent props interface
3. **Add API Integration**: Supabase and external APIs
4. **Handle Errors**: Graceful error handling
5. **Optimize Performance**: Efficient rendering and data handling
6. **Test Thoroughly**: Unit and integration tests

### **Best Practices**
- **Data Consistency**: Ensure data consistency across components
- **Error Boundaries**: Use error boundaries for map components
- **Performance**: Optimize for large datasets and complex interactions
- **Accessibility**: Ensure map and list accessibility
- **Documentation**: Document complex interactions and API usage

## **Dependencies**

### **External Dependencies**
- **React Native Maps**: Map rendering and interaction
- **Google Maps API**: Map services and geocoding
- **Expo Location**: Location services and GPS
- **Supabase**: Database and storage integration

### **Internal Dependencies**
- **Context**: Crawl and authentication contexts
- **Utils**: Image loading and coordinate utilities
- **Types**: Crawl and location type definitions
- **Constants**: API keys and configuration

---

**Last Updated**: Version 1.2.0
**Maintainer**: Development Team 