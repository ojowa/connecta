import WebRTCManager from '../../webrtc/WebRTCManager';
import { CallData } from '../../types/webrtc';

type IncomingCallCallback = (data: CallData) => void;
type CallStateCallback = (callId: string, status: string) => void;

export class CallHandler {
  private onIncomingCallCallback: IncomingCallCallback | null = null;
  private onCallStateCallback: CallStateCallback | null = null;

  setOnIncomingCall(callback: IncomingCallCallback): void {
    this.onIncomingCallCallback = callback;
  }

  setOnCallStateChange(callback: CallStateCallback): void {
    this.onCallStateCallback = callback;
  }

  onIncomingCall = (data: { callId: string; callerId: string; callerName: string; callerAvatar?: string; callType: 'audio' | 'video' }): void => {
    if (this.onIncomingCallCallback) {
      this.onIncomingCallCallback({
        callId: data.callId,
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        callType: data.callType,
        status: 'ringing',
      });
    }
  };

  onCallAccepted = (data: { callId: string }): void => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'connected');
    }
  };

  onCallRejected = (data: { callId: string }): void => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'rejected');
    }
    WebRTCManager.getInstance().endCall();
  };

  onCallEnded = (data: { callId: string; reason?: string }): void => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'ended');
    }
    WebRTCManager.getInstance().endCall();
  };

  onOffer = async (data: { callId: string; sdp: RTCSessionDescriptionInit; callerId?: string }): Promise<void> => {
    const manager = WebRTCManager.getInstance();
    if (data.callerId) {
      manager.setActiveCallPeerId(data.callerId);
    }
    await manager.acceptCall(data.callId, data.sdp);
  };

  onAnswer = async (data: { callId: string; sdp: RTCSessionDescriptionInit }): Promise<void> => {
    await WebRTCManager.getInstance().handleAnswer(data.sdp);
  };

  onIceCandidate = async (data: { callId: string; candidate: RTCIceCandidateInit }): Promise<void> => {
    await WebRTCManager.getInstance().handleIceCandidate(data.candidate);
  };

  onCallReconnecting = (data: { callId: string }): void => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'reconnecting');
    }
  };
}
