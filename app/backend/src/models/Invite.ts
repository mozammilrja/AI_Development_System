import mongoose, { Schema, Document } from 'mongoose';
import type { TeamRole } from './Team.js';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface IInvite extends Document {
  teamId: mongoose.Types.ObjectId;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for team data
inviteSchema.virtual('team', {
  ref: 'Team',
  localField: 'teamId',
  foreignField: '_id',
  justOne: true,
});

// Index for querying invites
inviteSchema.index({ teamId: 1, email: 1, status: 1 });
inviteSchema.index({ email: 1, status: 1, expiresAt: 1 });

export const Invite = mongoose.model<IInvite>('Invite', inviteSchema);
