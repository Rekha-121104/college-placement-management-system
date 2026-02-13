import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Interview from '../models/Interview.js';
import PlacementDrive from '../models/PlacementDrive.js';
import StudentProfile from '../models/StudentProfile.js';
import Job from '../models/Job.js';

const router = express.Router();

router.use(protect);

// Dashboard stats (admin)
router.get('/dashboard', authorize('admin'), async (req, res) => {
  try {
    const [totalStudents, totalCompanies, totalApplications, placedStudents, totalInterviews, activeDrives] = await Promise.all([
      StudentProfile.countDocuments(),
      CompanyProfile.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'offer_accepted' }),
      Interview.countDocuments({ status: 'completed' }),
      PlacementDrive.countDocuments({ status: 'active' }),
    ]);
    const recentApplications = await Application.find()
      .populate('student', 'fullName rollNumber')
      .populate('job', 'title')
      .populate({ path: 'job', populate: { path: 'company', select: 'companyName' } })
      .sort('-appliedAt')
      .limit(10)
      .lean();
    const statusBreakdown = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({
      totalStudents,
      totalCompanies,
      totalApplications,
      placedStudents,
      totalInterviews,
      activeDrives,
      placementRate: totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
      statusBreakdown,
      recentApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Placement drive performance report
router.get('/drive/:id', authorize('admin'), async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('companies', 'companyName');
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    const applications = await Application.find({ placementDrive: drive._id });
    const interviews = await Interview.find({
      application: { $in: applications.map(a => a._id) },
    });
    const statusCounts = {};
    applications.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    res.json({
      drive,
      totalApplications: applications.length,
      totalInterviews: interviews.length,
      offersMade: statusCounts.offer_extended + statusCounts.offer_accepted || 0,
      offersAccepted: statusCounts.offer_accepted || 0,
      statusBreakdown: statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export data (CSV-ready JSON)
router.get('/export/applications', authorize('admin'), async (req, res) => {
  try {
    const { driveId, startDate, endDate } = req.query;
    const filter = {};
    if (driveId) filter.placementDrive = driveId;
    if (startDate) filter.appliedAt = { $gte: new Date(startDate) };
    if (endDate) filter.appliedAt = { ...filter.appliedAt, $lte: new Date(endDate) };
    const applications = await Application.find(filter)
      .populate('student', 'fullName rollNumber department cgpa')
      .populate('job', 'title')
      .populate({ path: 'job', populate: { path: 'company', select: 'companyName' } })
      .lean();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics - trends over time
router.get('/analytics/trends', authorize('admin'), async (req, res) => {
  try {
    const applicationsByMonth = await Application.aggregate([
      { $match: { appliedAt: { $exists: true } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$appliedAt' } },
        count: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$status', 'offer_accepted'] }, 1, 0] } },
      }},
      { $sort: { _id: 1 } },
    ]);
    const placementByDepartment = await Application.aggregate([
      { $match: { status: 'offer_accepted' } },
      { $lookup: { from: 'studentprofiles', localField: 'student', foreignField: '_id', as: 'std' } },
      { $unwind: '$std' },
      { $group: { _id: '$std.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ applicationsByMonth, placementByDepartment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
