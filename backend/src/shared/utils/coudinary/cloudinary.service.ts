/* eslint-disable no-useless-escape */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { File as MulterFile } from 'multer';

/**
 * Result interface for Cloudinary uploads
 * Contains all essential information returned after successful upload
 */
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
  width?: number;
  height?: number;
  folder: string;
}

/**
 * Enum for upload types (project management context)
 */
export enum UploadType {
  USER_PROFILE = 'user_profile',
  DOCUMENT = 'document',
  PROJECT_ATTACHMENT = 'project_attachment',
}

/**
 * Upload config for project management system
 */
export interface UploadConfig {
  uploadType: UploadType;
  maxSizeBytes: number;
  allowedFormats: string[];
  folder: string;
  transformations?: any;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('Cloudinary service initialized successfully');
  }

  /**
   * Get upload config for project management system
   */
  private getUploadConfig(uploadType: UploadType): UploadConfig {
    const configs: Record<UploadType, UploadConfig> = {
      [UploadType.USER_PROFILE]: {
        uploadType,
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'project-management/users/profiles',
        transformations: {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'auto',
        },
      },
      [UploadType.DOCUMENT]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
        folder: 'project-management/documents',
      },
      [UploadType.PROJECT_ATTACHMENT]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'],
        folder: 'project-management/projects/attachments',
      },
    };
    return configs[uploadType];
  }
  private validateFile(file: MulterFile, config: UploadConfig): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > config.maxSizeBytes) {
      const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB for ${config.uploadType}`,
      );
    }
    const fileExtension = (
      file.originalname?.split('.').pop() || ''
    ).toLowerCase();
    if (
      !fileExtension ||
      !config.allowedFormats.includes(String(fileExtension))
    ) {
      throw new BadRequestException(
        `Invalid file format. Allowed formats for ${config.uploadType}: ${config.allowedFormats.join(', ')}`,
      );
    }
  }

  private generatePublicId(
    config: UploadConfig,
    entityId?: string | number,
    entityType?: string,
  ): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    if (entityId && entityType) {
      return `${config.folder}/${entityType}/${entityId}/${config.uploadType}_${timestamp}_${randomString}`;
    }
    return `${config.folder}/${config.uploadType}_${timestamp}_${randomString}`;
  }
  async uploadFile(
    file: MulterFile,
    uploadType: UploadType,
    options?: {
      entityId?: string | number;
      entityType?: string;
      tags?: string[];
      context?: Record<string, any>;
    },
  ): Promise<CloudinaryUploadResult> {
    try {
      const config = this.getUploadConfig(uploadType);
      this.validateFile(file, config);
      const publicId = this.generatePublicId(
        config,
        options?.entityId,
        options?.entityType,
      );
      this.logger.log(`Uploading ${uploadType} file: ${file.originalname}`);
      const uploadOptions: any = {
        public_id: publicId,
        resource_type: 'auto',
        tags: [
          uploadType,
          ...(options?.tags || []),
          ...(options?.entityType ? [options.entityType] : []),
          ...(options?.entityId
            ? [`${options.entityType}-${options.entityId}`]
            : []),
        ].filter(Boolean),
        context: {
          upload_type: uploadType,
          uploaded_at: new Date().toISOString(),
          ...(options?.context || {}),
        },
      };
      if (config.transformations) {
        uploadOptions.transformation = config.transformations;
      }
      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: any, result: any) => {
              if (error) {
                this.logger.error(`Cloudinary upload failed: ${error.message}`);
                reject(
                  new BadRequestException(`Upload failed: ${error.message}`),
                );
              } else if (result) {
                resolve({
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                  url: result.url,
                  original_filename: result.original_filename,
                  bytes: result.bytes,
                  format: result.format,
                  resource_type: result.resource_type,
                  created_at: result.created_at,
                  width: result.width,
                  height: result.height,
                  folder: result.folder,
                });
              } else {
                reject(
                  new BadRequestException('Upload failed: No result returned'),
                );
              }
            },
          );
          uploadStream.end(file.buffer);
        },
      );
      this.logger.log(
        `Successfully uploaded ${uploadType} with public_id: ${result.public_id}`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `File upload failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  async uploadUserProfileImage(
    file: MulterFile,
    userId: string,
    oldImageUrl?: string,
  ): Promise<CloudinaryUploadResult> {
    try {
      if (oldImageUrl) {
        const oldPublicId = this.extractPublicIdFromUrl(oldImageUrl);
        await this.deleteFile(oldPublicId).catch((error) => {
          this.logger.warn(
            `Failed to delete old profile image: ${error.message}`,
          );
        });
      }
      return await this.uploadFile(file, UploadType.USER_PROFILE, {
        entityId: userId,
        entityType: 'user',
        tags: ['profile', 'user'],
        context: { user_id: userId },
      });
    } catch (error) {
      this.logger.error(
        `Profile image upload failed for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      this.logger.log(`Deleting file with public_id: ${publicId}`);
      const result: any = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new BadRequestException(
          `Failed to delete file: ${result.result}`,
        );
      }
      this.logger.log(`Successfully deleted file: ${publicId}`);
    } catch (error: any) {
      this.logger.error(
        `File deletion failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  private extractPublicIdFromUrl(url: string): string {
    try {
      const matches = url.match(/\/([^\/]+)\.[^\/]+$/);
      if (matches && matches[1]) {
        return matches[1];
      }
      const parts = url.split('/');
      const fileWithExtension = parts[parts.length - 1];
      const publicId = fileWithExtension.split('.')[0];
      const folderParts = parts.slice(parts.indexOf('project-management'));
      folderParts[folderParts.length - 1] = publicId;
      return folderParts.join('/');
    } catch {
      this.logger.warn(`Failed to extract public_id from URL: ${url}`);
      return url;
    }
  }
}
