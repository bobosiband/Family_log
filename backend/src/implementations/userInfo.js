import { getData } from "../dataStore.js";
import { sanitizeUser } from "../utils/sanitize.js";

function getUserInfo() {
  let data = getData();
  return data.users.map(sanitizeUser);
}

export { getUserInfo };