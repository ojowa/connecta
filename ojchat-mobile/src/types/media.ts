export interface MediaItem {
  id: string;
  url: string;
  localPath?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  blurHash?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
