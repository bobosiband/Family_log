import { getData } from "../dataStore.js";

/**
 * 
 * @param {*} username 
 * @param {*} email 
 * @param {*} password 
 * @returns  
 */
function authRegisterUser(username, email, password) {
    console.log(username, email, password);
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


export {
    authRegisterUser,
};