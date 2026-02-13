import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import StudentProfile from '../models/StudentProfile.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student', 'admin'));

// Get own profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const updates = ['fullName', 'department', 'branch', 'semester', 'cgpa', 'phone', 'dateOfBirth', 'address', 'skills', 'achievements', 'education'];
    updates.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload resume
router.post('/profile/resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.resume = `/uploads/resumes/${req.file.filename}`;
    await profile.save();
    res.json({ resume: profile.resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync academic records (integration point)
router.post('/profile/academic-records', async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.academicRecords = req.body.records || [];
    profile.academicRecords.forEach(r => r.syncedAt = new Date());
    await profile.save();
    res.json(profile.academicRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: list all students
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const students = await StudentProfile.find().populate('user', 'email').sort('-createdAt');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
