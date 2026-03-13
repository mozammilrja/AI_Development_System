import mongoose, { Schema, Document, Types } from 'mongoose';

export type KeyType = 'identity' | 'signed_prekey' | 'one_time_prekey' | 'session';

export interface IEncryptionKey extends Document {
  userId: Types.ObjectId;
  conversationId?: Types.ObjectId;
  type: KeyType;
  keyId: string;
  publicKey: string;
  encryptedPrivateKey?: string;
  signature?: string;
  used: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

const encryptionKeySchema = new Schema<IEncryptionKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', sparse: true },
    type: { 
      type: String, 
      enum: ['identity', 'signed_prekey', 'one_time_prekey', 'session'], 
      required: true 
    },
    keyId: { type: String, required: true },
    publicKey: { type: String, required: true },
    encryptedPrivateKey: { type: String },
    signature: { type: String },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes
encryptionKeySchema.index({ userId: 1, type: 1, keyId: 1 }, { unique: true });
encryptionKeySchema.index({ userId: 1, type: 1, used: 1 });
encryptionKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Get user's identity key
encryptionKeySchema.statics.getIdentityKey = async function (
  userId: Types.ObjectId
): Promise<IEncryptionKey | null> {
  return this.findOne({ userId, type: 'identity' });
};

// Get available one-time prekey
encryptionKeySchema.statics.getAvailablePrekey = async function (
  userId: Types.ObjectId
): Promise<IEncryptionKey | null> {
  return this.findOneAndUpdate(
    { userId, type: 'one_time_prekey', used: false },
    { $set: { used: true } },
    { new: true }
  );
};

// Check if user has enough prekeys
encryptionKeySchema.statics.countAvailablePrekeys = async function (
  userId: Types.ObjectId
): Promise<number> {
  return this.countDocuments({ userId, type: 'one_time_prekey', used: false });
};

// Upload new prekeys
encryptionKeySchema.statics.uploadPrekeys = async function (
  userId: Types.ObjectId,
  prekeys: { keyId: string; publicKey: string }[]
): Promise<void> {
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  const docs = prekeys.map((pk) => ({
    userId,
    type: 'one_time_prekey' as KeyType,
    keyId: pk.keyId,
    publicKey: pk.publicKey,
    used: false,
    expiresAt: expiry,
    createdAt: now,
  }));
  
  await this.insertMany(docs);
};

// Get session key for a conversation
encryptionKeySchema.statics.getSessionKey = async function (
  userId: Types.ObjectId,
  conversationId: Types.ObjectId
): Promise<IEncryptionKey | null> {
  return this.findOne({ userId, conversationId, type: 'session' });
};

export const EncryptionKey = mongoose.model<IEncryptionKey>('EncryptionKey', encryptionKeySchema);
