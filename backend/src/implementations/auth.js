import { getData } from "../dataStore.js";
import { validateEmail, validateUsername, validatePasswordStrength } from "../validation.js";

/**
 * 
 * @param {*} username 
 * @param {*} email 
 * @param {*} password 
 * @returns  
 */
function authRegisterUser(username, email, password) {
    // console.log(username, email, password);
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
    const newUser = {
        id: ++data.totalusersevercreated,
        username,
        email,
        password
    };
    data.users.push(newUser);
    return {newUser};
}
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
    };
}

export {
    authRegisterUser,
    authLoginUser,
};