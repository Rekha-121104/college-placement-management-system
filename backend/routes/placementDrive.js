import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Interview from '../models/Interview.js';
import CompanyProfile from '../models/CompanyProfile.js';

const router = express.Router();

router.use(protect);

// Create placement drive (admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(drive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List all drives
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const drives = await PlacementDrive.find(filter)
      .populate('companies', 'companyName industry logo')
      .sort('-startDate');
    res.json(drives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single drive with stats
router.get('/:id', async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('companies', 'companyName industry logo contactPerson');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    const jobs = await Job.find({ placementDrive: drive._id }).populate('company', 'companyName');
    const applications = await Application.countDocuments({ placementDrive: drive._id });
    const interviews = await Interview.countDocuments({
      application: { $in: (await Application.find({ placementDrive: drive._id }).select('_id')).map(a => a._id) }
    });
    const offers = await Application.countDocuments({ placementDrive: drive._id, status: { $in: ['offer_extended', 'offer_accepted'] } });
    res.json({
      ...drive.toObject(),
      stats: { jobs: jobs.length, applications, interviews, offers },
      jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update drive (admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    res.json(drive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add company to drive (admin)
router.post('/:id/companies', authorize('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    const { companyId } = req.body;
    if (!drive.companies.includes(companyId)) {
      drive.companies.push(companyId);
      await drive.save();
    }
    const updated = await PlacementDrive.findById(drive._id).populate('companies', 'companyName');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get jobs in a drive (public for students)
router.get('/:id/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ placementDrive: req.params.id, status: 'active' })
      .populate('company', 'companyName industry logo')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
