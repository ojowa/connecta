import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../services/api/profileApi';
import { useAppStore } from '../../store';
import { logger } from '../../utils/logger';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';

const PHOTO_SIZE = 80;

export const EditProfileScreen: React.FC = ({ navigation, route }: any) => {
  const user = useAppStore((s) => s.user);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [city, setCity] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        const profile = data?.profile;
        if (profile) {
          setFullName(data?.user?.fullName || user?.fullName || '');
          setBio(profile.bio || '');
          setJobTitle(profile.jobTitle || '');
          setCompany(profile.company || '');
          setSchool(profile.school || '');
          setCity(profile.city || '');
        }
        const photoData = await profileApi.getPhotos();
        const photoList = photoData?.data?.photos || photoData?.photos || [];
        setPhotos(photoList);
      } catch (err) {
        logger.warn('Failed to load profile data', {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    setLoading(true);
    try {
      await profileApi.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        school: school.trim(),
        city: city.trim(),
      });
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Photo Strip */}
        <View style={styles.photoStripSection}>
          <Text style={styles.stripLabel}>Your Photos</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoStrip}
          >
            {photos.slice(0, 6).map((photo, index) => (
              <View key={photo.id || index} style={styles.photoThumbContainer}>
                <Image source={{ uri: photo.url }} style={styles.photoThumb} />
                {index === 0 && (
                  <View style={styles.primaryDot}>
                    <Ionicons name="star" size={10} color={colors.white} />
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={styles.addPhotoThumb}
              onPress={() => navigation.navigate('PhotoManager')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* About You Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>About You</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <Input placeholder="Your name" value={fullName} onChangeText={setFullName} />
          </View>
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <Text style={[styles.charCount, bio.length > 270 && styles.charCountWarning]}>
                {bio.length}/300
              </Text>
            </View>
            <Input
              placeholder="Tell us about yourself"
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={300}
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Details</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Job Title</Text>
            <Input placeholder="Your job title" value={jobTitle} onChangeText={setJobTitle} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Company</Text>
            <Input placeholder="Where you work" value={company} onChangeText={setCompany} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>School</Text>
            <Input placeholder="Where you studied" value={school} onChangeText={setSchool} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>City</Text>
            <Input placeholder="Your city" value={city} onChangeText={setCity} />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Save Footer */}
      <View style={styles.saveFooter}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={[styles.saveGradient, loading && styles.saveGradientDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.gray50 },

  // Photo Strip
  photoStripSection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  stripLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.lg,
  },
  photoStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  photoThumbContainer: {
    position: 'relative',
  },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.card,
    backgroundColor: colors.gray200,
  },
  primaryDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  addPhotoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryOverlay,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },

  // Fields
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  charCount: {
    ...typography.small,
    color: colors.textTertiary,
  },
  charCountWarning: {
    color: colors.warning,
  },

  // Save Footer
  saveFooter: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray100,
    ...shadows.sm,
  },
  saveButton: {
    borderRadius: borderRadius.button,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.button,
  },
  saveGradientDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },

  bottomSpacer: { height: spacing.xxl },
});
