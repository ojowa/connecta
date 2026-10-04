class MockMediaStream {
  id = '';
  active = false;
  getTracks() {
    return [];
  }
  getAudioTracks() {
    return [];
  }
  getVideoTracks() {
    return [];
  }
  addTrack() {}
  removeTrack() {}
  toURL() {
    return '';
  }
}

class MockRTCPeerConnection {
  localDescription: any = null;
  remoteDescription: any = null;
  iceConnectionState = 'new';
  onicecandidate: ((event: any) => void) | null = null;
  ontrack: ((event: any) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  async createOffer() {
    return {};
  }
  async createAnswer() {
    return {};
  }
  async setLocalDescription() {}
  async setRemoteDescription() {}
  async addIceCandidate() {}
  addTrack() {
    return { track: null };
  }
  getSenders() {
    return [];
  }
  close() {}
  restartIce() {}
  async getStats() {
    return { forEach() {} };
  }
}

export const RTCPeerConnection = MockRTCPeerConnection as any;
export const RTCSessionDescription = class {} as any;
export const RTCIceCandidate = class {} as any;
export const MediaStream = MockMediaStream as any;
export const mediaDevices = {
  getUserMedia: async () => new MockMediaStream(),
  enumerateDevices: async () => [],
};

export function RTCView(props: any) {
  return null;
}
