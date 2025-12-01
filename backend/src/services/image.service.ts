import sharp from 'sharp';
import { storageService } from './storage.service';
import crypto from 'crypto';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageService {
  /**
   * Optimize and upload image
   */
  async optimizeAndUpload(
    buffer: Buffer,
    originalFilename: string,
    folder: string = 'images',
    options: ImageOptimizationOptions = {}
  ): Promise<{ url: string; path: string; originalSize: number; optimizedSize: number }> {
    const { maxWidth = 1920, maxHeight = 1920, quality = 85, format = 'jpeg' } = options;

    const originalSize = buffer.length;

    // Optimize image with Sharp
    let sharpInstance = sharp(buffer);

    // Get image metadata
    const metadata = await sharpInstance.metadata();

    // Resize if needed
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxWidth || metadata.height > maxHeight)
    ) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to specified format and optimize
    let optimizedBuffer: Buffer;
    let mimeType: string;

    switch (format) {
      case 'jpeg':
        optimizedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
        mimeType = 'image/jpeg';
        break;
      case 'png':
        optimizedBuffer = await sharpInstance.png({ quality, compressionLevel: 9 }).toBuffer();
        mimeType = 'image/png';
        break;
      case 'webp':
        optimizedBuffer = await sharpInstance.webp({ quality }).toBuffer();
        mimeType = 'image/webp';
        break;
      default:
        optimizedBuffer = await sharpInstance.jpeg({ quality, progressive: true }).toBuffer();
        mimeType = 'image/jpeg';
    }

    const optimizedSize = optimizedBuffer.length;

    // Generate unique filename
    const ext = format === 'jpeg' ? 'jpg' : format;
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `${hash}.${ext}`;

    // Upload to storage
    const result = await storageService.uploadFile(optimizedBuffer, filename, mimeType, folder);

    return {
      ...result,
      originalSize,
      optimizedSize,
    };
  }

  /**
   * Optimize avatar image (square, 600x600)
   */
  async optimizeAvatar(
    buffer: Buffer,
    _originalFilename: string
  ): Promise<{ url: string; path: string; originalSize: number; optimizedSize: number }> {
    const originalSize = buffer.length;

    // Optimize and resize to 600x600 square
    const optimizedBuffer = await sharp(buffer)
      .resize(600, 600, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    const optimizedSize = optimizedBuffer.length;

    // Generate unique filename
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `avatar-${hash}.jpg`;

    // Upload to storage
    const result = await storageService.uploadFile(
      optimizedBuffer,
      filename,
      'image/jpeg',
      'avatars'
    );

    return {
      ...result,
      originalSize,
      optimizedSize,
    };
  }

  /**
   * Validate image file
   */
  async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();

      // Check if it's a valid image format
      const validFormats = ['jpeg', 'png', 'webp', 'gif', 'svg'];
      if (!metadata.format || !validFormats.includes(metadata.format)) {
        return false;
      }

      // Check minimum dimensions (at least 100x100)
      if (metadata.width && metadata.height && (metadata.width < 100 || metadata.height < 100)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height) {
        return {
          width: metadata.width,
          height: metadata.height,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const imageService = new ImageService();
