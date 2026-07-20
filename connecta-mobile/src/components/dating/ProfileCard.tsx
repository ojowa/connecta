import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { Avatar } from '../common/Avatar';
import { Profile } from '../../types/match';

interface ProfileCardProps {
  profile: Profile;
  onPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onPress }) => {
  const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {primaryPhoto && <Image source={{ uri: primaryPhoto.url }} style={styles.image} />}
      <View style={styles.info}>
        <Text style={styles.name}>{profile.firstName}</Text>
        {profile.jobTitle && <Text style={styles.detail}>{profile.jobTitle}</Text>}
        {profile.city && <Text style={styles.detail}>{profile.city}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  info: { padding: spacing.md },
  name: { ...typography.h3, marginBottom: spacing.xs },
  detail: { ...typography.caption, color: colors.textSecondary },
});
