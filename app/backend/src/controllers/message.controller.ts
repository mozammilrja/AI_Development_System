import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/chat/message.service.js';
import { MediaService } from '../services/chat/media.service.js';
import { ReadReceiptService } from '../services/chat/readReceipt.service.js';

// Extended request with user
interface AuthRequest extends Request {
  user?: { userId: string; name: string };
}

export class MessageController {
  // Send a message
  static async send(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { conversationId } = req.params;
      const { type, content, replyTo, threadRoot, mentions } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const message = await MessageService.send(userId, {
        conversationId,
        type: type || 'text',
        content,
        replyTo,
        threadRoot,
        mentions,
      });

      res.status(201).json(message);
    } catch (error: any) {
      if (error.message === 'Not a member of this conversation') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get messages for a conversation
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { conversationId } = req.params;
      const { limit, cursor, direction } = req.query;

      const result = await MessageService.getMessages(
        conversationId,
        userId,
        limit ? parseInt(limit as string) : 50,
        cursor as string,
        (direction as 'before' | 'after') || 'before'
      );

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Not a member of this conversation') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get thread messages
  static async getThread(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { messageId } = req.params;
      const { limit, cursor } = req.query;

      const result = await MessageService.getThreadMessages(
        messageId,
        userId,
        limit ? parseInt(limit as string) : 50,
        cursor as string
      );

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Thread not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not a member of this conversation') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  // Edit a message
  static async edit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { messageId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const message = await MessageService.edit(messageId, userId, { content });

      if (!message) {
        return res.status(404).json({ error: 'Message not found or no permission' });
      }

      res.json(message);
    } catch (error) {
      next(error);
    }
  }

  // Delete a message
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { messageId } = req.params;

      const success = await MessageService.delete(messageId, userId);

      if (!success) {
        return res.status(404).json({ error: 'Message not found or no permission' });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Add reaction
  static async addReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { messageId } = req.params;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji is required' });
      }

      const message = await MessageService.addReaction(messageId, userId, emoji);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ reactions: message.reactions });
    } catch (error) {
      next(error);
    }
  }

  // Remove reaction
  static async removeReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { messageId } = req.params;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({ error: 'Emoji is required' });
      }

      await MessageService.removeReaction(messageId, userId, emoji);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Mark messages as read
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { conversationId, messageId } = req.params;

      // Use ReadReceiptService for hybrid read receipt handling
      await ReadReceiptService.markAsRead(userId, conversationId, messageId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not a member of this conversation') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get read receipts for a message
  static async getReadReceipts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId, messageId } = req.params;

      const receipts = await ReadReceiptService.getReadReceipts(conversationId, messageId);

      res.json({ receipts });
    } catch (error: any) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get read horizon for a conversation
  static async getReadHorizon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;

      const horizon = await ReadReceiptService.getReadHorizon(conversationId);

      res.json({ horizon });
    } catch (error: any) {
      if (error.message === 'Conversation not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get unread count
  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { conversationId } = req.params;

      // Use ReadReceiptService for unread count based on read horizon
      const count = await ReadReceiptService.getUnreadCount(userId, conversationId);

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  // Search messages
  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { q, conversationId, limit } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const messages = await MessageService.search(
        userId,
        q as string,
        conversationId as string,
        limit ? parseInt(limit as string) : 50
      );

      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  // Send message with media (multipart form)
  static async sendWithMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { conversationId } = req.params;
      const files = req.files as Express.Multer.File[];
      const { type, content, replyTo, threadRoot } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Process each file
      const media = await Promise.all(
        files.map(async (file) => {
          const fileOptions = {
            conversationId,
            userId,
            file: {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            },
          };

          if (MediaService.isAllowedImageType(file.mimetype)) {
            return MediaService.uploadImage(fileOptions);
          } else if (MediaService.isAllowedVideoType(file.mimetype)) {
            return MediaService.uploadVideo(fileOptions);
          } else if (MediaService.isAllowedAudioType(file.mimetype)) {
            return MediaService.uploadVoice({ ...fileOptions, duration: 0 });
          } else {
            return MediaService.uploadFile(fileOptions);
          }
        })
      );

      // Determine message type based on media
      let messageType = type || 'file';
      if (media.length === 1) {
        messageType = media[0].type;
      }

      const message = await MessageService.send(userId, {
        conversationId,
        type: messageType,
        content: content ? JSON.parse(content) : { text: '' },
        media,
        replyTo,
        threadRoot,
      });

      res.status(201).json(message);
    } catch (error: any) {
      if (error.message === 'Not a member of this conversation') {
        return res.status(403).json({ error: error.message });
      }
      next(error);
    }
  }
}
