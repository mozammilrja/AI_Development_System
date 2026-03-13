import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/chat/conversation.service.js';
import { IUser } from '../models/index.js';

// Extended request with user
interface AuthRequest extends Request {
  user?: IUser;
}

export class ConversationController {
  // Create a new conversation
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const { type, name, description, members, isPublic, encrypted } = req.body;

      if (!type || !members || !Array.isArray(members)) {
        return res.status(400).json({ error: 'Type and members are required' });
      }

      if (type === 'dm' && members.length !== 1) {
        return res.status(400).json({ error: 'DM requires exactly one other member' });
      }

      const conversation = await ConversationService.create(userId, {
        type,
        name,
        description,
        members,
        isPublic,
        encrypted,
      });

      res.status(201).json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Get user's conversations
  static async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { limit, cursor } = req.query;

      const result = await ConversationService.getUserConversations(
        userId,
        limit ? parseInt(limit as string) : 20,
        cursor as string
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get conversation by ID
  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;

      const conversation = await ConversationService.getById(conversationId, userId);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Update conversation
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const updateData = req.body;

      const conversation = await ConversationService.update(
        conversationId,
        userId,
        updateData
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found or no permission' });
      }

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Add member
  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const { memberId } = req.body;

      if (!memberId) {
        return res.status(400).json({ error: 'memberId is required' });
      }

      const conversation = await ConversationService.addMember(
        conversationId,
        userId,
        memberId
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found or no permission' });
      }

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Remove member
  static async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId, memberId } = req.params;

      const conversation = await ConversationService.removeMember(
        conversationId,
        userId,
        memberId
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found or no permission' });
      }

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Update member role
  static async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId, memberId } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'member'].includes(role)) {
        return res.status(400).json({ error: 'Valid role is required (admin or member)' });
      }

      const conversation = await ConversationService.updateMemberRole(
        conversationId,
        userId,
        memberId,
        role
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found or no permission' });
      }

      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  // Mute conversation
  static async mute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const { muted, mutedUntil } = req.body;

      const success = await ConversationService.setMuted(
        conversationId,
        userId,
        muted ?? true,
        mutedUntil ? new Date(mutedUntil) : undefined
      );

      if (!success) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Pin message
  static async pinMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId, messageId } = req.params;
      const { pin } = req.body;

      const success = await ConversationService.pinMessage(
        conversationId,
        userId,
        messageId,
        pin ?? true
      );

      if (!success) {
        return res.status(404).json({ error: 'Conversation not found or no permission' });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Search public channels
  static async searchChannels(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const channels = await ConversationService.searchPublicChannels(
        q as string,
        limit ? parseInt(limit as string) : 20
      );

      res.json(channels);
    } catch (error) {
      next(error);
    }
  }

  // Leave conversation
  static async leave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;

      const conversation = await ConversationService.removeMember(
        conversationId,
        userId,
        userId
      );

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
