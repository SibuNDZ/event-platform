"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sharp = __importStar(require("sharp"));
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    s3Client;
    bucket;
    publicUrl;
    constructor(configService) {
        this.configService = configService;
        const accountId = this.configService.get('R2_ACCOUNT_ID');
        const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');
        this.bucket = this.configService.get('R2_BUCKET_NAME', 'event-platform');
        this.publicUrl = this.configService.get('R2_PUBLIC_URL', '');
        // For local development, use MinIO
        const isLocal = this.configService.get('NODE_ENV') === 'development';
        this.s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: isLocal
                ? 'http://localhost:9000'
                : `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: isLocal ? 'minioadmin' : (accessKeyId || ''),
                secretAccessKey: isLocal ? 'minioadmin' : (secretAccessKey || ''),
            },
            forcePathStyle: isLocal, // Required for MinIO
        });
    }
    async upload(buffer, options = {}) {
        const { folder = 'uploads', filename, contentType = 'application/octet-stream', public: isPublic = false, metadata = {}, } = options;
        const key = filename
            ? `${folder}/${filename}`
            : `${folder}/${(0, uuid_1.v4)()}${this.getExtension(contentType)}`;
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            Metadata: metadata,
            ...(isPublic && { ACL: 'public-read' }),
        }));
        const result = {
            key,
            url: await this.getSignedUrl(key),
        };
        if (isPublic && this.publicUrl) {
            result.publicUrl = `${this.publicUrl}/${key}`;
        }
        return result;
    }
    async uploadImage(buffer, options = {}) {
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
    async get(key) {
        try {
            const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            if (response.Body) {
                const chunks = [];
                for await (const chunk of response.Body) {
                    chunks.push(chunk);
                }
                return Buffer.concat(chunks);
            }
            return null;
        }
        catch (error) {
            if (error.name === 'NoSuchKey') {
                return null;
            }
            throw error;
        }
    }
    async delete(key) {
        await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }
    async deleteFolder(folder) {
        const objects = await this.list(folder);
        for (const obj of objects) {
            await this.delete(obj.key);
        }
    }
    async list(prefix) {
        const response = await this.s3Client.send(new client_s3_1.ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: prefix,
        }));
        return (response.Contents || []).map((obj) => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
        }));
    }
    async exists(key) {
        try {
            await this.s3Client.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            return true;
        }
        catch {
            return false;
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async getUploadUrl(key, contentType, expiresIn = 3600) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    getPublicUrl(key) {
        if (!this.publicUrl)
            return null;
        return `${this.publicUrl}/${key}`;
    }
    getExtension(contentType) {
        const map = {
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
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map