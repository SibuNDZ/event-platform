import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  public?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  publicUrl?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    this.bucket = this.configService.get<string>('R2_BUCKET_NAME', 'event-platform');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    // For local development, use MinIO
    const isLocal = this.configService.get<string>('NODE_ENV') === 'development';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: isLocal ? 'http://localhost:9000' : `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: isLocal ? 'minioadmin' : accessKeyId || '',
        secretAccessKey: isLocal ? 'minioadmin' : secretAccessKey || '',
      },
      forcePathStyle: isLocal, // Required for MinIO
    });
  }

  async upload(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const {
      folder = 'uploads',
      filename,
      contentType = 'application/octet-stream',
      public: isPublic = false,
      metadata = {},
    } = options;

    const key = filename
      ? `${folder}/${filename}`
      : `${folder}/${uuidv4()}${this.getExtension(contentType)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
        ...(isPublic && { ACL: 'public-read' }),
      })
    );

    const result: UploadResult = {
      key,
      url: await this.getSignedUrl(key),
    };

    if (isPublic && this.publicUrl) {
      result.publicUrl = `${this.publicUrl}/${key}`;
    }

    return result;
  }

  async uploadImage(
    buffer: Buffer,
    options: UploadOptions & {
      resize?: { width?: number; height?: number };
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<UploadResult> {
    const { resize, quality = 80, format = 'webp', ...uploadOptions } = options;

    let image = sharp(buffer);

    if (resize) {
      image = image.resize(resize.width, resize.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to specified format
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
    }

    const processedBuffer = await image.toBuffer();

    return this.upload(processedBuffer, {
      ...uploadOptions,
      contentType: `image/${format}`,
    });
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      if (response.Body) {
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body as AsyncIterable<Buffer>) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      }

      return null;
    } catch (error) {
      if ((error as any).name === 'NoSuchKey') {
        return null;
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async deleteFolder(folder: string): Promise<void> {
    const objects = await this.list(folder);

    for (const obj of objects) {
      await this.delete(obj.key);
    }
  }

  async list(prefix: string): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    const response = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      })
    );

    return (response.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size!,
      lastModified: obj.LastModified!,
    }));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getPublicUrl(key: string): string | null {
    if (!this.publicUrl) return null;
    return `${this.publicUrl}/${key}`;
  }

  private getExtension(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'text/csv': '.csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    };

    return map[contentType] || '';
  }
}
