import { Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;
export const isSmallDevice = width < 375;
