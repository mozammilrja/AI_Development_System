import mongoose, { Schema, Document, Types } from 'mongoose';

export type ConversationType = 'dm' | 'group' | 'channel';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface IConversationMember {
  userId: Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
  lastReadAt: Date;
  lastReadMessageId?: Types.ObjectId;
  muted: boolean;
  mutedUntil?: Date;
  nickname?: string;
}

export interface ILastMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  content: string;
  type: string;
  timestamp: Date;
}

export interface IConversationSettings {
  encrypted: boolean;
  messageRetention?: number;
  membersCanInvite: boolean;
  slowMode?: number;
}

export interface IConversation extends Document {
  type: ConversationType;
  name?: string;
  description?: string;
  avatar?: string;
  isPublic?: boolean;
  topic?: string;
  members: IConversationMember[];
  dmParticipants?: [Types.ObjectId, Types.ObjectId];
  settings: IConversationSettings;
  lastMessage?: ILastMessage;
  pinnedMessages: Types.ObjectId[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationMemberSchema = new Schema<IConversationMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date, default: Date.now },
    lastReadMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    muted: { type: Boolean, default: false },
    mutedUntil: { type: Date },
    nickname: { type: String },
  },
  { _id: false }
);

const lastMessageSchema = new Schema<ILastMessage>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 100 },
    type: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { _id: false }
);

const conversationSettingsSchema = new Schema<IConversationSettings>(
  {
    encrypted: { type: Boolean, default: false },
    messageRetention: { type: Number },
    membersCanInvite: { type: Boolean, default: true },
    slowMode: { type: Number },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    type: { type: String, enum: ['dm', 'group', 'channel'], required: true },
    name: { type: String, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    avatar: { type: String },
    isPublic: { type: Boolean, default: false },
    topic: { type: String, maxlength: 200 },
    members: [conversationMemberSchema],
    dmParticipants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    settings: { type: conversationSettingsSchema, default: () => ({}) },
    lastMessage: lastMessageSchema,
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
conversationSchema.index({ 'members.userId': 1 });
conversationSchema.index({ dmParticipants: 1 });
conversationSchema.index({ type: 1, isPublic: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ createdAt: 1 });

// Find DM between two users
conversationSchema.statics.findDM = async function (
  userId1: Types.ObjectId,
  userId2: Types.ObjectId
): Promise<IConversation | null> {
  return this.findOne({
    type: 'dm',
    dmParticipants: { $all: [userId1, userId2] },
  });
};

// Get user's conversations sorted by last message
conversationSchema.statics.getUserConversations = async function (
  userId: Types.ObjectId,
  limit = 20,
  cursor?: string
): Promise<IConversation[]> {
  const query: any = { 'members.userId': userId };
  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }
  return this.find(query)
    .sort({ 'lastMessage.timestamp': -1, _id: -1 })
    .limit(limit)
    .populate('members.userId', 'name email avatar');
};

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
