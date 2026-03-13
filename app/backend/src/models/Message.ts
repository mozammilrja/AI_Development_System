import mongoose, { Schema, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' | 'call';

export interface IMessageContent {
  text?: string;
  encrypted?: string;
  iv?: string;
  systemAction?: 'member_added' | 'member_removed' | 'name_changed' | 'call_started' | 'call_ended';
  systemData?: Record<string, any>;
}

export interface IMediaAttachment {
  _id: Types.ObjectId;
  type: 'image' | 'file' | 'voice' | 'video';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  blurhash?: string;
  duration?: number;
  waveform?: number[];
}

export interface ILinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface IReplyTo {
  messageId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  preview: string;
}

export interface IReaction {
  emoji: string;
  userIds: Types.ObjectId[];
  count: number;
}

export interface IMentions {
  users: Types.ObjectId[];
  everyone: boolean;
  here: boolean;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  content: IMessageContent;
  media?: IMediaAttachment[];
  linkPreviews?: ILinkPreview[];
  replyTo?: IReplyTo;
  threadRoot?: Types.ObjectId;
  threadCount?: number;
  reactions: IReaction[];
  mentions: IMentions;
  readBy: Types.ObjectId[];
  editedAt?: Date;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  encryptionVersion?: number;
  createdAt: Date;
}

const mediaAttachmentSchema = new Schema<IMediaAttachment>(
  {
    type: { type: String, enum: ['image', 'file', 'voice', 'video'], required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    thumbnail: { type: String },
    blurhash: { type: String },
    duration: { type: Number },
    waveform: [{ type: Number }],
  }
);

const linkPreviewSchema = new Schema<ILinkPreview>(
  {
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String },
    siteName: { type: String },
  },
  { _id: false }
);

const replyToSchema = new Schema<IReplyTo>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    preview: { type: String, required: true, maxlength: 100 },
  },
  { _id: false }
);

const reactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const mentionsSchema = new Schema<IMentions>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    everyone: { type: Boolean, default: false },
    here: { type: Boolean, default: false },
  },
  { _id: false }
);

const messageContentSchema = new Schema<IMessageContent>(
  {
    text: { type: String, maxlength: 4000 },
    encrypted: { type: String },
    iv: { type: String },
    systemAction: {
      type: String,
      enum: ['member_added', 'member_removed', 'name_changed', 'call_started', 'call_ended'],
    },
    systemData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'video', 'system', 'call'],
      default: 'text',
    },
    content: { type: messageContentSchema, required: true },
    media: [mediaAttachmentSchema],
    linkPreviews: [linkPreviewSchema],
    replyTo: replyToSchema,
    threadRoot: { type: Schema.Types.ObjectId, ref: 'Message' },
    threadCount: { type: Number, default: 0 },
    reactions: [reactionSchema],
    mentions: { type: mentionsSchema, default: () => ({ users: [], everyone: false, here: false }) },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    editedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    encryptionVersion: { type: Number },
  },
  { timestamps: true }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, _id: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ 'replyTo.messageId': 1 });
messageSchema.index({ threadRoot: 1, createdAt: 1 });
messageSchema.index({ 'mentions.users': 1, createdAt: -1 });

// Get messages for a conversation with cursor pagination
messageSchema.statics.getConversationMessages = async function (
  conversationId: Types.ObjectId,
  limit = 50,
  cursor?: string
): Promise<IMessage[]> {
  const query: any = { conversationId, deletedAt: null };
  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }
  return this.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .populate('senderId', 'name email avatar');
};

// Get thread messages
messageSchema.statics.getThreadMessages = async function (
  threadRootId: Types.ObjectId,
  limit = 50,
  cursor?: string
): Promise<IMessage[]> {
  const query: any = { threadRoot: threadRootId, deletedAt: null };
  if (cursor) {
    query._id = { $gt: new mongoose.Types.ObjectId(cursor) };
  }
  return this.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .populate('senderId', 'name email avatar');
};

export const Message = mongoose.model<IMessage>('Message', messageSchema);
