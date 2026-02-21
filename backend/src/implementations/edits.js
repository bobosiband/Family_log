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
    };
}

// edit password
function editPassword(password) {
  password = password.trim();
  if (!validatePasswordStrength(password)) {
    return 
  }
}
export { 
    editProfile,
};