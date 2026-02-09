import { getData } from "../dataStore.js";
import { validateEmail, validateUsername, validatePasswordStrength } from "../validation.js";

/**
 * 
 * @param {*} username 
 * @param {*} email 
 * @param {*} password 
 * @returns  
 */
function authRegisterUser(name, surname, username, email, password) {
    // console.log(username, email, password);
    name = name.trim();
    surname = surname.trim();
    username = username.trim();
    email = email.trim();
    password = password.trim();
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
    const newUser = {
        id: ++data.totalusersevercreated,
        name,
        surname,
        username,
        email,
        password,
        bio,
        profilePictureUrl,
    };
    data.users.push(newUser);
    return {newUser};
}
// console.log(authRegisterUser("bongani", "bobo@gmail.com", "passwordis123@1"));
// console.log(authRegisterUser("bongani", "bobo@gmail.com", "password123@1"));
function authLoginUser(username, password) {
    let data = getData();
    const user = data.users.find( (user) => user.username === username && user.password === password);
    if (!user) {
        return {
            error: "invalid credentials",
            message: "incorrrect username or password",
        }
    }
    // find user id 

    return {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        surname: user.surname,
        bio: user.bio,
        profilePictureUrl: user.profilePictureUrl,
    };
}

export {
    authRegisterUser,
    authLoginUser,
};