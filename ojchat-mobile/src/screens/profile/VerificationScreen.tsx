import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';

export const VerificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
          <Text style={styles.title}>Verification Submitted!</Text>
          <Text style={styles.subtitle}>We'll review your photo within 24 hours. You'll see a blue checkmark on your profile once verified.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Profile</Text>
        <Text style={styles.subtitle}>Take a selfie to get the blue checkmark. This helps other users trust your profile.</Text>

        <TouchableOpacity style={styles.selfieButton} onPress={takeSelfie}>
          {selfie ? (
            <Image source={{ uri: selfie }} style={styles.selfiePreview} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Ionicons name="camera" size={48} color={colors.gray400} />
              <Text style={styles.selfieText}>Take a Selfie</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>Make sure your face is clearly visible and well-lit</Text>

        <TouchableOpacity
          style={[styles.button, !selfie && styles.buttonDisabled]}
          onPress={submitVerification}
          disabled={!selfie || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit for Verification'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  centered: { flex: 1, padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  selfieButton: { width: 200, height: 200, borderRadius: 100, overflow: 'hidden', marginBottom: spacing.md, borderWidth: 3, borderColor: colors.primary, borderStyle: 'dashed' },
  selfiePreview: { width: '100%', height: '100%' },
  selfiePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray100 },
  selfieText: { ...typography.caption, color: colors.gray400, marginTop: spacing.xs },
  hint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.button, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, width: '100%' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...typography.button, color: colors.white, textAlign: 'center' },
});
