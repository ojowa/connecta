import WebRTCManager from '../../webrtc/WebRTCManager';

export class CallHandler {
  onIncomingCall = (data: { callId: string; callerId: string; callerName: string; callerAvatar?: string; type: 'audio' | 'video' }): void => {
    // Handled by UI
  };

  onCallAccepted = (data: { callId: string }): void => {};

  onCallRejected = (data: { callId: string }): void => {};

  onCallEnded = (data: { callId: string }): void => {
    WebRTCManager.getInstance().endCall();
  };

  onOffer = (data: { callId: string; sdp: RTCSessionDescriptionInit }): void => {};

  onAnswer = (data: { callId: string; sdp: RTCSessionDescriptionInit }): void => {};

  onIceCandidate = (data: { callId: string; candidate: RTCIceCandidateInit }): void => {};
}
