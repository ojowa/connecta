import { RTCPeerConnection, mediaDevices, MediaStream } from 'react-native-webrtc';
import SocketManager from '../socket/SocketManager';
import { WEBRTC_CONFIG, CALL_QUALITY } from '../constants/webrtc';
import { CallState } from '../types/webrtc';

class WebRTCManager {
  private static instance: WebRTCManager;
  private state: CallState | null = null;

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) WebRTCManager.instance = new WebRTCManager();
    return WebRTCManager.instance;
  }

  async startCall(peerId: string, type: 'audio' | 'video'): Promise<void> {
    const localStream = await this.fetchLocalStream(type);
    const peerConnection = this.createPeerConnection();
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: type === 'video',
    });
    await peerConnection.setLocalDescription(offer);
    this.state = {
      callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      peerId,
      isInitiator: true,
      localStream,
      remoteStream: null,
      peerConnection,
      state: 'connecting',
      type,
      startedAt: Date.now(),
    };
    SocketManager.getInstance().emit('call:signal', {
      type: 'offer',
      callId: this.state.callId,
      targetUserId: peerId,
      sdp: offer,
    });
  }

  async acceptCall(callId: string, offer: any): Promise<void> {
    const localStream = await this.fetchLocalStream('video');
    const peerConnection = this.createPeerConnection();
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    this.state = {
      callId,
      peerId: '',
      isInitiator: false,
      localStream,
      remoteStream: null,
      peerConnection,
      state: 'connected',
      type: 'video',
      startedAt: Date.now(),
    };
    SocketManager.getInstance().emit('call:signal', { type: 'answer', callId, sdp: answer });
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(WEBRTC_CONFIG);
    (pc as any).onicecandidate = (event: any) => {
      if (event.candidate) {
        SocketManager.getInstance().emit('call:signal', {
          type: 'ice-candidate',
          callId: this.state?.callId,
          candidate: event.candidate,
        });
      }
    };
    (pc as any).ontrack = (event: any) => {
      if (this.state && event.streams?.[0]) {
        this.state.remoteStream = event.streams[0];
      }
    };
    (pc as any).oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') this.endCall();
    };
    return pc;
  }

  private async fetchLocalStream(type: 'audio' | 'video'): Promise<MediaStream> {
    const constraints: any = {
      audio: true,
      video: type === 'video' ? { facingMode: 'user', ...CALL_QUALITY.VIDEO } : false,
    };
    return await mediaDevices.getUserMedia(constraints);
  }

  async toggleMute(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const audioTrack = this.state.localStream.getAudioTracks()[0];
    if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; return !audioTrack.enabled; }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; return !videoTrack.enabled; }
    return false;
  }

  async switchCamera(): Promise<void> {
    if (!this.state?.localStream) return;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) await videoTrack._switchCamera();
  }

  async endCall(): Promise<void> {
    if (this.state?.peerConnection) this.state.peerConnection.close();
    this.state?.localStream?.getTracks().forEach((track: any) => track.stop());
    SocketManager.getInstance().emit('call:end', { callId: this.state?.callId });
    this.state = null;
  }

  getActiveLocalStream(): MediaStream | null { return this.state?.localStream ?? null; }
  getRemoteStream(): MediaStream | null { return this.state?.remoteStream ?? null; }
  getCallState(): CallState | null { return this.state; }
}

export default WebRTCManager;
