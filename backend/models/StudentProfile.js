import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  rollNumber: { type: String, unique: true },
  department: { type: String, required: true },
  branch: { type: String },
  semester: { type: Number },
  cgpa: { type: Number },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  skills: [String],
  achievements: [{ title: String, description: String, date: Date }],
  education: [{
    institution: String,
    degree: String,
    year: String,
    marks: String
  }],
  resume: { type: String },
  photo: { type: String },
  academicRecords: [{
    semester: Number,
    subjects: [{
      name: String,
      grade: String,
      credits: Number
    }],
    sgpa: Number,
    cgpa: Number,
    syncedAt: Date
  }],
}, { timestamps: true });

export default mongoose.model('StudentProfile', studentProfileSchema);
