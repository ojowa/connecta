import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesService {
  async getProfile(userId: string) {
    return { message: `Get profile ${userId} — to be implemented` };
  }

  async updateProfile(data: any) {
    return { message: 'Update profile — to be implemented' };
  }

  async uploadPhoto(data: any) {
    return { message: 'Upload photo — to be implemented' };
  }

  async deletePhoto(id: string) {
    return { message: `Delete photo ${id} — to be implemented` };
  }

  async verify(data: any) {
    return { message: 'Verify — to be implemented' };
  }
}
