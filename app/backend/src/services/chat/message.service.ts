import { Types } from 'mongoose';
import { Message, IMessage, MessageType, IMediaAttachment } from '../../models/Message.js';
import { Conversation } from '../../models/Conversation.js';
import { emitToConversation } from '../../config/socket.js';
import { User } from '../../models/User.js';

export interface SendMessageDTO {
  conversationId: string;
  type: MessageType;
  content: {
    text?: string;
    encrypted?: string;
    iv?: string;
  };
  media?: IMediaAttachment[];
  replyTo?: string;
  threadRoot?: string;
  mentions?: {
    users?: string[];
    everyone?: boolean;
    here?: boolean;
  };
}

export interface EditMessageDTO {
  content: {
    text?: string;
    encrypted?: string;
    iv?: string;
  };
}

export class MessageService {
  // Send a new message
  static async send(senderId: string, data: SendMessageDTO): Promise<IMessage> {
    const senderObjectId = new Types.ObjectId(senderId);
    const conversationObjectId = new Types.ObjectId(data.conversationId);

    // Verify sender is member of conversation
    const conversation = await Conversation.findOne({
      _id: conversationObjectId,
      'members.userId': senderObjectId,
    });

    if (!conversation) {
      throw new Error('Not a member of this conversation');
    }

    // Get sender info for denormalization
    const sender = await User.findById(senderId).select('name');
    if (!sender) {
      throw new Error('Sender not found');
    }

    // Build reply reference if replying
    let replyTo;
    if (data.replyTo) {
      const replyMessage = await Message.findById(data.replyTo)
        .populate('senderId', 'name');
      if (replyMessage) {
        const replySender = replyMessage.senderId as any;
        replyTo = {
          messageId: replyMessage._id,
          senderId: replySender._id,
          senderName: replySender.name,
          preview: replyMessage.content.text?.substring(0, 100) || '[Media]',
        };
      }
    }

    // Create message
    const message = new Message({
      conversationId: conversationObjectId,
      senderId: senderObjectId,
      type: data.type,
      content: data.content,
      media: data.media,
      replyTo,
      threadRoot: data.threadRoot ? new Types.ObjectId(data.threadRoot) : undefined,
      mentions: data.mentions ? {
        users: data.mentions.users?.map((id) => new Types.ObjectId(id)) || [],
        everyone: data.mentions.everyone || false,
        here: data.mentions.here || false,
      } : undefined,
      readBy: [senderObjectId], // Sender has read their own message
    });

    await message.save();

    // Update thread count if this is a thread reply
    if (data.threadRoot) {
      await Message.updateOne(
        { _id: data.threadRoot },
        { $inc: { threadCount: 1 } }
      );
    }

    // Update conversation's last message
    const lastMessagePreview = data.content.text?.substring(0, 100) || 
      (data.type === 'image' ? '📷 Image' : 
       data.type === 'file' ? '📎 File' :
       data.type === 'voice' ? '🎤 Voice message' :
       data.type === 'video' ? '🎬 Video' : 'Message');

    await Conversation.updateOne(
      { _id: conversationObjectId },
      {
        $set: {
          lastMessage: {
            _id: message._id,
            senderId: senderObjectId,
            senderName: sender.name,
            content: lastMessagePreview,
            type: data.type,
            timestamp: message.createdAt,
          },
        },
      }
    );

    // Populate and emit
    const populated = await message.populate('senderId', 'name email avatar');
    emitToConversation(data.conversationId, 'message:new', populated);

    return populated;
  }

  // Get messages for a conversation with cursor pagination
  static async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    cursor?: string,
    direction: 'before' | 'after' = 'before'
  ): Promise<{ messages: IMessage[]; nextCursor: string | null; hasMore: boolean }> {
    // Verify user is member
    const isMember = await Conversation.exists({
      _id: conversationId,
      'members.userId': userId,
    });

    if (!isMember) {
      throw new Error('Not a member of this conversation');
    }

    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
      deletedAt: null,
    };

    if (cursor) {
      query._id = direction === 'before'
        ? { $lt: new Types.ObjectId(cursor) }
        : { $gt: new Types.ObjectId(cursor) };
    }

    const sortOrder = direction === 'before' ? -1 : 1;

    const messages = await Message.find(query)
      .sort({ _id: sortOrder })
      .limit(limit + 1)
      .populate('senderId', 'name email avatar');

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, -1) : messages;

    // Reverse if getting messages after cursor to maintain chronological order
    if (direction === 'after') {
      results.reverse();
    }

    const nextCursor = hasMore ? results[results.length - 1]._id.toString() : null;

    return { messages: results, nextCursor, hasMore };
  }

  // Get thread messages
  static async getThreadMessages(
    threadRootId: string,
    userId: string,
    limit = 50,
    cursor?: string
  ): Promise<{ messages: IMessage[]; nextCursor: string | null }> {
    const rootMessage = await Message.findById(threadRootId);
    if (!rootMessage) {
      throw new Error('Thread not found');
    }

    // Verify user is member of conversation
    const isMember = await Conversation.exists({
      _id: rootMessage.conversationId,
      'members.userId': userId,
    });

    if (!isMember) {
      throw new Error('Not a member of this conversation');
    }

    const query: any = {
      threadRoot: new Types.ObjectId(threadRootId),
      deletedAt: null,
    };

    if (cursor) {
      query._id = { $gt: new Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .populate('senderId', 'name email avatar');

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? results[results.length - 1]._id.toString() : null;

    return { messages: results, nextCursor };
  }

  // Edit message
  static async edit(
    messageId: string,
    userId: string,
    data: EditMessageDTO
  ): Promise<IMessage | null> {
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        senderId: userId,
        deletedAt: null,
      },
      {
        $set: {
          content: data.content,
          editedAt: new Date(),
        },
      },
      { new: true }
    ).populate('senderId', 'name email avatar');

    if (message) {
      emitToConversation(message.conversationId.toString(), 'message:edited', {
        messageId: message._id.toString(),
        content: message.content.text || '',
        editedAt: message.editedAt!.toISOString(),
      });
    }

    return message;
  }

  // Delete message (soft delete)
  static async delete(messageId: string, userId: string): Promise<boolean> {
    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
    });

    if (!message) {
      return false;
    }

    message.deletedAt = new Date();
    message.deletedBy = new Types.ObjectId(userId);
    message.content = { text: 'This message was deleted' };
    message.media = [];
    await message.save();

    emitToConversation(message.conversationId.toString(), 'message:deleted', {
      messageId,
      deletedAt: message.deletedAt.toISOString(),
    });

    return true;
  }

  // Add reaction
  static async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<IMessage | null> {
    const userObjectId = new Types.ObjectId(userId);

    // First, try to add user to existing reaction
    let message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        'reactions.emoji': emoji,
      },
      {
        $addToSet: { 'reactions.$.userIds': userObjectId },
        $inc: { 'reactions.$.count': 1 },
      },
      { new: true }
    );

    // If no existing reaction, create new one
    if (!message) {
      message = await Message.findByIdAndUpdate(
        messageId,
        {
          $push: {
            reactions: {
              emoji,
              userIds: [userObjectId],
              count: 1,
            },
          },
        },
        { new: true }
      );
    }

    if (message) {
      emitToConversation(message.conversationId.toString(), 'message:reaction', {
        messageId,
        reactions: message.reactions,
      });
    }

    return message;
  }

  // Remove reaction
  static async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<IMessage | null> {
    const userObjectId = new Types.ObjectId(userId);

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        'reactions.emoji': emoji,
      },
      {
        $pull: { 'reactions.$.userIds': userObjectId },
        $inc: { 'reactions.$.count': -1 },
      },
      { new: true }
    );

    // Remove reaction entry if no users left
    if (message) {
      await Message.updateOne(
        { _id: messageId },
        { $pull: { reactions: { count: { $lte: 0 } } } }
      );

      const updated = await Message.findById(messageId);
      if (updated) {
        emitToConversation(updated.conversationId.toString(), 'message:reaction', {
          messageId,
          reactions: updated.reactions,
        });
      }
    }

    return message;
  }

  // Mark messages as read
  static async markAsRead(
    conversationId: string,
    userId: string,
    upToMessageId: string
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    // Update all unread messages up to the specified message
    await Message.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        _id: { $lte: new Types.ObjectId(upToMessageId) },
        readBy: { $ne: userObjectId },
      },
      {
        $addToSet: { readBy: userObjectId },
      }
    );

    // Update last read in conversation
    await Conversation.updateOne(
      { _id: conversationId, 'members.userId': userObjectId },
      { $set: { 'members.$.lastReadAt': new Date() } }
    );

    // Emit read receipt
    emitToConversation(conversationId, 'message:read', {
      conversationId,
      userId,
      messageId: upToMessageId,
    });
  }

  // Get unread count for a conversation
  static async getUnreadCount(
    conversationId: string,
    userId: string,
    sinceMessageId?: string
  ): Promise<number> {
    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
      readBy: { $ne: new Types.ObjectId(userId) },
      senderId: { $ne: new Types.ObjectId(userId) },
      deletedAt: null,
    };

    if (sinceMessageId) {
      query._id = { $gt: new Types.ObjectId(sinceMessageId) };
    }

    return Message.countDocuments(query);
  }

  // Search messages
  static async search(
    userId: string,
    query: string,
    conversationId?: string,
    limit = 50
  ): Promise<IMessage[]> {
    const searchQuery: any = {
      'content.text': { $regex: query, $options: 'i' },
      deletedAt: null,
    };

    if (conversationId) {
      // Verify user is member
      const isMember = await Conversation.exists({
        _id: conversationId,
        'members.userId': userId,
      });
      if (!isMember) {
        return [];
      }
      searchQuery.conversationId = new Types.ObjectId(conversationId);
    } else {
      // Get all user's conversations
      const conversations = await Conversation.find({
        'members.userId': userId,
      }).select('_id');
      searchQuery.conversationId = { $in: conversations.map((c) => c._id) };
    }

    return Message.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'name email avatar');
  }
}
