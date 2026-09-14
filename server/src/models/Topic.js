import mongoose from 'mongoose';

export const TOPIC_STATUSES = [
  'NOT_STARTED',
  'LEARNING',
  'PRACTICING',
  'TESTED',
  'COMPLETED',
  'REVISION',
  'MASTERED',
];

export const TOPIC_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const topicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Topic requires an owner'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Topic requires a subject'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      maxlength: [80, 'Topic name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: TOPIC_STATUSES,
      default: 'NOT_STARTED',
    },
    priority: {
      type: String,
      enum: TOPIC_PRIORITIES,
      default: 'MEDIUM',
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    completedHours: {
      type: Number,
      default: 0,
      min: [0, 'Completed hours cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

topicSchema.index(
  { user: 1, subject: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 }, name: 'unique_topic_name_per_subject' }
);

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;