import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
  placementDrive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive' },
  title: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'internship', 'both'], default: 'full-time' },
  description: { type: String, required: true },
  requirements: [String],
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
    hideSalary: { type: Boolean, default: false }
  },
  locations: [String],
  workMode: { type: String, enum: ['onsite', 'remote', 'hybrid'], default: 'onsite' },
  openings: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  deadline: { type: Date },
  skills: [String],
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
