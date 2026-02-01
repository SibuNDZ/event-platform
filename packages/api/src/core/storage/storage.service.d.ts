import { ConfigService } from '@nestjs/config';
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
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly publicUrl;
    constructor(configService: ConfigService);
    upload(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
    uploadImage(buffer: Buffer, options?: UploadOptions & {
        resize?: {
            width?: number;
            height?: number;
        };
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
    }): Promise<UploadResult>;
    get(key: string): Promise<Buffer | null>;
    delete(key: string): Promise<void>;
    deleteFolder(folder: string): Promise<void>;
    list(prefix: string): Promise<Array<{
        key: string;
        size: number;
        lastModified: Date;
    }>>;
    exists(key: string): Promise<boolean>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
    getPublicUrl(key: string): string | null;
    private getExtension;
}
//# sourceMappingURL=storage.service.d.ts.map