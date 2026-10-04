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

  onIncomingCall = (data: {
    callId: string;
    callerId: string;
    callType: 'audio' | 'video';
  }): void => {
    if (this.onIncomingCallCallback) {
      this.onIncomingCallCallback({
        callId: data.callId,
        callerId: data.callerId,
        callerName: '',
        callType: data.callType,
        status: 'ringing',
      });
    }
  };

  onCallAccepted = (data: { callId: string; answeredBy: string }): void => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'connected');
    }
  };

  onCallRejected = async (data: { callId: string; rejectedBy: string }): Promise<void> => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'rejected');
    }
    const { default: WebRTCManager } = await import('../../webrtc/WebRTCManager');
    WebRTCManager.getInstance().endCall();
  };

  onCallEnded = async (data: {
    callId: string;
    endedBy: string;
    reason?: string;
  }): Promise<void> => {
    if (this.onCallStateCallback) {
      this.onCallStateCallback(data.callId, 'ended');
    }
    const { default: WebRTCManager } = await import('../../webrtc/WebRTCManager');
    WebRTCManager.getInstance().endCall();
  };

  onOffer = async (data: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
    fromUserId: string;
  }): Promise<void> => {
    const { default: WebRTCManager } = await import('../../webrtc/WebRTCManager');
    const manager = WebRTCManager.getInstance();
    await manager.acceptCall(data.callId, data.sdp, 'video', data.fromUserId);
  };

  onAnswer = async (data: {
    callId: string;
    sdp: RTCSessionDescriptionInit;
    fromUserId: string;
  }): Promise<void> => {
    const { default: WebRTCManager } = await import('../../webrtc/WebRTCManager');
    await WebRTCManager.getInstance().handleAnswer(data.sdp);
  };

  onIceCandidate = async (data: {
    callId: string;
    candidate: RTCIceCandidateInit;
    fromUserId: string;
  }): Promise<void> => {
    const { default: WebRTCManager } = await import('../../webrtc/WebRTCManager');
    await WebRTCManager.getInstance().handleIceCandidate(data.candidate);
  };
}
