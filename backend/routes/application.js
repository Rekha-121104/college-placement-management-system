import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { sendApplicationStatusUpdate, sendOfferNotification } from '../services/notificationService.js';

const router = express.Router();

router.use(protect);

// Student: Submit application
router.post('/', authorize('student'), async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const { job: jobId, coverLetter } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') return res.status(400).json({ message: 'Job not available' });
    const exists = await Application.findOne({ student: student._id, job: jobId });
    if (exists) return res.status(400).json({ message: 'Already applied' });
    const application = await Application.create({
      student: student._id,
      job: jobId,
      placementDrive: job.placementDrive,
      resume: student.resume,
      coverLetter: coverLetter || '',
      status: 'submitted',
    });
    const populated = await Application.findById(application._id)
      .populate('job', 'title type company')
      .populate('placementDrive', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student: My applications
router.get('/my', authorize('student'), async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    const apps = await Application.find({ student: student._id })
      .populate('job', 'title type company openings')
      .populate({ path: 'job', populate: { path: 'company', select: 'companyName industry logo' } })
      .populate('placementDrive', 'name status')
      .sort('-appliedAt');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Company: List applications for a job
router.get('/job/:jobId', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    const apps = await Application.find({ job: req.params.jobId })
      .populate('student', 'fullName rollNumber department cgpa skills resume')
      .populate('job', 'title')
      .sort('-appliedAt');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (company)
router.patch('/:id/status', authorize('company'), async (req, res) => {
  try {
    const { status, companyFeedback, hiringDecision, offerDetails } = req.body;
    const app = await Application.findById(req.params.id).populate('job').populate('student');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    const company = await CompanyProfile.findOne({ user: req.user._id });
    if (app.job.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (status) app.status = status;
    if (companyFeedback !== undefined) app.companyFeedback = companyFeedback;
    if (hiringDecision) app.hiringDecision = hiringDecision;
    if (offerDetails) app.offerDetails = offerDetails;
    app.reviewedAt = new Date();
    app.reviewedBy = req.user._id;
    await app.save();
    // Send notifications
    const studentProfile = await StudentProfile.findById(app.student._id).populate('user', 'email');
    const studentEmail = studentProfile?.user?.email;
    if (studentEmail) {
      if (status && ['shortlisted', 'rejected', 'reviewed'].includes(status)) {
        await sendApplicationStatusUpdate(studentEmail, company.companyName, app.job.title, status);
      }
      if (status === 'offer_extended') {
        await sendOfferNotification(studentEmail, company.companyName, app.job.title, offerDetails);
      }
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student: Accept/Decline offer
router.patch('/:id/offer', authorize('student'), async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const student = await StudentProfile.findOne({ user: req.user._id });
    const app = await Application.findById(req.params.id);
    if (!app || app.student.toString() !== student._id.toString()) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (action === 'accept') app.status = 'offer_accepted';
    else if (action === 'decline') app.status = 'offer_declined';
    else return res.status(400).json({ message: 'Invalid action' });
    await app.save();
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
