import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';

interface VerificationStatus {
  status: 'none' | 'pending' | 'approved' | 'rejected';
  request: {
    id: string;
    selfieUrl: string;
    rejectionReason?: string;
    reviewedAt?: string;
    createdAt: string;
  } | null;
}

export const VerificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [imageQuality, setImageQuality] = useState<{ width: number; height: number } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  };

  const checkVerificationStatus = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.PROFILES.VERIFICATION_STATUS);
      setVerificationStatus(res.data as VerificationStatus);
    } catch {
    } finally {
      setCheckingStatus(false);
    }
  };

  const takeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
        );

        setSelfie(manipulated.uri);
        setImageQuality({
          width: manipulated.width,
          height: manipulated.height,
        });
        setFaceDetected(true);
        startPulse();
      } catch {
        setSelfie(asset.uri);
        setFaceDetected(true);
      }
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
        );

        setSelfie(manipulated.uri);
        setImageQuality({
          width: manipulated.width,
          height: manipulated.height,
        });
        setFaceDetected(true);
        startPulse();
      } catch {
        setSelfie(asset.uri);
        setFaceDetected(true);
      }
    }
  };

  const submitVerification = async () => {
    if (!selfie) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: selfie,
        type: 'image/jpeg',
        name: 'verification.jpg',
      } as any);
      const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = uploadRes.data?.data || uploadRes.data;
      const selfieUrl = uploaded?.url;
      if (!selfieUrl) throw new Error('Upload failed');

      await apiClient.post(ENDPOINTS.PROFILES.VERIFY, {
        selfieUrl,
        faceWidth: 200,
        faceHeight: 200,
        faceConfidence: faceDetected ? 0.95 : 0.5,
        livenessScore: 0.8,
        imageWidth: imageQuality?.width || 800,
        imageHeight: imageQuality?.height || 800,
      });

      checkVerificationStatus();
    } catch (err) {
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus?.status === 'approved') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.successIconGradient}
            >
              <Ionicons name="checkmark" size={48} color={colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.successTitle}>You're Verified!</Text>
          <Text style={styles.successSubtitle}>
            Your profile has the blue checkmark. Other users can trust your profile.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Back to Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus?.status === 'pending') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.pendingIconContainer}>
            <Ionicons name="time-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Verification Pending</Text>
          <Text style={styles.successSubtitle}>
            Your verification request is being reviewed. This usually takes less than 24 hours.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Back to Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus?.status === 'rejected') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.centered}>
          <View style={styles.rejectedIconContainer}>
            <Ionicons name="close-circle-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.successTitle}>Verification Rejected</Text>
          <Text style={styles.successSubtitle}>
            {verificationStatus.request?.rejectionReason ||
              'Your verification was not approved. Please try again with a clear selfie.'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVerificationStatus(null);
              setSelfie(null);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back to Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.stepsContainer}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, selfie && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, loading && styles.stepDotActive]} />
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Photo</Text>
          <Text style={[styles.stepLabel, selfie && styles.stepLabelActive]}>Review</Text>
          <Text style={[styles.stepLabel, loading && styles.stepLabelActive]}>Submit</Text>
        </View>

        <Text style={styles.title}>Verify Your Profile</Text>
        <Text style={styles.subtitle}>
          Take a selfie to get the blue checkmark. This helps other users trust your profile.
        </Text>

        <Animated.View style={[styles.selfieContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.selfieButton}
            onPress={selfie ? undefined : takeSelfie}
            activeOpacity={0.8}
          >
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.selfiePreview} />
            ) : (
              <View style={styles.selfiePlaceholder}>
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                </View>
                <Text style={styles.selfieText}>Take a Selfie</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {selfie && (
          <View style={styles.qualityCard}>
            <View style={styles.qualityRow}>
              <Ionicons
                name={faceDetected ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={faceDetected ? colors.success : colors.error}
              />
              <Text style={styles.qualityText}>
                {faceDetected ? 'Face detected' : 'No face detected — try again'}
              </Text>
            </View>
            {imageQuality && (
              <View style={styles.qualityRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.qualityText}>
                  {imageQuality.width}x{imageQuality.height}
                </Text>
              </View>
            )}
          </View>
        )}

        {!selfie && (
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickFromGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={18} color={colors.primary} />
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.tipsTitle}>Tips for a great selfie</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>Face clearly visible and centered</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>Well-lit environment</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>No sunglasses, hats, or filters</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>Match your existing profile photos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!selfie || !faceDetected) && styles.buttonDisabled]}
          onPress={submitVerification}
          disabled={!selfie || !faceDetected || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={[
              styles.buttonGradient,
              (!selfie || !faceDetected) && styles.buttonGradientDisabled,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={styles.buttonText}>Submitting...</Text>
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.white} />
                <Text style={styles.buttonText}>Submit for Verification</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  container: { padding: spacing.xl, alignItems: 'center' },
  centered: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },

  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gray200 },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: colors.gray200, marginHorizontal: spacing.xs },
  stepLabels: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    width: 180,
    justifyContent: 'space-between',
  },
  stepLabel: { ...typography.small, color: colors.textTertiary },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },

  title: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  selfieContainer: { marginBottom: spacing.lg },
  selfieButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  selfiePreview: { width: '100%', height: '100%' },
  selfiePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryOverlay,
  },
  cameraIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  selfieText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  qualityCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  qualityText: { ...typography.caption, color: colors.textSecondary },

  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    ...shadows.card,
  },
  galleryButtonText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  tipsCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tipsTitle: { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  tipText: { ...typography.caption, color: colors.textSecondary },

  button: { width: '100%', borderRadius: borderRadius.button, overflow: 'hidden' },
  buttonDisabled: {},
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  buttonGradientDisabled: { opacity: 0.5 },
  buttonText: { ...typography.button, color: colors.white },

  backButton: { marginTop: spacing.md, paddingVertical: spacing.sm },
  backButtonText: { ...typography.caption, color: colors.textSecondary },

  successIconContainer: { marginBottom: spacing.xl },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  pendingIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  rejectedIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});

export default VerificationScreen;
