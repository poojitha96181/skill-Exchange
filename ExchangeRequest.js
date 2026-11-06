import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offeredSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    wantedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    message: { type: String, maxlength: 400, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

exchangeRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

export default mongoose.model('ExchangeRequest', exchangeRequestSchema);