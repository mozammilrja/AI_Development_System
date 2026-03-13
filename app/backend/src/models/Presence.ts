import mongoose, { Schema, Document, Types } from 'mongoose';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface IConnection {
  socketId: string;
  device: 'web' | 'mobile' | 'desktop';
  userAgent?: string;
  connectedAt: Date;
  lastActiveAt: Date;
}

export interface IPresence extends Document {
  userId: Types.ObjectId;
  status: PresenceStatus;
  customMessage?: string;
  lastSeen: Date;
  connections: IConnection[];
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    socketId: { type: String, required: true },
    device: { type: String, enum: ['web', 'mobile', 'desktop'], default: 'web' },
    userAgent: { type: String },
    connectedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const presenceSchema = new Schema<IPresence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['online', 'away', 'busy', 'offline'], default: 'offline' },
    customMessage: { type: String, maxlength: 100 },
    lastSeen: { type: Date, default: Date.now },
    connections: [connectionSchema],
  },
  { timestamps: true }
);

// Indexes
presenceSchema.index({ userId: 1 }, { unique: true });
presenceSchema.index({ status: 1 });
presenceSchema.index({ lastSeen: -1 });

// Update presence when user connects
presenceSchema.statics.connect = async function (
  userId: Types.ObjectId,
  socketId: string,
  device: 'web' | 'mobile' | 'desktop' = 'web',
  userAgent?: string
): Promise<IPresence> {
  const connection: IConnection = {
    socketId,
    device,
    userAgent,
    connectedAt: new Date(),
    lastActiveAt: new Date(),
  };

  return this.findOneAndUpdate(
    { userId },
    {
      $set: { status: 'online', lastSeen: new Date() },
      $push: { connections: connection },
    },
    { upsert: true, new: true }
  );
};

// Update presence when user disconnects
presenceSchema.statics.disconnect = async function (
  socketId: string
): Promise<IPresence | null> {
  const presence = await this.findOneAndUpdate(
    { 'connections.socketId': socketId },
    {
      $pull: { connections: { socketId } },
      $set: { lastSeen: new Date() },
    },
    { new: true }
  );

  // If no more connections, set offline
  if (presence && presence.connections.length === 0) {
    presence.status = 'offline';
    await presence.save();
  }

  return presence;
};

// Get online users from a list of user IDs
presenceSchema.statics.getOnlineUsers = async function (
  userIds: Types.ObjectId[]
): Promise<IPresence[]> {
  return this.find({
    userId: { $in: userIds },
    status: { $ne: 'offline' },
  });
};

// Update user activity (for away detection)
presenceSchema.statics.updateActivity = async function (
  userId: Types.ObjectId,
  socketId: string
): Promise<void> {
  await this.updateOne(
    { userId, 'connections.socketId': socketId },
    {
      $set: {
        'connections.$.lastActiveAt': new Date(),
        status: 'online',
        lastSeen: new Date(),
      },
    }
  );
};

// Set user status
presenceSchema.statics.setStatus = async function (
  userId: Types.ObjectId,
  status: PresenceStatus,
  customMessage?: string
): Promise<IPresence | null> {
  const update: any = { status, lastSeen: new Date() };
  if (customMessage !== undefined) {
    update.customMessage = customMessage;
  }
  return this.findOneAndUpdate({ userId }, { $set: update }, { new: true });
};

export const Presence = mongoose.model<IPresence>('Presence', presenceSchema);
