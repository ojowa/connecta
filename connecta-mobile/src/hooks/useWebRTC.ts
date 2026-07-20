import { useState, useCallback, useRef } from 'react';
import WebRTCManager from '../webrtc/WebRTCManager';

export function useWebRTC() {
  const [callState, setCallState] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const webrtcManager = useRef(WebRTCManager.getInstance());

  const startCall = useCallback(async (peerId: string, type: 'audio' | 'video') => {
    await webrtcManager.current.startCall(peerId, type);
    setCallState(webrtcManager.current.getCallState());
  }, []);

  const acceptCall = useCallback(async (callId: string, offer: any) => {
    await webrtcManager.current.acceptCall(callId, offer);
    setCallState(webrtcManager.current.getCallState());
  }, []);

  const endCall = useCallback(async () => {
    await webrtcManager.current.endCall();
    setCallState(null);
    setIsMuted(false);
    setIsVideoEnabled(true);
  }, []);

  const toggleMute = useCallback(async () => {
    const muted = await webrtcManager.current.toggleMute();
    setIsMuted(muted);
  }, []);

  const toggleVideo = useCallback(async () => {
    const disabled = await webrtcManager.current.toggleVideo();
    setIsVideoEnabled(!disabled);
  }, []);

  const switchCamera = useCallback(async () => {
    await webrtcManager.current.switchCamera();
  }, []);

  return { callState, isMuted, isVideoEnabled, startCall, acceptCall, endCall, toggleMute, toggleVideo, switchCamera };
}
