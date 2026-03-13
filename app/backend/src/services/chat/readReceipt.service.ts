import { Types } from 'mongoose';
import { Message } from '../../models/Message.js';
import { Conversation, IConversation } from '../../models/Conversation.js';
import { emitToConversation } from '../../config/socket.js';

// Threshold for using per-message readBy vs read horizon
const SMALL_GROUP_THRESHOLD = 20;

export interface ReadReceipt {
  userId: string;
  messageId: string;
  readAt: Date;
}

export interface ReadHorizonEntry {
  userId: string;
  lastReadMessageId: string;
  lastReadAt: Date;
}

export class ReadReceiptService {
  /**
   * Mark messages as read up to a specific message
   * Uses hybrid approach: per-message readBy for small groups, read horizon only for large groups
   */
  static async markAsRead(
    userId: string,
    conversationId: string,
    messageId: string
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);

    // Get conversation to check member count
    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is member
    const memberIndex = conversation.members.findIndex(
      (m) => m.userId.toString() === userId
    );
    if (memberIndex === -1) {
      throw new Error('Not a member of this conversation');
    }

    const isSmallGroup = conversation.members.length <= SMALL_GROUP_THRESHOLD;
    const now = new Date();

    // Always update read horizon in conversation member
    await Conversation.updateOne(
      { _id: conversationObjectId, 'members.userId': userObjectId },
      {
        $set: {
          'members.$.lastReadAt': now,
          'members.$.lastReadMessageId': messageObjectId,
        },
      }
    );

    // For small groups (DMs and small groups), also update per-message readBy
    if (isSmallGroup) {
      await Message.updateMany(
        {
          conversationId: conversationObjectId,
          _id: { $lte: messageObjectId },
          readBy: { $ne: userObjectId },
        },
        {
          $addToSet: { readBy: userObjectId },
        }
      );
    }

    // Emit read receipt to conversation members
    emitToConversation(conversationId, 'message:read', {
      conversationId,
      userId,
      messageId,
      readAt: now.toISOString(),
    });
  }

  /**
   * Get read receipts for a specific message
   * Returns list of users who have read this message
   */
  static async getReadReceipts(
    conversationId: string,
    messageId: string
  ): Promise<ReadReceipt[]> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);

    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isSmallGroup = conversation.members.length <= SMALL_GROUP_THRESHOLD;

    if (isSmallGroup) {
      // For small groups, use per-message readBy array
      const message = await Message.findById(messageObjectId);
      if (!message) {
        return [];
      }

      return message.readBy.map((userId) => {
        const member = conversation.members.find(
          (m) => m.userId.toString() === userId.toString()
        );
        return {
          userId: userId.toString(),
          messageId: messageId,
          readAt: member?.lastReadAt || new Date(),
        };
      });
    } else {
      // For large groups, derive from read horizon
      const receipts: ReadReceipt[] = [];
      
      for (const member of conversation.members) {
        if (
          member.lastReadMessageId &&
          member.lastReadMessageId.toString() >= messageId
        ) {
          receipts.push({
            userId: member.userId.toString(),
            messageId: messageId,
            readAt: member.lastReadAt,
          });
        }
      }

      return receipts;
    }
  }

  /**
   * Get unread count for a user in a conversation
   */
  static async getUnreadCount(
    userId: string,
    conversationId: string
  ): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    // Get user's read horizon from conversation
    const conversation = await Conversation.findOne(
      { _id: conversationObjectId, 'members.userId': userObjectId },
      { 'members.$': 1 }
    );

    if (!conversation || conversation.members.length === 0) {
      return 0;
    }

    const member = conversation.members[0];
    const lastReadMessageId = member.lastReadMessageId;

    const query: any = {
      conversationId: conversationObjectId,
      senderId: { $ne: userObjectId },
      deletedAt: null,
    };

    // If user has a read horizon, count messages after it
    if (lastReadMessageId) {
      query._id = { $gt: lastReadMessageId };
    }

    return Message.countDocuments(query);
  }

  /**
   * Get read horizon for all members in a conversation
   * Returns a map of userId to their last read message
   */
  static async getReadHorizon(
    conversationId: string
  ): Promise<ReadHorizonEntry[]> {
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation.members
      .filter((member) => member.lastReadMessageId)
      .map((member) => ({
        userId: member.userId.toString(),
        lastReadMessageId: member.lastReadMessageId!.toString(),
        lastReadAt: member.lastReadAt,
      }));
  }

  /**
   * Check if a specific user has read a message
   */
  static async hasUserReadMessage(
    userId: string,
    conversationId: string,
    messageId: string
  ): Promise<boolean> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      return false;
    }

    const isSmallGroup = conversation.members.length <= SMALL_GROUP_THRESHOLD;

    if (isSmallGroup) {
      // Check per-message readBy
      const message = await Message.findOne({
        _id: messageObjectId,
        readBy: userObjectId,
      });
      return !!message;
    } else {
      // Check read horizon
      const member = conversation.members.find(
        (m) => m.userId.toString() === userId
      );
      if (!member?.lastReadMessageId) {
        return false;
      }
      return member.lastReadMessageId.toString() >= messageId;
    }
  }

  /**
   * Get batch read status for multiple messages
   * Efficient for loading conversation view
   */
  static async getBatchReadStatus(
    userId: string,
    conversationId: string,
    messageIds: string[]
  ): Promise<Map<string, boolean>> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation = await Conversation.findById(conversationObjectId);
    if (!conversation) {
      return new Map();
    }

    const result = new Map<string, boolean>();
    const member = conversation.members.find(
      (m) => m.userId.toString() === userId
    );

    const isSmallGroup = conversation.members.length <= SMALL_GROUP_THRESHOLD;

    if (isSmallGroup) {
      // Batch query for messages
      const messages = await Message.find({
        _id: { $in: messageIds.map((id) => new Types.ObjectId(id)) },
        readBy: userObjectId,
      }).select('_id');

      const readSet = new Set(messages.map((m) => m._id.toString()));
      messageIds.forEach((id) => {
        result.set(id, readSet.has(id));
      });
    } else {
      // Use read horizon for all
      const lastReadId = member?.lastReadMessageId?.toString();
      messageIds.forEach((id) => {
        result.set(id, lastReadId ? id <= lastReadId : false);
      });
    }

    return result;
  }
}
