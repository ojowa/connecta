import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { profileApi } from '../../services/api/profileApi';
import { useAppStore } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const EditProfileScreen: React.FC = ({ navigation }: any) => {
  const user = useAppStore((s) => s.user);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileApi.getProfile();
        if (profile) {
          setFullName(profile.firstName || user?.fullName || '');
          setBio(profile.bio || '');
          setJobTitle(profile.jobTitle || '');
          setCity(profile.city || '');
        }
      } catch {}
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
      await profileApi.updateProfile({ firstName: fullName.trim(), bio: bio.trim(), jobTitle: jobTitle.trim(), city: city.trim() } as any);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Input label="Full Name" placeholder="Your name" value={fullName} onChangeText={setFullName} />
        <Input label="Bio" placeholder="Tell us about yourself" value={bio} onChangeText={setBio} multiline />
        <Text style={styles.charCount}>{bio.length}/300</Text>
        <Input label="Job Title" placeholder="Your job title" value={jobTitle} onChangeText={setJobTitle} />
        <Input label="City" placeholder="Your city" value={city} onChangeText={setCity} />
        <Button title="Save" onPress={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: spacing.lg },
  charCount: { ...typography.small, color: colors.textSecondary, textAlign: 'right', marginTop: -spacing.sm, marginBottom: spacing.md },
});
