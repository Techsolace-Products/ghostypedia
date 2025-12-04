import { imagekit, imagekitConfig } from '../config/imagekit';
import type { UploadResponse, FileObject } from 'imagekit/dist/libs/interfaces';

export interface ImageUploadOptions {
  file: string | Buffer; // base64 string or buffer
  fileName: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  customMetadata?: Record<string, string>;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif';
  crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
  focus?: 'center' | 'top' | 'left' | 'bottom' | 'right';
}

export class ImageKitService {
  /**
   * Upload an image to ImageKit
   */
  async uploadImage(options: ImageUploadOptions): Promise<UploadResponse> {
    try {
      const uploadOptions = {
        file: options.file,
        fileName: options.fileName,
        folder: options.folder || imagekitConfig.ghostImagesFolder,
        tags: options.tags || [],
        useUniqueFileName: options.useUniqueFileName ?? true,
        customMetadata: options.customMetadata,
      };

      const result = await imagekit.upload(uploadOptions);
      return result;
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw new Error('Failed to upload image to ImageKit');
    }
  }

  /**
   * Upload ghost image with specific metadata
   */
  async uploadGhostImage(
    file: string | Buffer,
    ghostId: string,
    fileName: string,
    tags?: string[]
  ): Promise<UploadResponse> {
    return this.uploadImage({
      file,
      fileName,
      folder: imagekitConfig.ghostImagesFolder,
      tags: ['ghost', ...(tags || [])],
      customMetadata: {
        ghostId,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Get image URL with transformations
   */
  getImageUrl(filePath: string, transforms?: ImageTransformOptions): string {
    const transformation: any[] = [];

    if (transforms) {
      const transformObj: any = {};
      
      if (transforms.width) transformObj.width = transforms.width.toString();
      if (transforms.height) transformObj.height = transforms.height.toString();
      if (transforms.quality) transformObj.quality = transforms.quality.toString();
      if (transforms.format) transformObj.format = transforms.format;
      if (transforms.crop) transformObj.crop = transforms.crop;
      if (transforms.focus) transformObj.focus = transforms.focus;

      transformation.push(transformObj);
    }

    return imagekit.url({
      path: filePath,
      transformation: transformation.length > 0 ? transformation : undefined,
    });
  }

  /**
   * Delete an image from ImageKit
   */
  async deleteImage(fileId: string): Promise<void> {
    try {
      await imagekit.deleteFile(fileId);
    } catch (error) {
      console.error('ImageKit delete error:', error);
      throw new Error('Failed to delete image from ImageKit');
    }
  }

  /**
   * Get image details
   */
  async getImageDetails(fileId: string): Promise<FileObject> {
    try {
      const result = await imagekit.getFileDetails(fileId);
      return result;
    } catch (error) {
      console.error('ImageKit get details error:', error);
      throw new Error('Failed to get image details from ImageKit');
    }
  }

  /**
   * List images in a folder
   */
  async listImages(folder?: string, tags?: string[]): Promise<any[]> {
    try {
      const result = await imagekit.listFiles({
        path: folder || imagekitConfig.ghostImagesFolder,
        tags: tags?.join(','),
      });
      return result as any[];
    } catch (error) {
      console.error('ImageKit list error:', error);
      throw new Error('Failed to list images from ImageKit');
    }
  }

  /**
   * Generate authentication parameters for client-side upload
   */
  getAuthenticationParameters(): {
    signature: string;
    expire: number;
    token: string;
  } {
    return imagekit.getAuthenticationParameters();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Buffer, fileName: string): { valid: boolean; error?: string } {
    // Check file size
    if (file.length > imagekitConfig.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${imagekitConfig.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Check file format
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || !imagekitConfig.allowedFormats.includes(extension)) {
      return {
        valid: false,
        error: `File format not allowed. Allowed formats: ${imagekitConfig.allowedFormats.join(', ')}`,
      };
    }

    return { valid: true };
  }
}

export const imagekitService = new ImageKitService();
