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

export const sendApplicationStatusUpdate = async (studentEmail, companyName, jobTitle, status) => {
  const html = `
    <h2>Application Status Update</h2>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
    <p><strong>Status:</strong> ${status.replace(/_/g, ' ')}</p>
    <p>Log in to PlacementHub to view details.</p>
  `;
  await sendEmail(studentEmail, `Application Update - ${companyName}`, html);
};

export const sendOfferNotification = async (studentEmail, companyName, jobTitle, offerDetails) => {
  const ctc = offerDetails?.ctc ? `CTC: ${offerDetails.ctc}` : '';
  const joining = offerDetails?.joiningDate ? `Joining: ${new Date(offerDetails.joiningDate).toLocaleDateString()}` : '';
  const html = `
    <h2>Congratulations! Offer Received</h2>
    <p><strong>${companyName}</strong> has extended an offer for <strong>${jobTitle}</strong>.</p>
    ${ctc ? `<p>${ctc}</p>` : ''}
    ${joining ? `<p>${joining}</p>` : ''}
    <p>Log in to PlacementHub to accept or decline the offer.</p>
  `;
  await sendEmail(studentEmail, `Offer from ${companyName}`, html);
};
