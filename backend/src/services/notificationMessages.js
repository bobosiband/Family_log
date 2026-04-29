/**
 * Sent to a new user immediately after registration.
 * @param {string} name - User's first name
 */
export function welcomeMessage(name) {
  return {
    subject: "Welcome to FamLogs 🎉",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8f4ff; border-radius: 16px;">
        <h2 style="color: #3b1060; margin-bottom: 8px;">Hey ${name}, welcome to FamLogs! 👋</h2>
        <p style="color: #5d6276; line-height: 1.7;">
          I'm Bongani — the person who built this. Really glad you're here.
          FamLogs is a place to keep family profiles, share memories, and stay connected in a way that actually feels personal.
        </p>
        <p style="color: #5d6276; line-height: 1.7;">
          Go ahead and fill out your profile whenever you're ready. No rush.
        </p>
        <a href="https://famlogs.vercel.app/profile" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #c084fc, #bf6085); color: white; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Set up your profile →
        </a>
        <p style="margin-top: 28px; color: #9ca3af; font-size: 13px;">— Bongani, FamLogs</p>
      </div>
    `
  };
}

/**
 * Sent to a user when they receive a new message.
 * @param {string} recipientName
 * @param {string} senderUsername
 */
export function newMessageNotification(recipientName, senderUsername) {
  return {
    subject: `You've got a message on FamLogs 💬`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8f4ff; border-radius: 16px;">
        <h2 style="color: #3b1060; margin-bottom: 8px;">Hey ${recipientName} 👋</h2>
        <p style="color: #5d6276; line-height: 1.7;">
          <strong>@${senderUsername}</strong> sent you a new message on FamLogs.
        </p>
        <a href="https://famlogs.vercel.app/messages" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #c084fc, #bf6085); color: white; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Check it out →
        </a>
        <p style="margin-top: 28px; color: #9ca3af; font-size: 13px;">You're receiving this because someone reached out to you on FamLogs.</p>
      </div>
    `
  };
}

/**
 * Sent when a user's profile is updated.
 * @param {string} name
 * @param {string} changeDescription - e.g. "Your bio was updated" or "Your profile picture was changed"
 */
export function profileUpdatedNotification(name, changeDescription) {
  return {
    subject: `Your FamLogs profile was updated`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8f4ff; border-radius: 16px;">
        <h2 style="color: #3b1060; margin-bottom: 8px;">Profile updated ✅</h2>
        <p style="color: #5d6276; line-height: 1.7;">
          Hey ${name}, just letting you know — <strong>${changeDescription}</strong> on your FamLogs profile.
        </p>
        <p style="color: #5d6276; line-height: 1.7;">
          If that wasn't you, please update your password straight away.
        </p>
        <a href="https://famlogs.vercel.app/profile" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #c084fc, #bf6085); color: white; border-radius: 999px; text-decoration: none; font-weight: 700;">
          View your profile →
        </a>
        <p style="margin-top: 28px; color: #9ca3af; font-size: 13px;">— FamLogs</p>
      </div>
    `
  };
}

/**
 * Sent when a user's password is changed.
 * @param {string} name
 */
export function passwordChangedNotification(name) {
  return {
    subject: `Your FamLogs password was changed`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8f4ff; border-radius: 16px;">
        <h2 style="color: #3b1060; margin-bottom: 8px;">Password changed 🔐</h2>
        <p style="color: #5d6276; line-height: 1.7;">
          Hey ${name}, your FamLogs password was just updated successfully.
        </p>
        <p style="color: #5d6276; line-height: 1.7;">
          If you didn't make this change, please contact us immediately and reset your password.
        </p>
        <a href="https://famlogs.vercel.app/profile" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #c084fc, #bf6085); color: white; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Go to your account →
        </a>
        <p style="margin-top: 28px; color: #9ca3af; font-size: 13px;">— FamLogs</p>
      </div>
    `
  };
}