import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ['open', 'reviewed', 'resolved', 'dismissed'], default: 'open', index: true },
    adminNote: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);