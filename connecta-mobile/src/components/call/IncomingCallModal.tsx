import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../common/Avatar';

interface IncomingCallModalProps { visible: boolean; callerName: string; callerAvatar?: string; type: 'audio' | 'video'; onAccept: () => void; onReject: () => void; }

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ visible, callerName, callerAvatar, type, onAccept, onReject }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Avatar uri={callerAvatar} size={96} />
        <Text style={styles.name}>{callerName}</Text>
        <Text style={styles.type}>{type === 'video' ? 'Video Call' : 'Voice Call'}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.reject} onPress={onReject}><Text style={styles.rejectText}>Decline</Text></TouchableOpacity>
          <TouchableOpacity style={styles.accept} onPress={onAccept}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center' },
  name: { ...typography.h2, color: colors.white, marginTop: spacing.md },
  type: { ...typography.body, color: colors.gray300, marginTop: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.xxl, gap: spacing.xl },
  reject: { backgroundColor: colors.error, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 30 },
  accept: { backgroundColor: colors.success, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 30 },
  rejectText: { ...typography.button, color: colors.white },
  acceptText: { ...typography.button, color: colors.white },
});
