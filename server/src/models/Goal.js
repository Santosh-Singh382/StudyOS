import mongoose from 'mongoose';

export const GOAL_STATUSES = ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'];

export const GOAL_TYPES = ['SHORT_TERM', 'LONG_TERM', 'HABIT', 'SUBJECT'];

export const GOAL_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Goal requires an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [120, 'Goal title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: GOAL_TYPES,
      default: 'SHORT_TERM',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: 'ACTIVE',
    },
    priority: {
      type: String,
      enum: GOAL_PRIORITIES,
      default: 'MEDIUM',
    },
    relatedSubjects: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
      default: [],
    },
    relatedExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      default: null,
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

goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, targetDate: 1 });
goalSchema.index({ user: 1, createdAt: -1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;