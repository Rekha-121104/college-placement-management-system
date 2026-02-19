# Complete Setup Guide - College Placement Management System

## Prerequisites

1. **Node.js** 18+ installed
2. **MongoDB** running locally OR MongoDB Atlas account
3. **Git** (optional, for cloning)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd "d:\college placement"
npm run install:all
```

This installs dependencies for root, backend, and frontend.

### 2. Configure MongoDB

**Option A: Local MongoDB**
- Ensure MongoDB is running on `mongodb://localhost:27017`
- Update `.env` with: `MONGODB_URI=mongodb://localhost:27017/college_placement`

**Option B: MongoDB Atlas**
- Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/college_placement`)
- Update `.env` with your connection string

### 3. Configure Backend Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college_placement
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Video Interview (Optional - Daily.co)
DAILY_API_KEY=your_daily_api_key
DAILY_API_URL=https://api.daily.co/v1
```

**Email Setup (Gmail):**
1. Enable 2-factor authentication
2. Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASS`

**Daily.co Setup (Optional):**
1. Sign up at [daily.co](https://dashboard.daily.co/)
2. Get API key from dashboard
3. Add to `.env`

### 4. Start the Application

**Development Mode (Both servers):**
```bash
npm run dev
```

**Or separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### 6. Create First Admin User

```bash
curl -X POST http://localhost:5000/api/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@college.edu\",\"password\":\"admin123\"}"
```

Or use Postman/Insomnia:
- Method: POST
- URL: `http://localhost:5000/api/auth/admin/setup`
- Body (JSON):
```json
{
  "email": "admin@college.edu",
  "password": "admin123"
}
```

### 7. Register Users

1. **Student:** Go to http://localhost:3000/register → Select "Student" tab
2. **Company:** Go to http://localhost:3000/register → Select "Company" tab
3. **Admin:** Use the API endpoint above (only first admin)

## Features Verification

### ✅ Student Features
- [ ] Register and login
- [ ] Complete profile (add skills, upload resume)
- [ ] Browse jobs
- [ ] Apply to jobs with cover letter
- [ ] View application status
- [ ] View interview schedule
- [ ] Join video interview
- [ ] Accept/decline offers
- [ ] Sync academic records

### ✅ Company Features
- [ ] Register and login
- [ ] Complete company profile
- [ ] Post jobs
- [ ] Review applications
- [ ] Shortlist/reject candidates
- [ ] Schedule interviews
- [ ] Extend offers with CTC
- [ ] View scheduled interviews

### ✅ Admin Features
- [ ] Login
- [ ] View dashboard metrics
- [ ] Create placement drives
- [ ] Add companies to drives
- [ ] View reports and analytics
- [ ] Import/export companies
- [ ] Export jobs

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- Check firewall/network settings

### Port Already in Use
- Change `PORT` in `backend/.env`
- Or kill process using port: `netstat -ano | findstr :5000`

### Email Not Sending
- Check SMTP credentials
- Verify app password (Gmail)
- Check spam folder
- System logs emails to console if SMTP not configured

### Video Interviews Not Working
- Jitsi Meet works without setup
- For Daily.co, verify API key in `.env`
- Check browser console for errors

### Frontend Not Loading
- Ensure backend is running first
- Check `vite.config.js` proxy settings
- Clear browser cache

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Environment Variables
Set production values:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production MongoDB URI
- SMTP credentials

### Start Production Server
```bash
cd backend
npm start
```

## Support

For issues or questions:
1. Check `FEATURES_CHECKLIST.md` for feature list
2. Review API endpoints in `README.md`
3. Check server logs for errors
