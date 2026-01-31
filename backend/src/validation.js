// import { getData } from './dataStore.js';

function validatePasswordStrength(password) {
    password.trim();
    if (password.length < 8) {
        return false;
    }
    // check for at least one uppercase and one lowercase letter 
    const hasuppercase = /[A-Z]/.test(password);
    const haslowercase = /[a-z]/.test(password);
    if (!haslowercase || !hasuppercase) {
        return false;
    }
    // check for nums 
    const hasnumber = /[0-9]/.test(password);
    if (!hasnumber) {
        return false;
    }
   
    // check for special chars at least 2
    const specialchars =  password.match(/[^A-Za-z0-9]/g) || [];
    // console.log(specialchars);
    if (specialchars.length < 1) {
        return false;
    }
    return true;
}

// console.log(validatePasswordStrength("Password12@1!#"));
 function validateEmail(email) {
    // simple email regex 
    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailregex.test(email);
}

function validateUsername(username) {
    // username must be alphanumeric and between 3 and 30 characters
    const usernameregex = /^[a-zA-Z0-9]{3,30}$/;
    return usernameregex.test(username.trim());
}
// console.log(validateEmail("bobosibanda35gail.com"));

// console.log(validateUsername("bs1 "));

export {
    validateEmail,
    validatePasswordStrength,
    validateUsername,
}