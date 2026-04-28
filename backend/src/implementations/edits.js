import bcrypt from "bcrypt";
import { getData } from '../dataStore.js';
import { validateEmail, validatePasswordStrength, validateUsername } from '../validation.js';

function editProfile(userId, newName, newSurname, newUsername, newBio, newEmail) {
  newName = newName.trim();
  newSurname = newSurname.trim();
  newUsername = newUsername.trim();
  newEmail = newEmail.trim();
  if (newName.length === 0) {
    return {
      error: "invalid name",
      message: "name cannot be empty"
    }
  }
  if (newSurname.length === 0) {
    return {
      error: "invalid surname",
      message: "surname cannot be empty"
    }
  }
  if (!validateUsername(newUsername)) {
    return {
      error: "invalid username",
      message: "username must be alphanumeric and between 3 and 30 characters"
    }
  }
  if (!validateEmail(newEmail)) {
    return {
      error: "invalid email",
      message: "email is not in the correct format)"
    }
  }
  let data = getData();
  // console.log({userId, newName, newSurname, newUsername, newBio, newEmail});
  const user = data.users.find((u) => u.id === userId);
  
  if (!user) {
      return {
        error: "user not found",
        message: "no user with that id exists",
      };
  }
  const userExists = data.users.find(
      (user) => (user.email === newEmail || user.username === newUsername) && user.id !== userId
  );
  console.log(userExists);
  if (userExists) {
      return {
        error: "invalid credentials",
        message: "user with that email or username already exits",
      };
  }

  user.name = newName;
  user.surname = newSurname;
  user.username = newUsername;
  user.bio = newBio;
  user.email = newEmail;
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    surname: user.surname,
    bio: user.bio,
    profilePictureUrl: user.profilePictureUrl,
    memberSince: user.memberSince,
  };
}

// edit password
/**
 * Changes user password with bcrypt verification and hashing.
 * @param {number} userId 
 * @param {string} newPassword 
 * @param {string} currentPassword 
 * @returns {Promise<{id: number, username: string, email: string, name: string, surname: string, bio: string, profilePictureUrl: string} | {error: string, message: string}>}
 */
async function editPassword(userId, newPassword, currentPassword) {
  console.log(newPassword, currentPassword, userId);
  let data = getData();
  const user = data.users.find((u) => u.id === userId);

  if (!user) {
    return {
      error: "user not found",
      message: "no user with that id exists",
    };
  }

  // Verify current password with bcrypt
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return {
      error: "wrong password",
      message: "incorrrect password",
    };
  }
  
  // Check if new password was used before
  let usedBefore = false;
  if (user.passwordHistory && Array.isArray(user.passwordHistory)) {
    for (const hashedPassword of user.passwordHistory) {
      const match = await bcrypt.compare(newPassword, hashedPassword);
      if (match) {
        usedBefore = true;
        break;
      }
    }
  }
  
  if (usedBefore) {
    return {
      error: "used password",
      message: "use a different password from before",
    };
  }
  
  if (!validatePasswordStrength(newPassword)) {
    return {
      error: "weak password",
      message: "password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and two special characters"
    };
  }
  
  // Hash and save new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.passwordHistory.push(hashedPassword);
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    surname: user.surname,
    bio: user.bio,
    profilePictureUrl: user.profilePictureUrl,
    memberSince: user.memberSince,
  };
}


export { 
  editProfile,
  editPassword,
};
