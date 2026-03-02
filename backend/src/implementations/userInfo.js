import { getData } from "../dataStore.js";

function getUserInfo() {
    let data = getData();
    // filter out password and password history
    const users = data.users.map(({ password, passwordHistory, ...rest }) => rest);
    return users;
}

export { getUserInfo };