import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { shadows } from '../../theme/shadows';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useConversations } from '../../hooks/useChat';
import { usePlanInfo } from '../../hooks/useMatch';
import { useAppStore } from '../../store';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const queryClient = useQueryClient();
  const { data: convData } = useConversations();
  const currentUserId = useAppStore((s) => s.user?.id);
  const conversations = convData?.conversations || [];
  const conversation = conversations.find((c: any) =>
    c.participantIds?.includes(userId) && c.participantIds?.includes(currentUserId)
  );
  const isMatched = routeIsMatched || !!conversation;
  const conversationId = conversation?.id;
  const { data: planInfo } = usePlanInfo();
  const canMessageAnyone = planInfo?.planId === 'platinum';

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const likeScale = useRef(new Animated.Value(1)).current;
  const passScale = useRef(new Animated.Value(1)).current;

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

  const animatePress = (scale: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => callback());
  };

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
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Failed to start conversation';
        Alert.alert('Cannot Message', msg);
      }
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActivePhotoIndex(index);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="person-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = profile;
  const age = p.dateOfBirth ? calculateAge(p.dateOfBirth) : null;
  const photos = p.photos || [];
  const interests = p.interests || [];
  const PHOTO_HEIGHT = screenHeight * 0.55;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{p.firstName || 'Profile'}</Text>
        {isMatched ? (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleChatPress}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
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
                if (convId) navigation.navigate('ActiveVoiceCall', {
                  conversationId: convId,
                  callerId: userId,
                  callerName: p.firstName,
                  callType: 'audio',
                });
              }}
            >
              <Ionicons name="call-outline" size={20} color={colors.primary} />
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
                if (convId) navigation.navigate('ActiveVideoCall', {
                  conversationId: convId,
                  callerId: userId,
                  callerName: p.firstName,
                  callType: 'video',
                });
              }}
            >
              <Ionicons name="videocam-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : canMessageAnyone ? (
          <TouchableOpacity style={styles.headerIcon} onPress={handleChatPress}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        {/* Photo Carousel */}
        {photos.length > 0 ? (
          <View style={[styles.carouselContainer, { height: PHOTO_HEIGHT }]}>
            <FlatList
              data={photos.slice(0, 6)}
              keyExtractor={(item: any) => item.id || String(Math.random())}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              renderItem={({ item }: { item: any }) => (
                <View style={[styles.photoSlide, { width: screenWidth, height: PHOTO_HEIGHT }]}>
                  <Image source={{ uri: item.url }} style={styles.carouselPhoto} />
                </View>
              )}
            />
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={[styles.photoGradient, { height: PHOTO_HEIGHT }]}
            />
            {/* Name Overlay on Photo */}
            <View style={[styles.photoOverlayInfo, { bottom: PHOTO_HEIGHT * 0.15 }]}>
              <View style={styles.nameRow}>
                <Text style={styles.photoName}>
                  {p.firstName}{p.lastName ? ` ${p.lastName}` : ''}{age ? `, ${age}` : ''}
                </Text>
                {p.verified && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </View>
              {p.city && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.locationText}>
                    {p.city}{p.country ? `, ${p.country}` : ''}
                  </Text>
                </View>
              )}
            </View>
            {/* Pagination Dots */}
            {photos.length > 1 && (
              <View style={styles.pagination}>
                {photos.slice(0, 6).map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.dot, index === activePhotoIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.photoSlide, { width: screenWidth, height: PHOTO_HEIGHT, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray100 }]}>
            <Ionicons name="person" size={80} color={colors.gray300} />
          </View>
        )}

        {/* Info Cards */}
        <View style={styles.infoCards}>
          {/* Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>
            {p.jobTitle && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.detailText}>{p.jobTitle}{p.company ? ` at ${p.company}` : ''}</Text>
              </View>
            )}
            {p.school && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="school-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.detailText}>{p.school}</Text>
              </View>
            )}
            {p.relationshipGoal && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="heart-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.detailText}>{p.relationshipGoal}</Text>
              </View>
            )}
            {!p.jobTitle && !p.school && !p.relationshipGoal && (
              <Text style={styles.noDetails}>No details added yet</Text>
            )}
          </View>

          {/* About Card */}
          {p.bio ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About</Text>
              <Text style={styles.bioText}>{p.bio}</Text>
            </View>
          ) : null}

          {/* Interests Card */}
          {interests.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Interests</Text>
              <View style={styles.interestsGrid}>
                {interests.map((interest: any) => (
                  <View key={interest.id} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        {/* Action Buttons for Unmatched */}
        {!isMatched && (
          <View style={styles.actions}>
            <Animated.View style={[{ transform: [{ scale: passScale }] }]}>
              <TouchableOpacity
                style={styles.passButton}
                onPress={() => animatePress(passScale, () => passMutation.mutate())}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={28} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[{ transform: [{ scale: likeScale }] }]}>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => animatePress(likeScale, () => likeMutation.mutate())}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={26} color={colors.white} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary },

  // Carousel
  carouselContainer: { backgroundColor: colors.gray200 },
  scrollContentContainer: { paddingBottom: 0 },
  photoSlide: { overflow: 'hidden' },
  carouselPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  photoOverlayInfo: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  photoName: { ...typography.h1, color: colors.white },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  locationText: { ...typography.body, color: 'rgba(255,255,255,0.8)' },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
  },

  // Info Cards
  infoCards: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  noDetails: { ...typography.body, color: colors.textTertiary },
  bioText: { ...typography.body, lineHeight: 24, color: colors.textPrimary },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  interestTag: {
    backgroundColor: colors.primaryOverlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  interestText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.error,
    ...shadows.md,
  },
  likeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.lg,
  },

  bottomSpacer: { height: spacing.xxl },
});
