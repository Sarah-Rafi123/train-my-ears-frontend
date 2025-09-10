import { Dimensions, Platform } from 'react-native';

export interface ResponsiveConfig {
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
  isLandscape: boolean;
  isSmallTablet: boolean;
  isLargeTablet: boolean;
}

export const getResponsiveConfig = (): ResponsiveConfig => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isLandscape = screenWidth > screenHeight;
  
  // Define tablet breakpoints
  const isTablet = screenWidth >= 768 || screenHeight >= 768;
  const isSmallTablet = (screenWidth >= 768 && screenWidth < 1024) || (screenHeight >= 768 && screenHeight < 1024);
  const isLargeTablet = screenWidth >= 1024 || screenHeight >= 1024;
  
  return {
    screenWidth,
    screenHeight,
    isTablet,
    isLandscape,
    isSmallTablet,
    isLargeTablet,
  };
};

export const getResponsiveValue = (config: ResponsiveConfig) => {
  const BASE_WIDTH = 375; // iPhone 8 base width
  const BASE_HEIGHT = 667; // iPhone 8 base height
  
  // For tablets, we want to use more of the available space
  const effectiveWidth = config.isTablet ? Math.min(config.screenWidth, 800) : config.screenWidth;
  const widthScale = effectiveWidth / BASE_WIDTH;
  const heightScale = config.screenHeight / BASE_HEIGHT;
  
  // Use different scaling for tablets vs phones
  const responsiveScale = config.isTablet 
    ? Math.min(widthScale, heightScale) * 1.2 // Slightly larger scale for tablets
    : Math.min(widthScale, heightScale);
  
  return (value: number) => Math.round(value * responsiveScale);
};

export const getContainerStyle = (config: ResponsiveConfig) => {
  return {
    // Full width for phones, constrained width for tablets in portrait
    alignSelf: 'center' as const,
    // Responsive padding - more padding on tablets in portrait to use space better
    paddingHorizontal: config.isTablet 
      ? (config.isLandscape ? 64 : 64) // Increased padding for portrait tablets
      : 24,
  };
};

export const getCardContainerStyle = () => {
  return {
    // For tablets in portrait, use full width
    alignSelf: 'center' as const,
  };
};

export const getFlexLayoutStyle = (config: ResponsiveConfig) => {
  const direction = config.isTablet && config.isLandscape ? 'row' : 'column';
  return {
    // Tablets in landscape can use row layout, otherwise column
    flexDirection: direction as 'row' | 'column',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: config.isTablet && config.isLandscape ? 32 : 16,
  };
};