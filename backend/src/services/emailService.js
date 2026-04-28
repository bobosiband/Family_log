import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const GMAIL_USER = process.env.GMAIL_USER || process.env.EMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '';
const RESEND_FROM = process.env.RESEND_FROM || 'notifications@yourdomain.com';
const MAIL_FROM = process.env.EMAIL_FROM || GMAIL_USER || RESEND_FROM;

function getGmailTransport() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  try {
    return new Resend(key);
  } catch (err) {
    console.error('[emailService] Invalid RESEND_API_KEY', err);
    return null;
  }
}

/**
 * Sends a single transactional email if the Resend client is configured.
 */
export async function sendEmail(to, subject, html) {
  const gmailTransport = getGmailTransport();
  if (gmailTransport) {
    try {
      await gmailTransport.sendMail({
        from: MAIL_FROM,
        to,
        subject,
        html,
      });
      return;
    } catch (err) {
      console.error('[emailService] Failed to send Gmail email to', to, err);
      return;
    }
  }

  const resend = getResendClient();
  if (!resend) return; // skip silently if no provider is configured

  try {
    await resend.emails.send({ from: MAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('[emailService] Failed to send email to', to, err);
  }
}

/**
 * Broadcast an email to all users. Skips invalid/missing addresses and logs failures.
 */
export async function notifyAllUsers(subject, html) {
  const gmailTransport = getGmailTransport();
  const resend = gmailTransport ? null : getResendClient();
  if (!gmailTransport && !resend) return;

  const { getData } = await import('../dataStore.js');
  const data = getData();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const user of data.users) {
    if (!user.email || !emailRegex.test(String(user.email).trim())) continue;
    try {
      if (gmailTransport) {
        await gmailTransport.sendMail({
          from: MAIL_FROM,
          to: user.email,
          subject,
          html,
        });
      } else {
        await resend.emails.send({ from: MAIL_FROM, to: user.email, subject, html });
      }
    } catch (err) {
      console.error('[emailService] Failed to send to', user.email, err);
    }
  }
}
