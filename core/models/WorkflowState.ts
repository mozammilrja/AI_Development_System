import mongoose, { Schema, Document } from 'mongoose';

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type WorkflowType = 'development' | 'debug' | 'review' | 'release' | 'research' | 'ui_testing';

export interface IWorkflowState extends Document {
  type: WorkflowType;
  status: WorkflowStatus;
  teamName: string;
  tasks: string[];
  context: Record<string, unknown>;
  request: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workflowStateSchema = new Schema<IWorkflowState>(
  {
    type: {
      type: String,
      enum: ['development', 'debug', 'review', 'release', 'research', 'ui_testing'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    teamName: { type: String, required: true },
    tasks: [{ type: String }],
    context: { type: Schema.Types.Mixed, default: {} },
    request: { type: String, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

workflowStateSchema.index({ status: 1, type: 1 });
workflowStateSchema.index({ startedAt: -1 });

export const WorkflowState = mongoose.model<IWorkflowState>('WorkflowState', workflowStateSchema);
