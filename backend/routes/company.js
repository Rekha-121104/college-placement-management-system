import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Job from '../models/Job.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(protect);

// Get company profile
router.get('/profile', authorize('company', 'admin'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update company profile
router.put('/profile', authorize('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const updates = ['companyName', 'industry', 'website', 'description', 'contactPerson', 'contactEmail', 'contactPhone', 'address', 'city', 'country', 'size'];
    updates.forEach(f => { if (req.body[f] !== undefined) profile[f] = req.body[f]; });
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job
router.post('/jobs', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const job = await Job.create({ ...req.body, company: company._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List company jobs
router.get('/jobs', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const jobs = await Job.find({ company: company._id }).populate('placementDrive', 'name status').sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update job
router.put('/jobs/:id', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    const job = await Job.findOne({ _id: req.params.id, company: company._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: list all companies (for admin/students)
router.get('/', async (req, res) => {
  try {
    const companies = await CompanyProfile.find({ verified: true }).select('-__v').sort('companyName');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
