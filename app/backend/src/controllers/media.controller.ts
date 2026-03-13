import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/chat/media.service.js';
import { getPresignedUploadUrl, getPresignedDownloadUrl, generateObjectName } from '../config/minio.js';

// Extended request with user
interface AuthRequest extends Request {
  user?: { userId: string; name: string };
}

export class MediaController {
  // Upload a file
  static async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const attachment = await MediaService.uploadFile({
        conversationId,
        userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
      });

      res.json(attachment);
    } catch (error: any) {
      if (error.message.includes('exceeds maximum')) {
        return res.status(413).json({ error: error.message });
      }
      next(error);
    }
  }

  // Upload an image
  static async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!MediaService.isAllowedImageType(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid image type' });
      }

      const attachment = await MediaService.uploadImage({
        conversationId,
        userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        generateThumbnail: true,
      });

      res.json(attachment);
    } catch (error: any) {
      if (error.message.includes('exceeds maximum')) {
        return res.status(413).json({ error: error.message });
      }
      next(error);
    }
  }

  // Upload a voice message
  static async uploadVoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const { duration, waveform } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!MediaService.isAllowedAudioType(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid audio type' });
      }

      const attachment = await MediaService.uploadVoice({
        conversationId,
        userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        duration: parseFloat(duration) || 0,
        waveform: waveform ? JSON.parse(waveform) : undefined,
      });

      res.json(attachment);
    } catch (error) {
      next(error);
    }
  }

  // Upload a video
  static async uploadVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const { duration, width, height } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!MediaService.isAllowedVideoType(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid video type' });
      }

      const attachment = await MediaService.uploadVideo({
        conversationId,
        userId,
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        duration: duration ? parseFloat(duration) : undefined,
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
      });

      res.json(attachment);
    } catch (error: any) {
      if (error.message.includes('exceeds maximum')) {
        return res.status(413).json({ error: error.message });
      }
      next(error);
    }
  }

  // Upload user avatar
  static async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!MediaService.isAllowedImageType(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid image type' });
      }

      const url = await MediaService.uploadAvatar(userId, {
        buffer: file.buffer,
        mimetype: file.mimetype,
      });

      res.json({ url });
    } catch (error) {
      next(error);
    }
  }

  // Get presigned upload URL
  static async getUploadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { filename, type } = req.query;

      if (!filename || !type) {
        return res.status(400).json({ error: 'filename and type are required' });
      }

      const mediaType = type as 'images' | 'files' | 'voice' | 'video';
      const objectName = generateObjectName(mediaType, conversationId, filename as string);
      const uploadUrl = await getPresignedUploadUrl(objectName);

      res.json({
        uploadUrl,
        objectName,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get presigned download URL
  static async getDownloadUrl(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { objectName } = req.params;
      
      const downloadUrl = await getPresignedDownloadUrl(
        decodeURIComponent(objectName)
      );

      res.json({ downloadUrl });
    } catch (error) {
      next(error);
    }
  }

  // Delete media (for message deletion cleanup)
  static async deleteMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'url is required' });
      }

      await MediaService.deleteMedia(url);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
