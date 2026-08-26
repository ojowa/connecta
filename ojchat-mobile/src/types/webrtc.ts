export interface CallState {
  callId: string;
  peerId: string;
  isInitiator: boolean;
  localStream: any | null;
  remoteStream: any | null;
  peerConnection: any | null;
  state: 'connecting' | 'ringing' | 'connected' | 'ended' | 'reconnecting';
  type: 'audio' | 'video';
  startedAt: number;
  connectedAt?: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerEnabled: boolean;
}

export interface ICEConfig {
  iceServers: RTCIceServer[];
}

export interface CallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'rejected';
}

export interface CallQualityStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
  jitter: number;
}
