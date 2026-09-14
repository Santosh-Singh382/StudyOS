import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subject requires an owner'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [80, 'Subject name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: null,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'],
    },
    targetHours: {
      type: Number,
      default: 0,
      min: [0, 'Target hours cannot be negative'],
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

subjectSchema.index(
  { user: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 }, name: 'unique_subject_name_per_user' }
);

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;