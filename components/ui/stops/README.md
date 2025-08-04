# 🛑 Stop Components

## **Overview**

The `stops/` directory contains UI components for different types of crawl stops. These components handle the display and interaction logic for various stop types including location stops, photo stops, riddle stops, and button stops.

## **Directory Contents**

```
stops/
├── StopComponent.tsx      # Base stop component wrapper
├── LocationStop.tsx       # Location-based stop component
├── PhotoStop.tsx          # Photo capture stop component
├── RiddleStop.tsx         # Riddle/question stop component
├── ButtonStop.tsx         # Button interaction stop component
└── index.ts              # Export definitions
```

## **Components**

### **StopComponent.tsx** (1.9KB, 78 lines)
- **Purpose**: Base wrapper component for all stop types
- **Features**:
  - Common stop layout and styling
  - Progress indicators
  - Stop type routing
  - Error handling
  - Accessibility support
  - Loading states

### **LocationStop.tsx** (3.4KB, 135 lines)
- **Purpose**: Location-based stop with GPS verification
- **Features**:
  - GPS location verification
  - Proximity detection
  - Location accuracy indicators
  - Map integration
  - Distance calculations
  - Location history

### **PhotoStop.tsx** (2.7KB, 109 lines)
- **Purpose**: Photo capture and submission stop
- **Features**:
  - Camera integration
  - Photo capture and preview
  - Image validation
  - Upload functionality
  - Photo requirements display
  - Retry mechanisms

### **RiddleStop.tsx** (4.0KB, 155 lines)
- **Purpose**: Riddle or question-based stop
- **Features**:
  - Question display
  - Answer input and validation
  - Hint system
  - Multiple choice support
  - Answer feedback
  - Progress tracking

### **ButtonStop.tsx** (5.8KB, 215 lines)
- **Purpose**: Simple button interaction stop
- **Features**:
  - Button interactions
  - Custom button actions
  - Animation support
  - Haptic feedback
  - Accessibility features
  - State management

## **API Integration**

### **Location Services**
- **Expo Location**: GPS and location services
  - Real-time location tracking
  - Location accuracy monitoring
  - Geofencing capabilities
  - Location history
- **Google Maps**: Map integration and geocoding
  - Map display and interaction
  - Geocoding and reverse geocoding
  - Route calculation
  - Place information

### **Camera Services**
- **Expo Camera**: Photo capture functionality
  - Camera access and permissions
  - Photo capture and preview
  - Image quality settings
  - Flash and focus controls
- **Expo Image Picker**: Image selection
  - Gallery access
  - Image selection and cropping
  - Multiple image support

### **Database Operations**
- **Supabase**: Stop data and submissions
  - Stop definition loading
  - Submission storage
  - Progress tracking
  - Photo upload and storage

### **Required APIs**
```typescript
// Location Services
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Camera Services
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Database
import { supabase } from '@/utils/database/client';
import { progressOperations } from '@/utils/database/progressOperations';

// Utilities
import { coordinateExtractor } from '@/utils/coordinateExtractor';
import { answerValidation } from '@/utils/answerValidation';
```

## **State Management**

### **Stop State**
- **Completion State**: Stop completion status
- **Progress State**: Current progress and validation
- **Error State**: Error handling and recovery
- **UI State**: Component-specific UI state

### **Context Integration**
- **CrawlContext**: Crawl state and progress
  - Active crawl information
  - Stop completion tracking
  - Progress updates
  - Photo submissions

## **Stop Types**

### **Location Stop**
- **Purpose**: Verify user is at specific location
- **Validation**: GPS proximity check
- **Features**:
  - Real-time location tracking
  - Proximity detection
  - Accuracy indicators
  - Map integration
  - Location history

### **Photo Stop**
- **Purpose**: Capture and submit photo
- **Validation**: Photo requirements and quality
- **Features**:
  - Camera integration
  - Photo capture
  - Image validation
  - Upload functionality
  - Preview and retry

### **Riddle Stop**
- **Purpose**: Answer question or solve riddle
- **Validation**: Answer correctness
- **Features**:
  - Question display
  - Answer input
  - Hint system
  - Multiple choice
  - Feedback system

### **Button Stop**
- **Purpose**: Simple interaction completion
- **Validation**: Button press confirmation
- **Features**:
  - Button interactions
  - Custom actions
  - Animations
  - Haptic feedback

## **User Experience**

### **Design Patterns**
- **Consistent Layout**: Unified stop component design
- **Progressive Disclosure**: Information revealed as needed
- **Clear Feedback**: Visual and haptic feedback
- **Error Recovery**: Graceful error handling

### **Accessibility Features**
- **Screen Reader Support**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard support
- **High Contrast**: High contrast mode support
- **Voice Commands**: Voice control support

## **Integration Points**

### **With Other Components**
- **CrawlContext**: Stop state and progress management
- **UI Components**: Common UI elements and styling
- **Navigation**: Stop navigation and transitions
- **Error Handling**: Error boundaries and recovery

### **With External Services**
- **Location Services**: GPS and map integration
- **Camera Services**: Photo capture and storage
- **Database**: Stop data and submissions
- **Analytics**: Stop completion tracking

## **Data Flow**

### **Stop Completion Flow**
```
Stop Load → User Interaction → Validation → Submission → Progress Update
     ↓              ↓              ↓            ↓            ↓
Stop Display ← Interaction UI ← Validation ← Error Handling ← Success
```

### **Photo Stop Flow**
```
Camera Access → Photo Capture → Validation → Upload → Submission
     ↓              ↓              ↓            ↓            ↓
Permission Check ← Preview ← Quality Check ← Storage ← Progress Update
```

## **Error Handling**

### **Stop-Specific Errors**
- **Location Errors**: GPS and location service failures
- **Camera Errors**: Camera access and photo capture failures
- **Validation Errors**: Answer and submission validation failures
- **Network Errors**: Upload and submission failures

### **Recovery Strategies**
- **Retry Logic**: Automatic retry for failed operations
- **Fallback Options**: Alternative completion methods
- **User Feedback**: Clear error messages and solutions
- **Offline Support**: Limited offline functionality

## **Performance Considerations**

### **Optimization Strategies**
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Photo compression and optimization
- **Location Caching**: Efficient location data handling
- **Memory Management**: Proper resource cleanup

### **Resource Management**
- **Camera Resources**: Proper camera cleanup
- **Location Services**: Efficient location tracking
- **Image Memory**: Optimized image handling
- **Event Listeners**: Proper listener cleanup

## **Testing Strategy**

### **Test Coverage**
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Complete stop flow testing
- **Performance Tests**: Resource usage testing

### **Test Scenarios**
- **Stop Loading**: Component initialization and data loading
- **User Interactions**: Stop-specific interactions and validation
- **Error Handling**: Various error scenario handling
- **Performance**: Resource usage and optimization
- **Accessibility**: Accessibility compliance testing

## **Development Guidelines**

### **Adding New Stop Types**
1. **Define Requirements**: Stop type specification and behavior
2. **Create Component**: Implement stop-specific component
3. **Add Validation**: Implement stop-specific validation logic
4. **Update Types**: Add necessary TypeScript interfaces
5. **Add Testing**: Comprehensive test coverage
6. **Update Documentation**: Clear usage documentation

### **Code Standards**
- **TypeScript**: Strict type checking for all components
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for mobile devices
- **Accessibility**: WCAG compliance for all UI elements

## **Stop Configuration**

### **Stop Definition**
```typescript
interface StopDefinition {
  stop_id: string;
  stop_type: 'location' | 'photo' | 'riddle' | 'button';
  stop_title: string;
  stop_description: string;
  stop_requirements: StopRequirements;
  stop_validation: StopValidation;
  stop_reward?: StopReward;
}
```

### **Stop Requirements**
- **Location**: GPS coordinates and proximity radius
- **Photo**: Photo requirements and quality standards
- **Riddle**: Question text and answer validation
- **Button**: Button configuration and actions

## **Dependencies**

### **External Libraries**
- **expo-location**: Location services
- **expo-camera**: Camera functionality
- **expo-image-picker**: Image selection
- **react-native-maps**: Map display
- **@supabase/supabase-js**: Database operations

### **Internal Dependencies**
- **CrawlContext**: Crawl state management
- **UI Components**: Common UI elements
- **Database Utils**: Database operation helpers
- **Utility Functions**: Helper functions and utilities

---

**Last Updated**: Version 1.0.0
**Maintainer**: Stop Components Team 