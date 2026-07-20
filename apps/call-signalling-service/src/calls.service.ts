import { Injectable } from '@nestjs/common';

@Injectable()
export class CallsService {
  async startCall(data: any) {
    return { message: 'Start call — to be implemented', callId: 'call-123' };
  }

  async answerCall(data: any) {
    return { message: 'Answer call — to be implemented' };
  }

  async rejectCall(data: any) {
    return { message: 'Reject call — to be implemented' };
  }

  async endCall(data: any) {
    return { message: 'End call — to be implemented' };
  }

  async getHistory(query: any) {
    return { message: 'Get history — to be implemented', calls: [] };
  }
}
