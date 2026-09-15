import mongoose from 'mongoose';

export const MILESTONE_STATUSES = ['PENDING', 'COMPLETED'];

const milestoneSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Milestone requires an owner'],
      index: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'Milestone requires a goal'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [120, 'Milestone title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: 'PENDING',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

milestoneSchema.index({ user: 1, goal: 1, order: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;