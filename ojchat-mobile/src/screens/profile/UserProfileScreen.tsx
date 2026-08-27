import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useConversations } from '../../hooks/useChat';
import { useAppStore } from '../../store';
import { ENDPOINTS } from '../../constants/endpoints';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const UserProfileScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { userId, isMatched: routeIsMatched } = route.params;
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { data: convData } = useConversations();
  const currentUserId = useAppStore((s) => s.user?.id);
  const conversations = convData?.conversations || [];
  const conversation = conversations.find((c: any) =>
    c.participantIds?.includes(userId) && c.participantIds?.includes(currentUserId)
  );
  const isMatched = routeIsMatched || !!conversation;
  const conversationId = conversation?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => apiClient.get(`/users/${userId}`).then((r) => r.data),
  });

  useEffect(() => {
    if (userId) {
      apiClient.post(ENDPOINTS.MATCHING.PROFILE_VIEW(userId)).catch(() => {});
    }
  }, [userId]);

  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(`/matching/like/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
      navigation.goBack();
    },
  });

  const passMutation = useMutation({
    mutationFn: () => apiClient.post(`/matching/pass/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchFeed'] });
      navigation.goBack();
    },
  });

  const handleChatPress = async () => {
    if (conversationId) {
      navigation.navigate('Conversation', {
        conversationId,
        otherUserId: userId,
        otherName: p.firstName,
        otherAvatar: photos[0]?.url,
      });
    } else {
      try {
        const res = await apiClient.post(ENDPOINTS.CHAT.CONVERSATIONS, { otherUserId: userId });
        const data = res.data as any;
        const newConvId = data?.id || data;
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        navigation.navigate('Conversation', {
          conversationId: newConvId,
          otherUserId: userId,
          otherName: p.firstName,
          otherAvatar: photos[0]?.url,
        });
      } catch {}
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = profile;
  const age = p.dateOfBirth ? calculateAge(p.dateOfBirth) : null;
  const photos = p.photos || [];
  const interests = p.interests || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{p.firstName || 'Profile'}</Text>
        {isMatched ? (
        <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={handleChatPress}
              >
                <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={async () => {
                  const convId = conversationId || await (async () => {
                    try {
                      const res = await apiClient.post(ENDPOINTS.CHAT.CONVERSATIONS, { otherUserId: userId });
                      const data = res.data as any;
                      return data?.id || data;
                    } catch { return null; }
                  })();
                  if (convId) navigation.navigate('Call', {
                    conversationId: convId,
                    otherUserId: userId,
                    otherName: p.firstName,
                    callType: 'voice',
                  });
                }}
              >
                <Ionicons name="call-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={async () => {
                  const convId = conversationId || await (async () => {
                    try {
                      const res = await apiClient.post(ENDPOINTS.CHAT.CONVERSATIONS, { otherUserId: userId });
                      const data = res.data as any;
                      return data?.id || data;
                    } catch { return null; }
                  })();
                  if (convId) navigation.navigate('Call', {
                    conversationId: convId,
                    otherUserId: userId,
                    otherName: p.firstName,
                    callType: 'video',
                  });
                }}
              >
                <Ionicons name="videocam-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
        </View>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.slice(0, 6).map((photo: any, index: number) => (
              <Image
                key={photo.id || index}
                source={{ uri: photo.url }}
                style={[styles.photo, index === 0 ? styles.photoLarge : styles.photoSmall]}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="person" size={80} color={colors.gray300} />
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{p.firstName}{p.lastName ? ` ${p.lastName}` : ''}{age ? `, ${age}` : ''}</Text>
            {p.verified && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </View>

          {p.city && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{p.city}{p.country ? `, ${p.country}` : ''}</Text>
            </View>
          )}

          {p.jobTitle && (
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{p.jobTitle}{p.company ? ` at ${p.company}` : ''}</Text>
            </View>
          )}

          {p.school && (
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{p.school}</Text>
            </View>
          )}

          {p.relationshipGoal && (
            <View style={styles.detailRow}>
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{p.relationshipGoal}</Text>
            </View>
          )}
        </View>

        {p.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{p.bio}</Text>
          </View>
        ) : null}

        {interests.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsGrid}>
              {interests.map((interest: any) => (
                <View key={interest.id} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {!isMatched && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => passMutation.mutate()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={30} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => likeMutation.mutate()}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={28} color="#22c55e" />
          </TouchableOpacity>
        </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIcon: { padding: spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  photo: { backgroundColor: colors.gray100 },
  photoLarge: { width: '100%', height: 400 },
  photoSmall: { width: '49.5%', height: 200 },
  photoPlaceholder: { width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' },
  infoSection: { padding: spacing.lg },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  name: { ...typography.h1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  detailText: { ...typography.body, color: colors.textSecondary },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  bioText: { ...typography.body, lineHeight: 24 },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestTag: { backgroundColor: colors.primaryOverlay, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  interestText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.lg },
  actionButton: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  passButton: { borderWidth: 2, borderColor: '#ef4444' },
  likeButton: { borderWidth: 2, borderColor: '#22c55e' },
  bottomSpacer: { height: spacing.xxl },
});
