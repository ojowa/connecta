import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SocketManager from '../socket/SocketManager';
import { CallData } from '../types/webrtc';
import { useAppStore } from '../store';
import { apiClient } from '../services/api/apiClient';
import { logger } from '../utils/logger';

export function useIncomingCalls() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const processingRef = useRef(new Set<string>());

  useEffect(() => {
    const socketManager = SocketManager.getInstance();

    socketManager.getCallHandler().setOnIncomingCall(async (data: CallData) => {
      if (processingRef.current.has(data.callId)) return;
      processingRef.current.add(data.callId);

      try {
        const user = useAppStore.getState().user;
        if (user?.id === data.callerId) {
          processingRef.current.delete(data.callId);
          return;
        }

        let callerName = 'Unknown';
        let callerAvatar: string | undefined;
        try {
          const res = await apiClient.get(`/users/${data.callerId}`);
          const caller = res.data as any;
          callerName = caller?.fullName || 'Unknown';
          callerAvatar = caller?.photos?.[0]?.url;
        } catch (err) {
          logger.warn('Failed to fetch caller profile', {
            callerId: data.callerId,
            message: err instanceof Error ? err.message : String(err),
          });
        }

        navigation.navigate('IncomingCall', {
          callId: data.callId,
          callerId: data.callerId,
          callerName,
          callerAvatar,
          callType: data.callType,
        });
      } catch (err) {
        logger.warn('Incoming call handler failed', {
          callId: data.callId,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    });

    socketManager.getCallHandler().setOnCallStateChange((callId, status) => {
      processingRef.current.delete(callId);
    });

    return () => {
      socketManager.getCallHandler().setOnIncomingCall(() => {});
      socketManager.getCallHandler().setOnCallStateChange(() => {});
    };
  }, [navigation]);
}
