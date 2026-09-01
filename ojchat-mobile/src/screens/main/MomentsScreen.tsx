import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  useWindowDimensions,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/apiClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { borderRadius } from '../../theme/borderRadius';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { useAppStore } from '../../store';
import * as ImagePicker from 'expo-image-picker';
import { Moment, MomentWithUser, MyMoment } from '../../types/moments';

const STORY_DURATION_MS = 24 * 60 * 60 * 1000;

const useMoments = () =>
  useQuery<MomentWithUser[]>({
    queryKey: ['moments'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ moments: MomentWithUser[]; meta: any }>(
        ENDPOINTS.MATCHING.MOMENTS,
      );
      return data?.moments ?? [];
    },
    refetchInterval: 60000,
  });

const useCreateMoment = () =>
  useMutation({
    mutationFn: async (payload: { caption?: string; mediaUrl?: string; mediaType?: string }) => {
      const { data } = await apiClient.post<Moment>(ENDPOINTS.MATCHING.MOMENTS, payload);
      return data;
    },
  });

const useDeleteMoment = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.MATCHING.MOMENT_DELETE(id));
    },
  });

const useViewMoment = () =>
  useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.MATCHING.MOMENT_VIEW(id));
    },
  });

const useMyMoments = () =>
  useQuery<MyMoment[]>({
    queryKey: ['myMoments'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ moments: MyMoment[]; meta: any }>(
        ENDPOINTS.MATCHING.MOMENTS_MINE,
      );
      return data?.moments ?? [];
    },
    refetchInterval: 60000,
  });

const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const isExpired = (expiresAt: string) => Date.now() > new Date(expiresAt).getTime();

const StoryCircle: React.FC<{
  user: { id: string; name: string; avatar?: string };
  hasUnviewed: boolean;
  isOwn: boolean;
  isSelected: boolean;
  onPress: () => void;
}> = ({ user, hasUnviewed, isOwn, isSelected, onPress }) => (
  <TouchableOpacity style={styles.storyCircle} onPress={onPress} activeOpacity={0.7}>
    <View
      style={[
        styles.storyRing,
        hasUnviewed && styles.storyRingActive,
        isSelected && styles.storyRingSelected,
      ]}
    >
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={styles.storyAvatar} />
      ) : (
        <View style={[styles.storyAvatar, styles.storyAvatarFallback]}>
          <Text style={styles.storyAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      {isOwn && (
        <View style={styles.addBadge}>
          <Text style={styles.addBadgeText}>+</Text>
        </View>
      )}
    </View>
    <Text style={[styles.storyName, isSelected && styles.storyNameActive]} numberOfLines={1}>
      {user.name}
    </Text>
  </TouchableOpacity>
);

const MomentCard: React.FC<{
  moment: Moment;
  isOwn: boolean;
  onDelete: () => void;
}> = ({ moment, isOwn, onDelete }) => {
  const expired = isExpired(moment.expiresAt);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const displayName = (moment as any).user?.fullName || moment.userName || 'Unknown';
  const displayAvatar = (moment as any).user?.avatarUrl || moment.userAvatar;

  return (
    <View style={[styles.momentCard, expired && styles.momentCardExpired]}>
      {moment.mediaUrl && (
        <Image
          source={{ uri: moment.mediaUrl }}
          style={[styles.momentImage, expired && styles.momentImageExpired]}
          resizeMode="cover"
        />
      )}
      <View style={styles.momentOverlay}>
        <View style={styles.momentHeader}>
          <View style={styles.momentUserInfo}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.momentAvatarSmall} />
            ) : (
              <View style={[styles.momentAvatarSmall, styles.momentAvatarSmallFallback]}>
                <Text style={styles.momentAvatarSmallText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.momentUserName}>{displayName}</Text>
          </View>
          {isOwn && (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.momentDeleteText, confirmDelete && styles.momentDeleteConfirm]}>
                {confirmDelete ? 'Confirm' : '•••'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {moment.caption ? <Text style={styles.momentCaption}>{moment.caption}</Text> : null}
        <View style={styles.momentFooter}>
          <Text style={styles.momentTime}>{timeAgo(moment.createdAt)}</Text>
          <Text style={styles.momentViews}>
            {moment.viewCount} {moment.viewCount === 1 ? 'view' : 'views'}
          </Text>
        </View>
        {expired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expired</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const CreateMomentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (caption: string, mediaUrl?: string, mediaType?: string) => void;
  isPending: boolean;
}> = ({ visible, onClose, onSubmit, isPending }) => {
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll access to add moments.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsEditing: true,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.capture = 'environment';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setMediaUri(uri);
          setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
        }
      };
      input.click();
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access in your device settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      mediaTypes: ['images', 'videos'],
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const handleSubmit = () => {
    if (!mediaUri && !caption.trim()) {
      Alert.alert('Empty moment', 'Add a photo or caption to share.');
      return;
    }
    onSubmit(caption.trim(), mediaUri || undefined, mediaType);
    setCaption('');
    setMediaUri(null);
    setMediaType('image');
  };

  const handleClose = () => {
    setCaption('');
    setMediaUri(null);
    setMediaType('image');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New Moment</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
            <Text style={[styles.modalPost, isPending && styles.modalPostDisabled]}>
              {isPending ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          {mediaUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity style={styles.removeMedia} onPress={() => setMediaUri(null)}>
                <Text style={styles.removeMediaText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <Text style={styles.mediaButtonIcon}>🖼️</Text>
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Text style={styles.mediaButtonIcon}>📷</Text>
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor={colors.gray400}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
          />
        </View>
      </View>
    </Modal>
  );
};

const MomentsScreen: React.FC = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const queryClient = useQueryClient();
  const { data: moments = [], isLoading, isError, refetch } = useMoments();
  const { data: myMoments = [], refetch: refetchMyMoments } = useMyMoments();
  const createMoment = useCreateMoment();
  const deleteMoment = useDeleteMoment();
  const viewMoment = useViewMoment();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'mine'>('feed');
  const viewedIds = useRef(new Set<string>());

  const currentMoments = activeTab === 'feed' ? moments : myMoments;

  const userMap = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string }>();
    currentMoments.forEach((m: any) => {
      if (!map.has(m.userId)) {
        map.set(m.userId, {
          id: m.userId,
          name: m.user?.fullName || m.userName || 'Unknown',
          avatar: m.user?.avatarUrl || m.userAvatar,
        });
      }
    });
    return map;
  }, [currentMoments]);

  const groupedByUser = React.useMemo(() => {
    const groups = new Map<string, Moment[]>();
    currentMoments.forEach((m) => {
      const existing = groups.get(m.userId) || [];
      existing.push(m);
      groups.set(m.userId, existing);
    });
    return groups;
  }, [currentMoments]);

  const userList = React.useMemo(() => Array.from(userMap.values()), [userMap]);

  useEffect(() => {
    if (!selectedUserId && userList.length > 0) {
      setSelectedUserId(userList[0].id);
    }
  }, [userList, selectedUserId]);

  const selectedMoments = React.useMemo(() => {
    if (!selectedUserId) return [];
    return (groupedByUser.get(selectedUserId) || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [groupedByUser, selectedUserId]);

  useEffect(() => {
    if (activeTab === 'feed' && selectedMoments.length > 0 && user) {
      selectedMoments.forEach((m) => {
        if (m.userId !== user.id && !viewedIds.current.has(m.id)) {
          viewedIds.current.add(m.id);
          viewMoment.mutate(m.id);
        }
      });
    }
  }, [selectedMoments, viewMoment, user, activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'feed') {
      await refetch();
    } else {
      await refetchMyMoments();
    }
    setRefreshing(false);
  }, [refetch, refetchMyMoments, activeTab]);

  const handleCreateMoment = useCallback(
    async (caption: string, mediaUri?: string, type?: string) => {
      let uploadedUrl: string | undefined;
      if (mediaUri) {
        try {
          const formData = new FormData();
          const isVideo =
            type === 'video' || mediaUri.endsWith('.mp4') || mediaUri.endsWith('.mov');
          if (Platform.OS === 'web' && mediaUri.startsWith('blob:')) {
            const res = await fetch(mediaUri);
            const blob = await res.blob();
            formData.append('photo', blob, isVideo ? 'moment.mp4' : 'moment.jpg');
          } else {
            formData.append('photo', {
              uri: mediaUri,
              type: isVideo ? 'video/mp4' : 'image/jpeg',
              name: isVideo ? 'moment.mp4' : 'moment.jpg',
            } as any);
          }
          const uploadRes = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData);
          const uploaded = uploadRes.data?.data || uploadRes.data;
          uploadedUrl = uploaded?.url;
        } catch {
          Alert.alert('Error', 'Failed to upload media. Please try again.');
          return;
        }
      }
      createMoment.mutate(
        { caption: caption || undefined, mediaUrl: uploadedUrl, mediaType: type || 'image' },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moments'] });
            queryClient.invalidateQueries({ queryKey: ['myMoments'] });
            setShowCreateModal(false);
          },
          onError: () => {
            Alert.alert('Error', 'Failed to share moment. Please try again.');
          },
        },
      );
    },
    [createMoment, queryClient],
  );

  const handleDeleteMoment = useCallback(
    (id: string) => {
      deleteMoment.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['moments'] });
          queryClient.invalidateQueries({ queryKey: ['myMoments'] });
        },
        onError: () => {
          Alert.alert('Error', 'Failed to delete moment.');
        },
      });
    },
    [deleteMoment, queryClient],
  );

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Couldn't load moments." onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

  const ownMoments = user ? groupedByUser.get(user.id) || [] : [];
  const otherUsers = userList.filter((u) => u.id !== user?.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
        <Text style={styles.title}>Moments</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('feed');
            setSelectedUserId(null);
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'feed' && styles.tabButtonTextActive]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'mine' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('mine');
            setSelectedUserId(user?.id || null);
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'mine' && styles.tabButtonTextActive]}>
            My Moments
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'feed' && (
        <>
          <View style={styles.storiesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesScroll}
            >
              {user && (
                <StoryCircle
                  user={{ id: user.id, name: user.fullName || 'You', avatar: user.avatarUrl }}
                  hasUnviewed={false}
                  isOwn={true}
                  isSelected={selectedUserId === user.id}
                  onPress={() => setSelectedUserId(user.id)}
                />
              )}
              {otherUsers.map((u) => (
                <StoryCircle
                  key={u.id}
                  user={u}
                  hasUnviewed={(groupedByUser.get(u.id) || []).some(
                    (m) => !isExpired(m.expiresAt) && m.userId !== user?.id,
                  )}
                  isOwn={false}
                  isSelected={selectedUserId === u.id}
                  onPress={() => setSelectedUserId(u.id)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.divider} />
        </>
      )}

      <FlatList
        data={selectedMoments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.momentsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>No moments yet</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'mine'
                ? "You haven't posted any moments yet."
                : selectedUserId === user?.id
                  ? 'Share a moment with your matches!'
                  : "This user hasn't posted any moments."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MomentCard
            moment={item}
            isOwn={item.userId === user?.id}
            onDelete={() => handleDeleteMoment(item.id)}
          />
        )}
      />

      <CreateMomentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateMoment}
        isPending={createMoment.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h2, color: colors.textPrimary },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: { color: colors.white, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  storiesContainer: { paddingVertical: spacing.sm },
  storiesScroll: { paddingHorizontal: spacing.md },
  storyCircle: { alignItems: 'center', marginRight: spacing.md, width: 72 },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingActive: { borderColor: colors.primary },
  storyRingSelected: { borderColor: colors.secondary, borderWidth: 3 },
  storyAvatar: { width: 60, height: 60, borderRadius: 30 },
  storyAvatarFallback: {
    backgroundColor: colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarText: { ...typography.h2, color: colors.primary },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  addBadgeText: { color: colors.white, fontSize: 14, fontWeight: '700', lineHeight: 16 },
  storyName: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  storyNameActive: { color: colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryOverlay,
  },
  tabButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  momentsList: { padding: spacing.md },
  momentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  momentCardExpired: { opacity: 0.6 },
  momentImage: { width: '100%', height: undefined, aspectRatio: 16 / 9 },
  momentImageExpired: { opacity: 0.4 },
  momentOverlay: { padding: spacing.md },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  momentUserInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  momentAvatarSmall: { width: 28, height: 28, borderRadius: 14, marginRight: spacing.sm },
  momentAvatarSmallFallback: {
    backgroundColor: colors.primaryOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  momentAvatarSmallText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  momentUserName: { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  momentDeleteText: { ...typography.caption, color: colors.gray400 },
  momentDeleteConfirm: { color: colors.error },
  momentCaption: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.sm },
  momentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  momentTime: { ...typography.small, color: colors.textSecondary },
  momentViews: { ...typography.small, color: colors.textSecondary },
  expiredBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.gray500,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  expiredText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h3, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: { ...typography.body, color: colors.primary },
  modalTitle: { ...typography.button, color: colors.textPrimary },
  modalPost: { ...typography.body, color: colors.primary, fontWeight: '600' },
  modalPostDisabled: { color: colors.gray400 },
  modalBody: { flex: 1, padding: spacing.md },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  mediaButton: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  mediaButtonIcon: { fontSize: 32, marginBottom: spacing.sm },
  mediaButtonText: { ...typography.caption, color: colors.textSecondary },
  previewContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.lg,
  },
  removeMedia: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  captionInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.textPrimary,
  },
});

export default MomentsScreen;
