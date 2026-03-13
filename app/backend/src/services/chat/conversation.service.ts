import { Types } from 'mongoose';
import { Conversation, IConversation, ConversationType, IConversationMember } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { emitToConversation } from '../../config/socket.js';

export interface CreateConversationDTO {
  type: ConversationType;
  name?: string;
  description?: string;
  members: string[];
  isPublic?: boolean;
  encrypted?: boolean;
}

export interface UpdateConversationDTO {
  name?: string;
  description?: string;
  avatar?: string;
  topic?: string;
  isPublic?: boolean;
  settings?: {
    encrypted?: boolean;
    messageRetention?: number;
    membersCanInvite?: boolean;
    slowMode?: number;
  };
}

export class ConversationService {
  // Create a new conversation
  static async create(creatorId: string, data: CreateConversationDTO): Promise<IConversation> {
    const creatorObjectId = new Types.ObjectId(creatorId);
    
    // For DMs, check if conversation already exists
    if (data.type === 'dm' && data.members.length === 1) {
      const otherUserId = new Types.ObjectId(data.members[0]);
      const existing = await Conversation.findOne({
        type: 'dm',
        dmParticipants: { $all: [creatorObjectId, otherUserId] },
      });
      
      if (existing) {
        return existing;
      }
    }

    // Build members array
    const members: IConversationMember[] = [
      {
        userId: creatorObjectId,
        role: 'owner',
        joinedAt: new Date(),
        lastReadAt: new Date(),
        muted: false,
      },
      ...data.members.map((memberId) => ({
        userId: new Types.ObjectId(memberId),
        role: 'member' as const,
        joinedAt: new Date(),
        lastReadAt: new Date(),
        muted: false,
      })),
    ];

    const conversation = new Conversation({
      type: data.type,
      name: data.name,
      description: data.description,
      members,
      dmParticipants: data.type === 'dm' ? [creatorObjectId, new Types.ObjectId(data.members[0])] : undefined,
      settings: {
        encrypted: data.encrypted ?? false,
        membersCanInvite: true,
      },
      isPublic: data.isPublic ?? false,
      createdBy: creatorObjectId,
    });

    await conversation.save();
    return conversation.populate('members.userId', 'name email avatar');
  }

  // Get conversation by ID
  static async getById(conversationId: string, userId: string): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'members.userId': userId,
    }).populate('members.userId', 'name email avatar');

    return conversation;
  }

  // Get user's conversations
  static async getUserConversations(
    userId: string,
    limit = 20,
    cursor?: string
  ): Promise<{ conversations: IConversation[]; nextCursor: string | null }> {
    const query: any = { 'members.userId': new Types.ObjectId(userId) };
    
    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const conversations = await Conversation.find(query)
      .sort({ 'lastMessage.timestamp': -1, _id: -1 })
      .limit(limit + 1)
      .populate('members.userId', 'name email avatar');

    const hasMore = conversations.length > limit;
    const results = hasMore ? conversations.slice(0, -1) : conversations;
    const nextCursor = hasMore ? results[results.length - 1]._id.toString() : null;

    return { conversations: results, nextCursor };
  }

  // Update conversation
  static async update(
    conversationId: string,
    userId: string,
    data: UpdateConversationDTO
  ): Promise<IConversation | null> {
    // Check if user is admin or owner
    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: {
        $elemMatch: {
          userId: new Types.ObjectId(userId),
          role: { $in: ['owner', 'admin'] },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    // Apply updates
    if (data.name !== undefined) conversation.name = data.name;
    if (data.description !== undefined) conversation.description = data.description;
    if (data.avatar !== undefined) conversation.avatar = data.avatar;
    if (data.topic !== undefined) conversation.topic = data.topic;
    if (data.isPublic !== undefined) conversation.isPublic = data.isPublic;
    if (data.settings) {
      conversation.settings = { ...conversation.settings, ...data.settings };
    }

    await conversation.save();
    
    // Emit update to all members
    emitToConversation(conversationId, 'conversation:update', conversation);

    return conversation.populate('members.userId', 'name email avatar');
  }

  // Add member to conversation
  static async addMember(
    conversationId: string,
    userId: string,
    newMemberId: string
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: { $ne: 'dm' },
      $or: [
        { 'members.userId': userId, 'members.role': { $in: ['owner', 'admin'] } },
        { 'settings.membersCanInvite': true, 'members.userId': userId },
      ],
    });

    if (!conversation) {
      return null;
    }

    // Check if already a member
    const isMember = conversation.members.some(
      (m) => m.userId.toString() === newMemberId
    );
    if (isMember) {
      return conversation;
    }

    conversation.members.push({
      userId: new Types.ObjectId(newMemberId),
      role: 'member',
      joinedAt: new Date(),
      lastReadAt: new Date(),
      muted: false,
    });

    await conversation.save();

    // Create system message
    await Message.create({
      conversationId: conversation._id,
      senderId: new Types.ObjectId(userId),
      type: 'system',
      content: {
        systemAction: 'member_added',
        systemData: { memberId: newMemberId },
      },
    });

    const populated = await conversation.populate('members.userId', 'name email avatar');
    emitToConversation(conversationId, 'conversation:member_added', {
      conversationId,
      member: populated.members.find((m) => m.userId._id?.toString() === newMemberId),
    });

    return populated;
  }

  // Remove member from conversation
  static async removeMember(
    conversationId: string,
    userId: string,
    memberIdToRemove: string
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: { $ne: 'dm' },
    });

    if (!conversation) {
      return null;
    }

    const userMember = conversation.members.find(
      (m) => m.userId.toString() === userId
    );
    const targetMember = conversation.members.find(
      (m) => m.userId.toString() === memberIdToRemove
    );

    // Can only remove if: owner, admin removing non-admin, or self-leaving
    const canRemove =
      userMember?.role === 'owner' ||
      (userMember?.role === 'admin' && targetMember?.role === 'member') ||
      userId === memberIdToRemove;

    if (!canRemove) {
      return null;
    }

    conversation.members = conversation.members.filter(
      (m) => m.userId.toString() !== memberIdToRemove
    );

    await conversation.save();

    // Create system message
    await Message.create({
      conversationId: conversation._id,
      senderId: new Types.ObjectId(userId),
      type: 'system',
      content: {
        systemAction: 'member_removed',
        systemData: { memberId: memberIdToRemove },
      },
    });

    emitToConversation(conversationId, 'conversation:member_removed', {
      conversationId,
      userId: memberIdToRemove,
    });

    return conversation.populate('members.userId', 'name email avatar');
  }

  // Update member role
  static async updateMemberRole(
    conversationId: string,
    userId: string,
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<IConversation | null> {
    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        'members.userId': userId,
        'members.role': 'owner',
      },
      {
        $set: { 'members.$[member].role': role },
      },
      {
        arrayFilters: [{ 'member.userId': new Types.ObjectId(memberId) }],
        new: true,
      }
    );

    return conversation?.populate('members.userId', 'name email avatar') || null;
  }

  // Mute/unmute conversation
  static async setMuted(
    conversationId: string,
    userId: string,
    muted: boolean,
    mutedUntil?: Date
  ): Promise<boolean> {
    const result = await Conversation.updateOne(
      { _id: conversationId, 'members.userId': userId },
      {
        $set: {
          'members.$.muted': muted,
          'members.$.mutedUntil': mutedUntil,
        },
      }
    );

    return result.modifiedCount > 0;
  }

  // Pin/unpin message
  static async pinMessage(
    conversationId: string,
    userId: string,
    messageId: string,
    pin: boolean
  ): Promise<boolean> {
    const updateOp = pin
      ? { $addToSet: { pinnedMessages: new Types.ObjectId(messageId) } }
      : { $pull: { pinnedMessages: new Types.ObjectId(messageId) } };

    const result = await Conversation.updateOne(
      {
        _id: conversationId,
        'members.userId': userId,
        'members.role': { $in: ['owner', 'admin'] },
      },
      updateOp
    );

    return result.modifiedCount > 0;
  }

  // Search public channels
  static async searchPublicChannels(
    query: string,
    limit = 20
  ): Promise<IConversation[]> {
    return Conversation.find({
      type: 'channel',
      isPublic: true,
      name: { $regex: query, $options: 'i' },
    })
      .limit(limit)
      .select('name description avatar members.length');
  }

  // Update last read
  static async updateLastRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await Conversation.updateOne(
      { _id: conversationId, 'members.userId': userId },
      { $set: { 'members.$.lastReadAt': new Date() } }
    );
  }
}
