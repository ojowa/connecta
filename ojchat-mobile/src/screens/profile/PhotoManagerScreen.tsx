import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/common/Button';
import { ImageProcessor } from '../../utils/imageProcessing';
import { profileApi } from '../../services/api/profileApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';

interface PhotoManagerScreenProps {
  navigation: any;
}

const MAX_PHOTOS = 6;

const PhotoManagerScreen: React.FC<PhotoManagerScreenProps> = ({ navigation }) => {
  const [photos, setPhotos] = useState<(string | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string; order: number }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={saving}>
          <Text style={[styles.headerButtonText, saving && styles.disabledText]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, photos, saving]);

  const loadPhotos = async () => {
    try {
      const resp = await profileApi.getPhotos();
      const data = resp?.data || resp;
      const photosList = data?.photos || [];
      setExistingPhotos(photosList);
      const newPhotos: (string | null)[] = [null, null, null, null, null, null];
      photosList.forEach((p: any, i: number) => {
        if (i < MAX_PHOTOS) newPhotos[i] = p.url;
      });
      setPhotos(newPhotos);
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo) continue;
        if (photo.startsWith('http')) continue;
        const url = await ImageProcessor.uploadImage({
          uri: photo,
          width: 1080,
          height: 1440,
          size: 0,
          mimeType: 'image/jpeg',
        });
        await profileApi.uploadPhoto({ url, order: i });
      }
      const currentUrls = photos.filter((p): p is string => p !== null && p.startsWith('http'));
      for (const existing of existingPhotos) {
        if (!currentUrls.includes(existing.url)) {
          await profileApi.deletePhoto(existing.id);
        }
      }
      Alert.alert('Saved', 'Your photos have been updated.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to upload photos.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => handleTakePhoto() },
      { text: 'Choose from Gallery', onPress: () => handleChooseFromGallery() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTakePhoto = async () => {
    const emptyIndex = photos.findIndex((p) => p === null);
    if (emptyIndex === -1) {
      Alert.alert('Full', 'You have reached the maximum number of photos.');
      return;
    }
    const image = await ImageProcessor.takePhoto();
    if (!image) return;
    const newPhotos = [...photos];
    newPhotos[emptyIndex] = image.uri;
    setPhotos(newPhotos);
  };

  const handleChooseFromGallery = async () => {
    const emptyIndex = photos.findIndex((p) => p === null);
    if (emptyIndex === -1) {
      Alert.alert('Full', 'You have reached the maximum number of photos.');
      return;
    }
    const image = await ImageProcessor.pickImage();
    if (!image) return;
    const newPhotos = [...photos];
    newPhotos[emptyIndex] = image.uri;
    setPhotos(newPhotos);
  };

  const handleDeletePhoto = (index: number) => {
    Alert.alert('Delete Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const newPhotos = [...photos];
          newPhotos[index] = null;
          setPhotos(newPhotos);
        },
      },
    ]);
  };

  const photoCount = photos.filter((p) => p !== null).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Manage Photos</Text>
          <Text style={styles.headerSubtitle}>
            Add up to {MAX_PHOTOS} photos. The first photo will be your primary.
          </Text>
        </View>

        {/* Tips Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning} />
          </View>
          <Text style={styles.tipText}>
            Your first photo is shown to everyone. Choose a clear, well-lit photo where your face is visible.
          </Text>
        </View>

        {/* Photo Grid */}
        <View style={styles.grid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoSlot}>
              {photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={14} color={colors.white} />
                  </TouchableOpacity>
                  {/* Primary Badge */}
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Ionicons name="star" size={10} color={colors.white} />
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                  {/* Order Number */}
                  {index > 0 && (
                    <View style={styles.orderBadge}>
                      <Text style={styles.orderBadgeText}>{index + 1}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlot}
                  onPress={handleAddPhoto}
                  activeOpacity={0.7}
                >
                  <View style={styles.emptySlotIcon}>
                    <Ionicons name="add" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Photo Counter */}
        <View style={styles.counterRow}>
          <Ionicons name="images-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.counterText}>{photoCount} of {MAX_PHOTOS} photos</Text>
        </View>

        {/* Add Photo Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.addGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="camera-outline" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add Photo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Header
  headerSection: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Tip Card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tipText: {
    ...typography.caption,
    color: colors.gray700,
    flex: 1,
    lineHeight: 18,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 3 / 4,
    marginBottom: spacing.md,
  },
  photoContainer: {
    flex: 1,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  photoImage: {
    flex: 1,
    borderRadius: borderRadius.card,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    zIndex: 1,
  },
  primaryBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  orderBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  orderBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '700',
  },
  emptySlot: {
    flex: 1,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryOverlay,
  },
  emptySlotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },

  // Counter
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  counterText: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Add Button
  addButton: {
    borderRadius: borderRadius.button,
    overflow: 'hidden',
    ...shadows.card,
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },

  // Header Button
  headerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default PhotoManagerScreen;
