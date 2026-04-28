import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'notifications@yourdomain.com';

/**
 * Sends a single transactional email.
 * @param {string} to - recipient email address
 * @param {string} subject
 * @param {string} html - HTML email body
 * @returns {Promise<void>}
 */
export async function sendEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

/**
 * Broadcasts an email to all registered users.
 * Skips users with missing or malformed email addresses.
 * Does not throw — logs individual failures and continues.
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<void>}
 */
export async function notifyAllUsers(subject, html) {
  const { getData } = await import('../dataStore.js');
  const data = getData();
  
  for (const user of data.users) {
    if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
      console.warn(`Skipping user ${user.id} with missing or invalid email`);
      continue;
    }
    
    try {
      await sendEmail(user.email, subject, html);
    } catch (error) {
      console.error(`Failed to send broadcast email to ${user.email}:`, error);
    }
  }
}
