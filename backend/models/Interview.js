import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  round: { type: Number, default: 1 },
  type: { type: String, enum: ['in-person', 'virtual', 'phone'], default: 'virtual' },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // minutes
  location: { type: String },
  meetingLink: { type: String },
  meetingId: { type: String },
  meetingPassword: { type: String },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled'
  },
  feedback: {
    rating: Number,
    notes: String,
    recommendation: { type: String, enum: ['hire', 'reject', 'next_round'] },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date
  },
  reminders: [{
    sentAt: Date,
    type: { type: String, enum: ['confirmation', 'reminder_24h', 'reminder_1h'] }
  }],
}, { timestamps: true });

export default mongoose.model('Interview', interviewSchema);
