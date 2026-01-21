import { getData } from "../dataStore.js";

function authRegesterUser(username, email, password) {
    console.log(username, email, password);
    let data = getData();
    const userExists = data.users.find(
        (user) => user.email === email || user.username === username
    );
    if (userExists) { 
        return {error: "User already exists"};
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