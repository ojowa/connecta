import { useState, useCallback, useRef, useEffect } from 'react';
import WebRTCManager from '../webrtc/WebRTCManager';
import { CallState, CallQualityStats } from '../types/webrtc';

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [qualityStats, setQualityStats] = useState<CallQualityStats | null>(null);
  const webrtcManager = useRef(WebRTCManager.getInstance());
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = webrtcManager.current.onStateChangeHandler((state) => {
      setCallState(state);

      if (state?.state === 'connected' && state.connectedAt) {
        startDurationTimer(state.connectedAt);
      } else {
        stopDurationTimer();
      }
    });

    const unsubQuality = webrtcManager.current.onQualityUpdateHandler((stats) => {
      setQualityStats(stats);
    });

    return () => {
      unsubscribe();
      unsubQuality();
      stopDurationTimer();
    };
  }, []);

  const startDurationTimer = useCallback((connectedAt: number) => {
    stopDurationTimer();
    durationInterval.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    setCallDuration(0);
  }, []);

  const startCall = useCallback(async (peerId: string, type: 'audio' | 'video') => {
    await webrtcManager.current.startCall(peerId, type);
  }, []);

  const acceptCall = useCallback(async (callId: string, offer: any, callType: 'audio' | 'video' = 'video') => {
    await webrtcManager.current.acceptCall(callId, offer, callType);
  }, []);

  const endCall = useCallback(async () => {
    await webrtcManager.current.endCall();
    stopDurationTimer();
    setCallState(null);
    setQualityStats(null);
  }, [stopDurationTimer]);

  const toggleMute = useCallback(async () => {
    await webrtcManager.current.toggleMute();
  }, []);

  const toggleVideo = useCallback(async () => {
    await webrtcManager.current.toggleVideo();
  }, []);

  const switchCamera = useCallback(async () => {
    await webrtcManager.current.switchCamera();
  }, []);

  const toggleSpeaker = useCallback(async () => {
    await webrtcManager.current.toggleSpeaker();
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    callState,
    callDuration,
    formattedDuration: formatDuration(callDuration),
    qualityStats,
    isMuted: callState?.isMuted ?? false,
    isVideoEnabled: callState?.isVideoEnabled ?? false,
    isSpeakerEnabled: callState?.isSpeakerEnabled ?? true,
    localStream: callState?.localStream ?? null,
    remoteStream: callState?.remoteStream ?? null,
    connectionState: callState?.state ?? 'connecting',
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
  };
}
