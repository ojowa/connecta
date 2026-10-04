import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DIMENSIONS = {
  screenWidth: width,
  screenHeight: height,
  isSmallScreen: width < 375,
  isMediumScreen: width >= 375 && width < 768,
  isLargeScreen: width >= 768,
  headerHeight: 56,
  tabBarHeight: 60,
  bottomInset: 34,
};
