import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = express.Router();

// ============ ACADEMIC RECORDS INTEGRATION ============

// Student: Sync academic records (manual - from external system data)
router.post('/academic-records/sync', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const { records } = req.body; // Array of { semester, subjects, sgpa, cgpa }
    if (!Array.isArray(records)) return res.status(400).json({ message: 'records must be an array' });
    profile.academicRecords = records.map((r) => ({
      ...r,
      syncedAt: new Date(),
    }));
    profile.cgpa = records.length ? records[records.length - 1].cgpa : profile.cgpa;
    await profile.save();
    res.json({ message: 'Academic records synced', records: profile.academicRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin/Webhook: Pull academic records for a student (integration endpoint)
// External systems (ERP, LMS) can call this with API key or admin auth
router.post('/academic-records/pull/:rollNumber', protect, authorize('admin'), async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { records } = req.body;
    const profile = await StudentProfile.findOne({ rollNumber });
    if (!profile) return res.status(404).json({ message: 'Student not found' });
    if (!Array.isArray(records)) return res.status(400).json({ message: 'records must be an array' });
    profile.academicRecords = records.map((r) => ({ ...r, syncedAt: new Date() }));
    profile.cgpa = records.length ? records[records.length - 1].cgpa : profile.cgpa;
    await profile.save();
    res.json({ message: 'Records synced', student: profile.fullName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ COMPANY DATABASE INTEGRATION ============

// Admin: Import companies (JSON array)
router.post('/companies/import', protect, authorize('admin'), async (req, res) => {
  try {
    const { companies } = req.body; // Array of { companyName, contactPerson, contactEmail, industry, website, ... }
    if (!Array.isArray(companies)) return res.status(400).json({ message: 'companies must be an array' });
    const results = { imported: 0, skipped: 0, errors: [] };
    for (const c of companies) {
      try {
        const exists = await User.findOne({ email: c.contactEmail });
        if (exists) {
          results.skipped++;
          continue;
        }
        const user = await User.create({
          email: c.contactEmail,
          password: Math.random().toString(36).slice(-12) + 'Aa1!',
          role: 'company',
          profileModel: 'CompanyProfile',
        });
        await CompanyProfile.create({
          user: user._id,
          companyName: c.companyName || 'Unknown',
          contactPerson: c.contactPerson || 'Contact',
          contactEmail: c.contactEmail,
          industry: c.industry,
          website: c.website,
          description: c.description,
          verified: false,
        });
        results.imported++;
      } catch (e) {
        results.errors.push({ company: c.companyName, error: e.message });
      }
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin/Company: Export companies data
router.get('/companies/export', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    let companies;
    if (req.user.role === 'admin') {
      companies = await CompanyProfile.find().populate('user', 'email').lean();
    } else {
      const cp = await CompanyProfile.findOne({ user: req.user._id });
      companies = cp ? [await CompanyProfile.findById(cp._id).populate('user', 'email').lean()] : [];
    }
    const exportData = companies.map((c) => ({
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      contactEmail: c.contactEmail || c.user?.email,
      industry: c.industry,
      website: c.website,
      description: c.description,
      address: c.address,
      city: c.city,
      country: c.country,
      size: c.size,
      verified: c.verified,
    }));
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Export jobs
router.get('/jobs/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = companyId ? { company: companyId } : {};
    const jobs = await Job.find(filter).populate('company', 'companyName industry').populate('placementDrive', 'name').lean();
    const exportData = jobs.map((j) => ({
      title: j.title,
      type: j.type,
      company: j.company?.companyName,
      description: j.description,
      requirements: j.requirements,
      openings: j.openings,
      workMode: j.workMode,
      skills: j.skills,
      status: j.status,
      placementDrive: j.placementDrive?.name,
    }));
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
