import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageConfig {
  type: 'local' | 'remote';
  localPath?: string;
  s3Config?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    endpoint?: string; // For DigitalOcean Spaces or other S3-compatible services
  };
}

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageService {
  private config: StorageConfig;
  private s3Client?: S3Client;

  constructor() {
    // Initialize storage configuration from environment variables
    const storageType = process.env.MEDIA_STORAGE_LOCAL === 'local' ? 'local' : 'remote';

    this.config = {
      type: storageType,
      localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
    };

    // Initialize S3 client if using remote storage
    if (storageType === 'remote') {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
      const region = process.env.AWS_REGION || 'us-east-1';
      const bucket = process.env.AWS_S3_BUCKET;
      const endpoint = process.env.AWS_S3_ENDPOINT; // For DigitalOcean Spaces

      if (!accessKeyId || !secretAccessKey || !bucket) {
        throw new Error('AWS credentials and bucket are required for remote storage');
      }

      this.config.s3Config = {
        accessKeyId,
        secretAccessKey,
        region,
        bucket,
        endpoint,
      };

      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        ...(endpoint && { endpoint }),
      });
    }
  }

  /**
   * Upload file to storage (local or remote)
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
    if (this.config.type === 'local') {
      return this.uploadToLocal(buffer, filename, folder);
    } else {
      return this.uploadToS3(buffer, filename, mimeType, folder);
    }
  }

  /**
   * Upload file to local filesystem
   */
  private async uploadToLocal(
    buffer: Buffer,
    filename: string,
    folder: string
  ): Promise<UploadResult> {
    const uploadDir = path.join(this.config.localPath!, folder);
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);

    // Return URL (relative path for local storage)
    const url = `/uploads/${folder}/${filename}`;

    return {
      url,
      path: filePath,
    };
  }

  /**
   * Upload file to S3-compatible storage
   */
  private async uploadToS3(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.config.s3Config) {
      throw new Error('S3 client not initialized');
    }

    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.config.s3Config.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);

    // Construct URL
    let url: string;
    if (this.config.s3Config.endpoint) {
      // DigitalOcean Spaces or custom endpoint
      url = `${this.config.s3Config.endpoint}/${this.config.s3Config.bucket}/${key}`;
    } else {
      // AWS S3
      url = `https://${this.config.s3Config.bucket}.s3.${this.config.s3Config.region}.amazonaws.com/${key}`;
    }

    return {
      url,
      path: key,
    };
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    if (this.config.type === 'local') {
      await this.deleteFromLocal(filePath);
    } else {
      await this.deleteFromS3(filePath);
    }
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting local file:', error);
      // Don't throw error if file doesn't exist
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !this.config.s3Config) {
      throw new Error('S3 client not initialized');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.s3Config.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Get storage type
   */
  getStorageType(): 'local' | 'remote' {
    return this.config.type;
  }
}

export const storageService = new StorageService();
