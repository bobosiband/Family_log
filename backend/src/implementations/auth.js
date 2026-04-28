import bcrypt from "bcrypt";
import { getData } from "../dataStore.js";
import { validateEmail, validateUsername, validatePasswordStrength } from "../validation.js";

/**
 * Registers a new user with hashed password.
 * @param {string} name 
 * @param {string} surname 
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{newUser: object} | {error: string, message: string}>}
 */
async function authRegisterUser(name = "", surname = "", username = "", email = "", password = "") {
    // console.log(username, email, password);
  name = typeof name === "string" ? name.trim() : "";
  surname = typeof surname === "string" ? surname.trim() : "";
  username = typeof username === "string" ? username.trim() : "";
  email = typeof email === "string" ? email.trim() : "";
  password = typeof password === "string" ? password.trim() : "";
    if (name.length === 0) {
      return {
        error: "invalid name",
        message: "name cannot be empty"
      }
    }
    if (surname.length === 0) {
      return {
        error: "invalid surname",
        message: "surname cannot be empty"
      }
    }
    if (!validateUsername(username)) {
      return {
        error: "invalid username",
        message: "username must be alphanumeric and between 3 and 30 characters"
      }
    }
    if (!validateEmail(email)) {
      return {
        error: "invalid email",
        message: "email is not in the correct format)"
      }
    }
    if (!validatePasswordStrength(password)) {
      return {
        error: "weak password",
        message: "password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and two special characters"
      }
    }
    let data = getData();
    const userExists = data.users.find(
        (user) => user.email === email || user.username === username
    );
    if (userExists) {
      return {
        error: "invalid credentials",
        message: "user with that email or username already exits",
      };
    }
    const bio = "";
    const profilePictureUrl = "/uploads/profilePictures/default.png";
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordHistory = [hashedPassword];
    
    const newUser = {
      id: ++data.totalusersevercreated,
      name,
      surname,
      username,
      email,
      password: hashedPassword,
      bio,
      profilePictureUrl,
      memberSince: new Date().toISOString(),
      passwordHistory,
    };
    data.users.push(newUser);
    return {newUser};
}
// console.log(authRegisterUser("bongani", "bobo@gmail.com", "passwordis123@1"));
// console.log(authRegisterUser("bongani", "bobo@gmail.com", "password123@1"));

/**
 * Authenticates a user with bcrypt password comparison.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{id: number, username: string, email: string, name: string, surname: string, bio: string, profilePictureUrl: string} | {error: string, message: string}>}
 */
async function authLoginUser(username, password) {
    let data = getData();
    const user = data.users.find((user) => user.username === username);
    
    if (!user) {
      return {
        error: "invalid credentials",
        message: "incorrrect username or password",
      }
    }
    
    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return {
        error: "invalid credentials",
        message: "incorrrect username or password",
      }
    }

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
    authRegisterUser,
    authLoginUser,
};