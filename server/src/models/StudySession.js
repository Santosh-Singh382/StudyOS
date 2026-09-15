import mongoose from 'mongoose';

export const STUDY_SESSION_MODES = [
  'STUDY',
  'POMODORO_FOCUS',
  'POMODORO_SHORT_BREAK',
  'POMODORO_LONG_BREAK',
];

export const STUDY_SESSION_STATUSES = ['RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED'];

const activeIntervalSchema = new mongoose.Schema(
  {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Study session requires an owner'],
      index: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    mode: {
      type: String,
      enum: STUDY_SESSION_MODES,
      default: 'STUDY',
    },
    status: {
      type: String,
      enum: STUDY_SESSION_STATUSES,
      default: 'RUNNING',
    },
    startedAt: {
      type: Date,
      required: [true, 'Study session start time is required'],
    },
    endedAt: {
      type: Date,
      default: null,
    },
    activeStartedAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    activeIntervals: {
      type: [activeIntervalSchema],
      default: [],
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    pausedSeconds: {
      type: Number,
      default: 0,
      min: [0, 'Paused duration cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

studySessionSchema.index({ user: 1, startedAt: -1 });
studySessionSchema.index({ user: 1, status: 1 });
studySessionSchema.index({ user: 1, mode: 1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;