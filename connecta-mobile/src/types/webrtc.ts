export interface CallState {
  callId: string;
  peerId: string;
  isInitiator: boolean;
  localStream: any | null;
  remoteStream: any | null;
  peerConnection: any | null;
  state: 'connecting' | 'ringing' | 'connected' | 'ended';
  type: 'audio' | 'video';
  startedAt: number;
}

export interface ICEConfig {
  iceServers: RTCIceServer[];
}
