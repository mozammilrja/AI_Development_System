import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentRun extends Document {
  taskId: string;
  agentName: string;
  status: 'completed' | 'failed';
  output: string | null;
  filesChanged: string[];
  tokenUsage: { input: number; output: number };
  error?: string;
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

const agentRunSchema = new Schema<IAgentRun>(
  {
    taskId: { type: String, required: true, index: true },
    agentName: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      required: true,
    },
    output: { type: String, default: null },
    filesChanged: [{ type: String }],
    tokenUsage: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    error: { type: String },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

agentRunSchema.index({ agentName: 1, startedAt: -1 });

export const AgentRun = mongoose.model<IAgentRun>('AgentRun', agentRunSchema);
