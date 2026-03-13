import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  priority: TaskPriority;
  workflowId: string;
  dependsOn: string[];
  output?: string;
  filesChanged: string[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    workflowId: { type: String, required: true, index: true },
    dependsOn: [{ type: String }],
    output: { type: String },
    filesChanged: [{ type: String }],
  },
  { timestamps: true },
);

taskSchema.index({ status: 1, priority: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
