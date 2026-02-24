// ============================================
// INFRASTRUCTURE - Oracle Object Storage Service
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadResult {
  url: string;
  objectName: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly parUploadUrl: string;
  private readonly publicUrlBase: string;

  constructor(private readonly configService: ConfigService) {
    this.parUploadUrl = this.configService.get<string>('ORACLE_PAR_UPLOAD_URL') || '';
    this.publicUrlBase = this.configService.get<string>('ORACLE_PUBLIC_URL_BASE') || '';

    if (!this.parUploadUrl || !this.publicUrlBase) {
      this.logger.warn('Oracle Storage not configured. File uploads will be disabled.');
    }
  }

  /**
   * Upload a file to Oracle Object Storage using PAR (Pre-Authenticated Request)
   * @param file - File buffer or base64 string
   * @param fileName - Original file name
   * @param folder - Optional folder path (e.g., 'logos', 'avatars')
   * @returns Upload result with public URL
   */
  async uploadFile(
    file: Buffer | string,
    fileName: string,
    folder: string = 'uploads',
  ): Promise<UploadResult> {
    if (!this.parUploadUrl) {
      throw new Error('Storage service not configured');
    }

    // Generate unique object name with folder structure
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectName = `${folder}/${timestamp}-${sanitizedName}`;

    // Convert base64 to buffer if needed
    let fileBuffer: Buffer;
    if (typeof file === 'string') {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = file.includes(',') 
        ? file.split(',')[1] 
        : file;
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      fileBuffer = file;
    }

    // Determine content type
    const contentType = this.getContentType(fileName);

    try {
      // Upload using PAR URL
      const uploadUrl = `${this.parUploadUrl}${objectName}`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Upload failed: ${response.status} - ${errorText}`);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const publicUrl = `${this.publicUrlBase}${objectName}`;
      
      this.logger.log(`File uploaded successfully: ${objectName}`);
      
      return {
        url: publicUrl,
        objectName,
      };
    } catch (error) {
      this.logger.error(`Upload error: ${error}`);
      throw error;
    }
  }

  /**
   * Upload a company logo
   */
  async uploadLogo(file: Buffer | string, fileName: string): Promise<UploadResult> {
    return this.uploadFile(file, fileName, 'logos');
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(objectName: string): Promise<void> {
    if (!this.parUploadUrl) {
      throw new Error('Storage service not configured');
    }

    try {
      const deleteUrl = `${this.parUploadUrl}${objectName}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      this.logger.log(`File deleted: ${objectName}`);
    } catch (error) {
      this.logger.error(`Delete error: ${error}`);
      throw error;
    }
  }

  /**
   * Get content type from file extension
   */
  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return !!this.parUploadUrl && !!this.publicUrlBase;
  }
}
