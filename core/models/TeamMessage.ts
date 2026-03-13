import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMessage extends Document {
  workflowId: string;
  fromAgent: string;
  toAgent: string;
  content: string;
  timestamp: Date;
  createdAt: Date;
}

const teamMessageSchema = new Schema<ITeamMessage>(
  {
    workflowId: { type: String, required: true, index: true },
    fromAgent: { type: String, required: true },
    toAgent: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

teamMessageSchema.index({ workflowId: 1, timestamp: 1 });

export const TeamMessage = mongoose.model<ITeamMessage>('TeamMessage', teamMessageSchema);
