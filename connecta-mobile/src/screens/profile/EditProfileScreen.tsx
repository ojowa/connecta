import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileApi.updateProfile({ firstName: fullName, bio, jobTitle, city } as any);
      Alert.alert('Success', 'Profile updated');
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container}>
      <Input label="Full Name" placeholder="Your name" value={fullName} onChangeText={setFullName} />
      <Input label="Bio" placeholder="Tell us about yourself" value={bio} onChangeText={setBio} multiline />
      <Input label="Job Title" placeholder="Your job title" value={jobTitle} onChangeText={setJobTitle} />
      <Input label="City" placeholder="Your city" value={city} onChangeText={setCity} />
      <Button title="Save" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg } });
