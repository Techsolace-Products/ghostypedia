import ImageKit from 'imagekit';
import { config } from './env';

// Initialize ImageKit instance
export const imagekit = new ImageKit({
  publicKey: config.imagekit.publicKey,
  privateKey: config.imagekit.privateKey,
  urlEndpoint: config.imagekit.urlEndpoint,
});

// ImageKit configuration
export const imagekitConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  ghostImagesFolder: '/ghosts',
  defaultTransformations: [
    {
      width: '800',
      quality: '80',
      format: 'webp',
    },
  ],
};
