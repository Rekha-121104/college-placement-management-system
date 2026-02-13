import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER) {
    console.log('[Email] Would send:', subject, 'to', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (e) {
    console.warn('Email send failed:', e.message);
  }
};

export const sendInterviewConfirmation = async (studentEmail, companyName, scheduledAt, meetingLink, type) => {
  const date = new Date(scheduledAt).toLocaleString();
  const html = `
    <h2>Interview Confirmation</h2>
    <p>Your interview with <strong>${companyName}</strong> has been scheduled.</p>
    <p><strong>Date & Time:</strong> ${date}</p>
    <p><strong>Format:</strong> ${type}</p>
    ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">Join Interview</a></p>` : ''}
    <p>Please be on time. Good luck!</p>
  `;
  await sendEmail(studentEmail, `Interview Scheduled - ${companyName}`, html);
};

export const sendInterviewReminder = async (studentEmail, companyName, scheduledAt, meetingLink) => {
  const date = new Date(scheduledAt).toLocaleString();
  const html = `
    <h2>Interview Reminder</h2>
    <p>This is a reminder that your interview with <strong>${companyName}</strong> is coming up.</p>
    <p><strong>Date & Time:</strong> ${date}</p>
    ${meetingLink ? `<p><a href="${meetingLink}">Join Interview</a></p>` : ''}
  `;
  await sendEmail(studentEmail, `Reminder: Interview - ${companyName}`, html);
};
