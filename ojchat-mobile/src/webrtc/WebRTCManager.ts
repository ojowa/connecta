import { RTCPeerConnection, mediaDevices, MediaStream } from './bindings';
import * as Crypto from 'expo-crypto';
import SocketManager from '../socket/SocketManager';
import { WEBRTC_CONFIG, CALL_QUALITY, CALL_QUALITY_CHECK_INTERVAL_MS } from '../constants/webrtc';
import { CallState, CallQualityStats } from '../types/webrtc';

class WebRTCManager {
  private static instance: WebRTCManager;
  private state: CallState | null = null;
  private qualityInterval: ReturnType<typeof setInterval> | null = null;
  private onQualityUpdate: ((stats: CallQualityStats) => void) | null = null;
  private onStateChange: ((state: CallState | null) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) WebRTCManager.instance = new WebRTCManager();
    return WebRTCManager.instance;
  }

  async startCall(peerId: string, type: 'audio' | 'video'): Promise<void> {
    try {
      const localStream = await this.fetchLocalStream(type);
      const peerConnection = this.createPeerConnection();

      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      await peerConnection.setLocalDescription(offer);

      const callId = await this.generateCallId();

      this.state = {
        callId,
        peerId,
        isInitiator: true,
        localStream,
        remoteStream: null,
        peerConnection,
        state: 'connecting',
        type,
        startedAt: Date.now(),
        isMuted: false,
        isVideoEnabled: type === 'video',
        isSpeakerEnabled: true,
      };

      this.notifyStateChange();

      SocketManager.getInstance().emit('call.initiated', {
        callId,
        calleeId: peerId,
        callType: type,
      });

      SocketManager.getInstance().emit('sdp.offer', {
        callId,
        sdp: offer,
        targetUserId: peerId,
      });

      this.startQualityMonitoring();
    } catch (error: any) {
      console.error('Failed to start call:', error.message);
      this.notifyStateChange();
      throw error;
    }
  }

  async acceptCall(
    callId: string,
    offer: any,
    callType: 'audio' | 'video' = 'video',
    callerId: string = '',
  ): Promise<void> {
    const localStream = await this.fetchLocalStream(callType);
    const peerConnection = this.createPeerConnection();

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.state = {
      callId,
      peerId: callerId,
      isInitiator: false,
      localStream,
      remoteStream: null,
      peerConnection,
      state: 'connected',
      type: callType,
      startedAt: Date.now(),
      connectedAt: Date.now(),
      isMuted: false,
      isVideoEnabled: callType === 'video',
      isSpeakerEnabled: true,
    };

    this.notifyStateChange();
    this.reconnectAttempts = 0;

    SocketManager.getInstance().emit('sdp.answer', {
      callId,
      sdp: answer,
      targetUserId: this.state.peerId,
    });

    SocketManager.getInstance().emit('call.answered', { callId });
    this.startQualityMonitoring();
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.state?.peerConnection) return;
    await this.state.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    if (this.state) {
      this.state.state = 'connected';
      this.state.connectedAt = Date.now();
      this.notifyStateChange();
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.state?.peerConnection) return;
    try {
      await this.state.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Failed to add ICE candidate:', e);
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    try {
      const pc = new RTCPeerConnection(WEBRTC_CONFIG as any);

      (pc as any).onicecandidate = (event: any) => {
        if (event.candidate && this.state?.peerId) {
          SocketManager.getInstance().emit('ice.candidate', {
            callId: this.state?.callId,
            candidate: event.candidate,
            targetUserId: this.state.peerId,
          });
        }
      };

      (pc as any).ontrack = (event: any) => {
        if (this.state && event.streams?.[0]) {
          this.state.remoteStream = event.streams[0];
          this.notifyStateChange();
        }
      };

      (pc as any).oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        if (iceState === 'connected' || iceState === 'completed') {
          this.reconnectAttempts = 0;
          if (this.state && this.state.state !== 'connected') {
            this.state.state = 'connected';
            this.state.connectedAt = Date.now();
            this.notifyStateChange();
          }
        } else if (iceState === 'failed') {
          this.handleConnectionFailure();
        } else if (iceState === 'disconnected') {
          if (this.state) {
            this.state.state = 'reconnecting';
            this.notifyStateChange();
          }
          this.attemptReconnect();
        }
      };

      return pc;
    } catch (error: any) {
      console.error('Failed to create PeerConnection:', error.message);
      throw new Error(`Failed to initialize PeerConnection: ${error.message}`);
    }
  }

  private async fetchLocalStream(type: 'audio' | 'video'): Promise<MediaStream> {
    const constraints: any = {
      audio: CALL_QUALITY.AUDIO,
      video: type === 'video' ? { facingMode: 'user', ...CALL_QUALITY.VIDEO } : false,
    };
    return await mediaDevices.getUserMedia(constraints);
  }

  private async handleConnectionFailure(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      await this.endCall();
      return;
    }
    this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (!this.state?.peerConnection || this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.reconnectAttempts++;
    try {
      this.state.peerConnection.restartIce();
    } catch (e) {
      console.error('ICE restart failed:', e);
    }
  }

  private startQualityMonitoring(): void {
    this.stopQualityMonitoring();
    this.qualityInterval = setInterval(async () => {
      if (!this.state?.peerConnection) return;
      try {
        const stats = await this.state.peerConnection.getStats();
        const quality = this.parseStats(stats);
        if (quality && this.onQualityUpdate) {
          this.onQualityUpdate(quality);
        }
      } catch (e) {
        // Stats not available
      }
    }, CALL_QUALITY_CHECK_INTERVAL_MS);
  }

  private parseStats(stats: any): CallQualityStats | null {
    let bitrate = 0;
    let packetLoss = 0;
    let latency = 0;
    let jitter = 0;

    stats.forEach((report: any) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        bitrate = report.bytesReceived ? (report.bytesReceived * 8) / 5 : 0;
        packetLoss =
          report.packetsLost && report.packetsReceived
            ? report.packetsLost / report.packetsReceived
            : 0;
        jitter = report.jitter || 0;
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
      }
    });

    return { bitrate, packetLoss, latency, jitter };
  }

  private stopQualityMonitoring(): void {
    if (this.qualityInterval) {
      clearInterval(this.qualityInterval);
      this.qualityInterval = null;
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.state ? { ...this.state } : null);
    }
  }

  async toggleMute(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const audioTrack = this.state.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.state.isMuted = !audioTrack.enabled;
      this.notifyStateChange();
      return this.state.isMuted;
    }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.state?.localStream) return false;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.state.isVideoEnabled = videoTrack.enabled;
      this.notifyStateChange();
      return !videoTrack.enabled;
    }
    return false;
  }

  async switchCamera(): Promise<void> {
    if (!this.state?.localStream) return;
    const videoTrack = this.state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        await (videoTrack as any)._switchCamera();
      } catch {
        const settings = videoTrack.getSettings();
        const currentFacing = (settings as any).facingMode || 'user';
        const newFacing = currentFacing === 'user' ? 'environment' : 'user';
        try {
          const newStream = await mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: newFacing,
              width: CALL_QUALITY.VIDEO.width,
              height: CALL_QUALITY.VIDEO.height,
            },
          });
          const newVideoTrack = newStream.getVideoTracks()[0];
          if (this.state?.peerConnection && newVideoTrack) {
            const sender = this.state.peerConnection
              .getSenders()
              .find((s: any) => s.track?.kind === 'video');
            if (sender) await sender.replaceTrack(newVideoTrack);
            videoTrack.stop();
            this.state.localStream.removeTrack(videoTrack);
            this.state.localStream.addTrack(newVideoTrack);
            this.notifyStateChange();
          }
        } catch (fallbackErr) {
          console.error('Failed to switch camera:', fallbackErr);
        }
      }
    }
  }

  async toggleSpeaker(): Promise<boolean> {
    if (!this.state) return false;
    this.state.isSpeakerEnabled = !this.state.isSpeakerEnabled;
    this.notifyStateChange();
    return this.state.isSpeakerEnabled;
  }

  async endCall(): Promise<void> {
    this.stopQualityMonitoring();
    if (this.state?.peerConnection) {
      this.state.peerConnection.close();
    }
    this.state?.localStream?.getTracks().forEach((track: any) => track.stop());

    if (this.state?.callId) {
      SocketManager.getInstance().emit('call.ended', { callId: this.state.callId });
    }

    this.state = null;
    this.reconnectAttempts = 0;
    this.notifyStateChange();
  }

  setActiveCallPeerId(peerId: string): void {
    if (this.state) {
      this.state.peerId = peerId;
    }
  }

  onStateChangeHandler(handler: (state: CallState | null) => void): () => void {
    this.onStateChange = handler;
    return () => {
      this.onStateChange = null;
    };
  }

  onQualityUpdateHandler(handler: (stats: CallQualityStats) => void): () => void {
    this.onQualityUpdate = handler;
    return () => {
      this.onQualityUpdate = null;
    };
  }

  getActiveLocalStream(): MediaStream | null {
    return this.state?.localStream ?? null;
  }
  getRemoteStream(): MediaStream | null {
    return this.state?.remoteStream ?? null;
  }
  getCallState(): CallState | null {
    return this.state ? { ...this.state } : null;
  }

  private async generateCallId(): Promise<string> {
    const array = new Uint8Array(16);
    Crypto.getRandomValues(array);
    const randomHex = Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `call_${Date.now()}_${randomHex}`;
  }
}

export default WebRTCManager;
