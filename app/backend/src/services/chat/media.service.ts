import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { uploadFile, generateObjectName, deleteFile, getFileUrl } from '../../config/minio.js';
import { env } from '../../config/env.js';
import { IMediaAttachment } from '../../models/Message.js';
import { Types } from 'mongoose';

export interface FileUploadOptions {
  conversationId: string;
  userId: string;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

export interface ImageUploadOptions extends FileUploadOptions {
  generateThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export class MediaService {
  // Upload a generic file
  static async uploadFile(options: FileUploadOptions): Promise<IMediaAttachment> {
    const { conversationId, file } = options;
    
    // Validate file size
    if (file.size > env.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed (${env.maxFileSize / 1024 / 1024}MB)`);
    }

    const objectName = generateObjectName('files', conversationId, file.originalname);
    
    const url = await uploadFile(objectName, file.buffer, {
      contentType: file.mimetype,
      metadata: {
        'x-original-name': file.originalname,
      },
    });

    return {
      _id: new Types.ObjectId(),
      type: 'file',
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  // Upload and process an image
  static async uploadImage(options: ImageUploadOptions): Promise<IMediaAttachment> {
    const { 
      conversationId, 
      file,
      generateThumbnail = true,
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 85,
    } = options;

    // Validate file size
    if (file.size > env.maxImageSize) {
      throw new Error(`Image size exceeds maximum allowed (${env.maxImageSize / 1024 / 1024}MB)`);
    }

    // Process image
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    // Resize if needed
    let processedBuffer = file.buffer;
    let finalWidth = metadata.width || 0;
    let finalHeight = metadata.height || 0;

    if (finalWidth > maxWidth || finalHeight > maxHeight) {
      const resized = await image
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer({ resolveWithObject: true });
      
      processedBuffer = resized.data;
      finalWidth = resized.info.width;
      finalHeight = resized.info.height;
    }

    // Generate filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const objectName = generateObjectName('images', conversationId, `image.${ext}`);
    
    const url = await uploadFile(objectName, processedBuffer, {
      contentType: file.mimetype,
    });

    const attachment: IMediaAttachment = {
      _id: new Types.ObjectId(),
      type: 'image',
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: processedBuffer.length,
      width: finalWidth,
      height: finalHeight,
    };

    // Generate thumbnail
    if (generateThumbnail && finalWidth > 200) {
      try {
        const thumbnailBuffer = await sharp(processedBuffer)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 70 })
          .toBuffer();

        const thumbObjectName = generateObjectName('thumbnails', conversationId, `thumb.jpg`);
        attachment.thumbnail = await uploadFile(thumbObjectName, thumbnailBuffer, {
          contentType: 'image/jpeg',
        });

        // Generate blurhash
        attachment.blurhash = await this.generateBlurhash(processedBuffer);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }

    return attachment;
  }

  // Upload voice message
  static async uploadVoice(
    options: FileUploadOptions & { duration: number; waveform?: number[] }
  ): Promise<IMediaAttachment> {
    const { conversationId, file, duration, waveform } = options;

    const objectName = generateObjectName('voice', conversationId, file.originalname);
    
    const url = await uploadFile(objectName, file.buffer, {
      contentType: file.mimetype,
    });

    return {
      _id: new Types.ObjectId(),
      type: 'voice',
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      duration,
      waveform,
    };
  }

  // Upload video
  static async uploadVideo(
    options: FileUploadOptions & { duration?: number; width?: number; height?: number }
  ): Promise<IMediaAttachment> {
    const { conversationId, file, duration, width, height } = options;

    // Validate file size
    if (file.size > env.maxFileSize) {
      throw new Error(`Video size exceeds maximum allowed (${env.maxFileSize / 1024 / 1024}MB)`);
    }

    const objectName = generateObjectName('video', conversationId, file.originalname);
    
    const url = await uploadFile(objectName, file.buffer, {
      contentType: file.mimetype,
    });

    const attachment: IMediaAttachment = {
      _id: new Types.ObjectId(),
      type: 'video',
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      duration,
      width,
      height,
    };

    // TODO: Generate video thumbnail using ffmpeg
    // For now, we skip thumbnail generation

    return attachment;
  }

  // Upload user avatar
  static async uploadAvatar(
    userId: string,
    file: { buffer: Buffer; mimetype: string }
  ): Promise<string> {
    // Process to standard size
    const processedBuffer = await sharp(file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const objectName = `avatars/${userId}/${Date.now()}.jpg`;
    
    return uploadFile(objectName, processedBuffer, {
      contentType: 'image/jpeg',
    });
  }

  // Delete media
  static async deleteMedia(url: string): Promise<void> {
    // Extract object name from URL
    const urlObj = new URL(url);
    const bucketPath = `/${env.minioBucket}/`;
    const objectName = urlObj.pathname.substring(bucketPath.length);
    
    await deleteFile(objectName);
  }

  // Generate blurhash for image placeholder
  private static async generateBlurhash(buffer: Buffer): Promise<string> {
    // Simplified blurhash - in production, use the actual blurhash library
    // This returns a placeholder that works with the blurhash decoder
    try {
      const { data, info } = await sharp(buffer)
        .resize(4, 4, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      // Simple hash based on average color
      const avgR = data.filter((_, i) => i % 3 === 0).reduce((a, b) => a + b, 0) / 16;
      const avgG = data.filter((_, i) => i % 3 === 1).reduce((a, b) => a + b, 0) / 16;
      const avgB = data.filter((_, i) => i % 3 === 2).reduce((a, b) => a + b, 0) / 16;
      
      // Return a simple code representing average color
      return `L00000fQfQfQ~qfQfQfQ`;
    } catch {
      return 'L00000fQfQfQ~qfQfQfQ'; // Default gray placeholder
    }
  }

  // Validate file type
  static isAllowedImageType(mimetype: string): boolean {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return allowed.includes(mimetype);
  }

  static isAllowedVideoType(mimetype: string): boolean {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    return allowed.includes(mimetype);
  }

  static isAllowedAudioType(mimetype: string): boolean {
    const allowed = ['audio/webm', 'audio/ogg', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
    return allowed.includes(mimetype);
  }
}
