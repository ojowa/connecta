import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  async upload(data: any) {
    return { message: 'Upload — to be implemented' };
  }

  async getPresignedUrl(data: any) {
    return { message: 'Presigned URL — to be implemented' };
  }

  async getMedia(id: string) {
    return { message: `Get media ${id} — to be implemented` };
  }

  async deleteMedia(id: string) {
    return { message: `Delete media ${id} — to be implemented` };
  }
}
