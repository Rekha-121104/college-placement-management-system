import Interview from '../models/Interview.js';
import StudentProfile from '../models/StudentProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { sendInterviewReminder } from './notificationService.js';

/**
 * Check and send interview reminders
 * Should be called periodically (e.g., every hour via cron or setInterval)
 */
export const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find interviews scheduled in the next hour (1h reminder)
    const interviews1h = await Interview.find({
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledAt: { $gte: now, $lte: oneHourFromNow },
      'reminders.type': { $ne: 'reminder_1h' },
    }).populate('student').populate('company');

    // Find interviews scheduled in 24 hours (24h reminder)
    const interviews24h = await Interview.find({
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledAt: { $gte: oneHourFromNow, $lte: twentyFourHoursFromNow },
      'reminders.type': { $ne: 'reminder_24h' },
    }).populate('student').populate('company');

    // Send 1h reminders
    for (const interview of interviews1h) {
      const studentProfile = await StudentProfile.findById(interview.student._id).populate('user', 'email');
      if (studentProfile?.user?.email) {
        await sendInterviewReminder(
          studentProfile.user.email,
          interview.company.companyName,
          interview.scheduledAt,
          interview.meetingLink
        );
        interview.reminders.push({ sentAt: now, type: 'reminder_1h' });
        await interview.save();
      }
    }

    // Send 24h reminders
    for (const interview of interviews24h) {
      const studentProfile = await StudentProfile.findById(interview.student._id).populate('user', 'email');
      if (studentProfile?.user?.email) {
        await sendInterviewReminder(
          studentProfile.user.email,
          interview.company.companyName,
          interview.scheduledAt,
          interview.meetingLink
        );
        interview.reminders.push({ sentAt: now, type: 'reminder_24h' });
        await interview.save();
      }
    }

    console.log(`[Reminders] Sent ${interviews1h.length} 1h reminders, ${interviews24h.length} 24h reminders`);
  } catch (error) {
    console.error('[Reminders] Error:', error.message);
  }
};
