# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development
```bash
npm install           # Install dependencies
npm start            # Start Expo development server
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS device/simulator
npm run web          # Run on web browser
npm run lint         # Run ESLint
```

### EAS Build System
```bash
eas build --profile development --platform android  # Development APK build
eas build --profile development --platform ios      # Development iOS build
eas build --profile production --platform android   # Production APK build
eas build --profile production --platform ios       # Production iOS build
```

### Project Reset
```bash
npm run reset-project  # Reset to clean project state
```

## Architecture Overview

### Technology Stack
- **Framework**: React Native with Expo SDK 53
- **State Management**: Redux Toolkit with multiple slices
- **Authentication**: Clerk + custom auth context
- **Styling**: TailwindCSS with NativeWind
- **Navigation**: React Navigation (Native Stack)
- **Audio**: Expo AV for audio playback
- **Payments**: RevenueCat for subscriptions
- **Data Persistence**: AsyncStorage + Supabase
- **Fonts**: Custom NATS-Regular font

### Core Architecture Patterns

#### State Management Structure
The app uses Redux Toolkit with specialized slices:
- `authSlice`: User authentication and profile data
- `gameSlice`: Game state, scoring, and progress
- `instrumentSlice`: Musical instruments management
- `advancedGameSlice`: Advanced game modes
- `feedbackSlice`: User feedback and ratings

#### Authentication Flow
Dual authentication system:
- **Clerk**: Social login (Google, Facebook, Apple)
- **Custom API**: Traditional email/password with JWT tokens
- **AuthContext**: Provides authentication state and utility functions throughout the app
- **AsyncStorage**: Persists auth tokens and user data locally

#### Screen Organization
```
src/screens/
├── home/                 # Landing screen
├── login/               # Authentication screens
├── register/
├── socialRegister/
├── selectInstrument/    # Instrument selection
├── game/                # Main game modes
├── advanceGame/
├── sample/              # Audio sample playback
├── menu/                # Settings and navigation
├── leaderboard/         # Rankings and scores
├── userStats/           # User progress tracking
├── viewFeedback/        # User feedback display
└── revenuecatScreen/    # Subscription management
```

### Service Layer Architecture
API services are organized by domain:
- `gameApi.tsx`: Core game mechanics
- `advancedGameApi.tsx`: Advanced game features
- `chordsApi.tsx`: Musical chord data
- `instrumentApi.tsx`: Instrument management
- `leaderBoardApi.tsx`: Rankings and competitions
- `audioService.tsx`: Audio playback and recording
- `feedbackService.tsx`: User feedback system
- `dailyProgressApi.tsx`: Progress tracking

### Component Structure
```
src/components/
├── ui/                  # Reusable UI components
├── layout/              # Layout components
└── widgets/             # Complex reusable components
    ├── ChordCard.tsx
    ├── InstrumentCard.tsx
    ├── StatsCard.tsx
    └── [other widgets]
```

## Key Configuration

### Fonts
- Primary font: NATS-Regular (custom font loaded via Expo)
- Font loading includes fallback handling for loading states

### Environment Setup
- Uses Expo development build configuration
- EAS configuration in `eas.json` for iOS/Android builds
- Bundle ID: `com.brianandrews.trainmyears`

### Styling System
- TailwindCSS configured with NativeWind preset
- Custom color scheme with CSS variables
- Comprehensive file coverage patterns in `tailwind.config.js`

### Navigation Flow
App uses conditional initial routing based on stored authentication token:
- **Authenticated**: `SelectInstrument` screen
- **Unauthenticated**: `Home` screen

## Development Notes

### Audio Implementation
The app is a music training application that uses audio playback for chord recognition games. Key audio considerations:
- Uses Expo AV for cross-platform audio
- Audio files stored in assets directory structure
- Audio service handles playback state management

### Platform-Specific Configuration
- iOS bundle identifier and certificates configured in EAS
- Android APK builds configured for development and production
- Web support enabled through Metro bundler

### Data Flow
1. User authentication via Clerk or custom API
2. Instrument selection and game configuration
3. Audio-based gameplay with real-time scoring
4. Progress tracking and leaderboard updates
5. Subscription management through RevenueCat

### Testing Strategy
Use `npm run lint` to check code quality. The project uses ESLint with Expo configuration for consistent code standards.

## Key Dependencies

### Core Dependencies
- `@clerk/clerk-expo`: Social authentication
- `@reduxjs/toolkit`: State management
- `@supabase/supabase-js`: Backend services
- `react-native-purchases`: Subscription management
- `expo-av`: Audio playback
- `nativewind`: TailwindCSS for React Native
- `react-navigation`: Navigation system

### Development Dependencies
- `typescript`: Type checking
- `tailwindcss`: Styling framework  
- `eslint`: Code linting