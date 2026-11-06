import mongoose from 'mongoose';

export const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Design',
  'Languages',
  'Music',
  'Academics',
  'Business',
  'Photography',
  'Other',
];

const skillSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Skill name is required'], trim: true, maxlength: 60 },
    category: { type: String, enum: SKILL_CATEGORIES, required: true },
    type: { type: String, enum: ['offer', 'want'], required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    description: { type: String, maxlength: 400, default: '' },
  },
  { timestamps: true }
);

skillSchema.index({ owner: 1, name: 1, type: 1 }, { unique: true });
skillSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Skill', skillSchema);