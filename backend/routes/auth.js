import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register Student
router.post('/register/student', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('rollNumber').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, fullName, department, rollNumber, branch, semester } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      email,
      password,
      role: 'student',
      profileModel: 'StudentProfile',
    });
    const profile = await StudentProfile.create({
      user: user._id,
      fullName,
      department,
      rollNumber: rollNumber || `STU${Date.now()}`,
      branch,
      semester,
    });
    user.profile = profile._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register Company
router.post('/register/company', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('companyName').trim().notEmpty(),
  body('contactPerson').trim().notEmpty(),
  body('contactEmail').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, companyName, contactPerson, contactEmail, industry, website } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      email,
      password,
      role: 'company',
      profileModel: 'CompanyProfile',
    });
    const profile = await CompanyProfile.create({
      user: user._id,
      companyName,
      contactPerson,
      contactEmail: contactEmail || email,
      industry,
      website,
    });
    user.profile = profile._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('profile');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('profile');
  res.json(user);
});

// Admin only - create admin
router.post('/admin/setup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const { email, password } = req.body;
    const user = await User.create({ email, password, role: 'admin' });
    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
