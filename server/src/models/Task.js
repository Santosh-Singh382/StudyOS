import mongoose from 'mongoose';

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task requires an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [120, 'Task title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'TODO',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Estimated minutes cannot be negative'],
    },
    actualMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Actual minutes cannot be negative'],
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;