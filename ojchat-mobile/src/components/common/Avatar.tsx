import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
  online?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, size = 48, name, online, style }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <View
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={name ? `${name} avatar` : 'User avatar'}
    >
      {uri && !imgError ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]} />
      )}
      {online !== undefined && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              borderWidth: size * 0.04,
              borderColor: colors.white,
              backgroundColor: online ? colors.success : colors.gray400,
              bottom: 0,
              right: 0,
            },
          ]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={online ? 'Online' : 'Offline'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  image: { resizeMode: 'cover' },
  placeholder: { backgroundColor: colors.gray200, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.body, fontWeight: '600', color: colors.gray500 },
  onlineDot: { position: 'absolute' },
});
