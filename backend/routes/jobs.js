import express from 'express';
import { protect } from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();

// Public: list all active jobs (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { drive, type, search } = req.query;
    const filter = { status: 'active' };
    if (drive) filter.placementDrive = drive;
    if (type) filter.type = type;
    if (search) filter.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { skills: new RegExp(search, 'i') },
    ];
    const jobs = await Job.find(filter)
      .populate('company', 'companyName industry logo')
      .populate('placementDrive', 'name status')
      .sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName industry logo description website')
      .populate('placementDrive', 'name status');
    if (!job || job.status !== 'active') return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
