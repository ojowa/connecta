import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { ImageProcessor } from '../../utils/imageProcessing';
import { profileApi } from '../../services/api/profileApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

interface PhotoManagerScreenProps {
  navigation: any;
}

const MAX_PHOTOS = 6;

const PhotoManagerScreen: React.FC<PhotoManagerScreenProps> = ({ navigation }) => {
  const [photos, setPhotos] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
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
    } catch {
      // Profile might not exist yet, that's ok
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload new local photos and create Photo records
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo) continue;
        // Skip if it's an existing HTTP URL (already saved)
        if (photo.startsWith('http')) continue;
        // Upload to get a URL
        const url = await ImageProcessor.uploadImage({
          uri: photo,
          width: 1080,
          height: 1440,
          size: 0,
          mimeType: 'image/jpeg',
        });
        // Create a Photo record linked to profile
        await profileApi.uploadPhoto({ url, order: i });
      }

      // Delete photos that were removed
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
      {
        text: 'Take Photo',
        onPress: () => handleTakePhoto(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => handleChooseFromGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
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
      {
        text: 'Cancel',
        style: 'cancel',
      },
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.headerTitle}>Manage Photos</Text>
        <Text style={styles.headerSubtitle}>
          Add up to {MAX_PHOTOS} photos. The first photo will be your primary.
        </Text>

        <View style={styles.grid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoSlot}>
              {photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePhoto(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>X</Text>
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlot}
                  onPress={handleAddPhoto}
                  activeOpacity={0.7}
                >
                  <Text style={styles.plusIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.addButtonContainer}>
          <Button
            title="Add Photo"
            onPress={handleAddPhoto}
            variant="primary"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
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
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    zIndex: 1,
  },
  primaryBadgeText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  emptySlot: {
    flex: 1,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  plusIcon: {
    fontSize: 36,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButtonContainer: {
    marginTop: spacing.md,
  },
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
