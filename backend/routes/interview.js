import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import CompanyProfile from '../models/CompanyProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { createVideoMeeting } from '../services/videoService.js';
import { sendInterviewConfirmation, sendInterviewReminder } from '../services/notificationService.js';

const router = express.Router();

router.use(protect);

// Schedule interview (company)
router.post('/', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const { applicationId, scheduledAt, duration, type, location } = req.body;
    const application = await Application.findById(applicationId).populate('job');
    if (!application || application.job.company.toString() !== company._id.toString()) {
      return res.status(404).json({ message: 'Application not found' });
    }
    const interviewType = type || 'virtual';
    let meetingLink = null;
    let meetingId = null;
    let meetingPassword = null;
    if (interviewType === 'virtual') {
      const meeting = await createVideoMeeting(applicationId, new Date(scheduledAt), duration || 30);
      meetingLink = meeting.url;
      meetingId = meeting.meetingId;
      meetingPassword = meeting.meetingPassword;
    }
    const interview = await Interview.create({
      application: applicationId,
      company: company._id,
      student: application.student,
      job: application.job._id,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 30,
      type: interviewType,
      location: interviewType === 'in-person' ? location : null,
      meetingLink,
      meetingId,
      meetingPassword,
      status: 'scheduled',
    });
    application.status = 'interview_scheduled';
    await application.save();
    const studentProfile = await StudentProfile.findById(application.student).populate('user', 'email');
    if (studentProfile?.user?.email) {
      await sendInterviewConfirmation(studentProfile.user.email, company.companyName, scheduledAt, meetingLink, interviewType);
    }
    const populated = await Interview.findById(interview._id)
      .populate('student', 'fullName rollNumber department')
      .populate('job', 'title')
      .populate('application');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List interviews - company
router.get('/company', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    const interviews = await Interview.find({ company: company._id })
      .populate('student', 'fullName rollNumber department')
      .populate('job', 'title')
      .populate('application', 'status')
      .sort('scheduledAt');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List interviews - student
router.get('/student', authorize('student'), async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    const interviews = await Interview.find({ student: student._id })
      .populate('company', 'companyName logo')
      .populate('job', 'title type')
      .populate('application', 'status')
      .sort('scheduledAt');
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update interview (reschedule, cancel, feedback)
router.patch('/:id', authorize('company'), async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.company.toString() !== company._id.toString()) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    const { scheduledAt, status, feedback } = req.body;
    if (scheduledAt) interview.scheduledAt = new Date(scheduledAt);
    if (status) interview.status = status;
    if (feedback) {
      interview.feedback = {
        ...feedback,
        submittedBy: req.user._id,
        submittedAt: new Date(),
      };
    }
    await interview.save();
    const populated = await Interview.findById(interview._id)
      .populate('student', 'fullName rollNumber')
      .populate('job', 'title');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get meeting link (student/company)
router.get('/:id/meeting', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('company', 'companyName')
      .populate('student', 'fullName');
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    const student = req.user.role === 'student' ? await StudentProfile.findOne({ user: req.user._id }) : null;
    const company = req.user.role === 'company' ? await CompanyProfile.findOne({ user: req.user._id }) : null;
    const allowed = (student && interview.student._id.toString() === student._id.toString()) ||
      (company && interview.company._id.toString() === company._id.toString()) ||
      req.user.role === 'admin';
    if (!allowed) return res.status(403).json({ message: 'Not authorized' });
    res.json({
      meetingLink: interview.meetingLink,
      meetingId: interview.meetingId,
      scheduledAt: interview.scheduledAt,
      type: interview.type,
      company: interview.company.companyName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
