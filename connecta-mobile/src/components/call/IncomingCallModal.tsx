import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../common/Avatar';

interface IncomingCallModalProps {
  visible: boolean;
  callerName: string;
  callerAvatar?: string;
  type: 'audio' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  visible,
  callerName,
  callerAvatar,
  type,
  onAccept,
  onReject,
}) => {
  const [ringDuration, setRingDuration] = useState(0);

  useEffect(() => {
    if (!visible) {
      setRingDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setRingDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Avatar uri={callerAvatar} size={96} />
          <Text style={styles.name}>{callerName}</Text>
          <Text style={styles.type}>{type === 'video' ? 'Video Call' : 'Voice Call'}</Text>
          <Text style={styles.duration}>{formatTime(ringDuration)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.reject} onPress={onReject}>
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accept} onPress={onAccept}>
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center' },
  name: { ...typography.h2, color: colors.white, marginTop: spacing.md },
  type: { ...typography.body, color: colors.gray300, marginTop: spacing.xs },
  duration: { ...typography.body, color: colors.gray400, marginTop: spacing.sm },
  actions: { flexDirection: 'row', marginTop: spacing.xxl, gap: spacing.xl },
  reject: { backgroundColor: colors.error, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 30 },
  accept: { backgroundColor: colors.success, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 30 },
  rejectText: { ...typography.button, color: colors.white },
  acceptText: { ...typography.button, color: colors.white },
});
