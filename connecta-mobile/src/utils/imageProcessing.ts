import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { apiClient } from '../services/api/apiClient';
import { ProcessedImage } from '../types/media';

export class ImageProcessor {
  static async pickImage(): Promise<ProcessedImage | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (result.canceled) return null;
    return this.processImage(result.assets[0].uri);
  }

  static async takePhoto(): Promise<ProcessedImage | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });
    if (result.canceled) return null;
    return this.processImage(result.assets[0].uri);
  }

  static async processImage(uri: string): Promise<ProcessedImage> {
    const resized = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
    );
    const file = new File(resized.uri);
    const fileSize = file.exists ? file.size : 0;
    return {
      uri: resized.uri,
      width: resized.width,
      height: resized.height,
      size: fileSize ?? 0,
      mimeType: 'image/jpeg',
    };
  }

  static async uploadImage(processedImage: ProcessedImage, onProgress?: (p: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('photo', {
      uri: processedImage.uri,
      type: processedImage.mimeType,
      name: `photo_${Date.now()}.jpg`,
    } as unknown as Blob);
    const response = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data.data.url;
  }
}
