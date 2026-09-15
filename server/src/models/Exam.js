import mongoose from 'mongoose';

export const EXAM_STATUSES = ['UPCOMING', 'COMPLETED', 'CANCELLED'];

export const EXAM_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Exam requires an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [120, 'Exam title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    examTime: {
      type: String,
      trim: true,
      maxlength: [20, 'Exam time cannot exceed 20 characters'],
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: EXAM_STATUSES,
      default: 'UPCOMING',
    },
    priority: {
      type: String,
      enum: EXAM_PRIORITIES,
      default: 'MEDIUM',
    },
    subjects: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
      default: [],
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

examSchema.index({ user: 1, status: 1 });
examSchema.index({ user: 1, examDate: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam;