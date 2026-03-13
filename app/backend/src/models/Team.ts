import mongoose, { Schema, Document } from 'mongoose';

export type TeamRole = 'owner' | 'admin' | 'member';

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: TeamRole;
  joinedAt: Date;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ITeam extends Document {
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  ownerId: mongoose.Types.ObjectId;
  members: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    avatar: String,
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [teamMemberSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate user data for members
teamSchema.virtual('members.user', {
  ref: 'User',
  localField: 'members.userId',
  foreignField: '_id',
  justOne: true,
});

export const Team = mongoose.model<ITeam>('Team', teamSchema);
