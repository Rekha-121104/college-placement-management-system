import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import companyRoutes from './routes/company.js';
import applicationRoutes from './routes/application.js';
import interviewRoutes from './routes/interview.js';
import placementDriveRoutes from './routes/placementDrive.js';
import jobsRoutes from './routes/jobs.js';
import reportRoutes from './routes/reports.js';
import integrationRoutes from './routes/integrations.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/placement-drives', placementDriveRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/integrations', integrationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
