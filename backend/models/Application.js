import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
  resume: { type: String },
  coverLetter: { type: String },
  status: { 
    type: String, 
    enum: ['submitted', 'reviewed', 'shortlisted', 'rejected', 'interview_scheduled', 'offer_extended', 'offer_accepted', 'offer_declined'],
    default: 'submitted'
  },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyFeedback: { type: String },
  hiringDecision: { type: String, enum: ['selected', 'rejected', 'on_hold'] },
  offerDetails: {
    ctc: Number,
    joiningDate: Date,
    validUntil: Date
  },
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
