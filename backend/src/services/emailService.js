import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM || 'notifications@yourdomain.com';

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
  const resend = getResendClient();
  if (!resend) return; // skip silently if key not configured

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[emailService] Failed to send email to', to, err);
  }
}

/**
 * Broadcast an email to all users. Skips invalid/missing addresses and logs failures.
 */
export async function notifyAllUsers(subject, html) {
  const resend = getResendClient();
  if (!resend) return;

  const { getData } = await import('../dataStore.js');
  const data = getData();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const user of data.users) {
    if (!user.email || !emailRegex.test(String(user.email).trim())) continue;
    try {
      await resend.emails.send({ from: FROM, to: user.email, subject, html });
    } catch (err) {
      console.error('[emailService] Failed to send to', user.email, err);
    }
  }
}
