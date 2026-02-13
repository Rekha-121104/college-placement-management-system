import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  description: { type: String },
  logo: { type: String },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('CompanyProfile', companyProfileSchema);
