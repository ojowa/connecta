import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';

export const VerificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const takeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfie(result.assets[0].uri);
    }
  };

  const submitVerification = async () => {
    if (!selfie) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', { uri: selfie, type: 'image/jpeg', name: 'verification.jpg' } as any);
      const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = uploadRes.data?.data || uploadRes.data;
      const selfieUrl = uploaded?.url;
      if (!selfieUrl) throw new Error('Upload failed');
      await apiClient.post(ENDPOINTS.PROFILES.VERIFY, { selfieUrl });
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          <Text style={styles.successTitle}>Verification Submitted!</Text>
          <Text style={styles.successSubtitle}>
            We'll review your photo within 24 hours. You'll see a blue checkmark on your profile once verified.
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Steps Indicator */}
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

        {/* Title */}
        <Text style={styles.title}>Verify Your Profile</Text>
        <Text style={styles.subtitle}>
          Take a selfie to get the blue checkmark. This helps other users trust your profile.
        </Text>

        {/* Selfie Area */}
        <Animated.View style={[styles.selfieContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity style={styles.selfieButton} onPress={takeSelfie} activeOpacity={0.8}>
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

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.tipsTitle}>Tips for a great selfie</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>Face clearly visible</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>Well-lit environment</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.tipText}>No sunglasses or hats</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, !selfie && styles.buttonDisabled]}
          onPress={submitVerification}
          disabled={!selfie || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={[styles.buttonGradient, !selfie && styles.buttonGradientDisabled]}
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  container: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  centered: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },

  // Steps
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray200,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.gray200,
    marginHorizontal: spacing.xs,
  },
  stepLabels: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    width: 180,
    justifyContent: 'space-between',
  },
  stepLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Title
  title: { ...typography.h2, marginBottom: spacing.sm, textAlign: 'center', color: colors.textPrimary },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },

  // Selfie
  selfieContainer: {
    marginBottom: spacing.xl,
  },
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

  // Tips
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
  tipsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Button
  button: {
    width: '100%',
    borderRadius: borderRadius.button,
    overflow: 'hidden',
  },
  buttonDisabled: {},
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  buttonGradientDisabled: {
    opacity: 0.5,
  },
  buttonText: { ...typography.button, color: colors.white },

  // Success
  successIconContainer: {
    marginBottom: spacing.xl,
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
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
