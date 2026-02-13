import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'active', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  eligibilityCriteria: {
    minCgpa: { type: Number },
    branches: [String],
    maxBacklogs: { type: Number },
    yearOfPassing: [Number]
  },
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' }],
  totalParticipants: { type: Number, default: 0 },
  interviewsConducted: { type: Number, default: 0 },
  offersMade: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('PlacementDrive', placementDriveSchema);
