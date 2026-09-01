import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'small';
  color?: string;
}

export const Text: React.FC<CustomTextProps> = ({ variant = 'body', color, style, ...props }) => {
  return (
    <RNText
      style={[typography[variant], { color: color || colors.textPrimary }, style]}
      {...props}
    />
  );
};
