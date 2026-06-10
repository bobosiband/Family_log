function validatePasswordStrength(password) {
    password = typeof password === "string" ? password.trim() : "";
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
    // check for at least two special characters
    const specialchars = password.match(/[^A-Za-z0-9]/g) || [];
    if (specialchars.length < 2) {
        return false;
    }
    return true;
}

function validateEmail(email) {
    const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailregex.test(email);
}

function validateUsername(username) {
    const usernameregex = /^[a-zA-Z0-9]{3,30}$/;
    return usernameregex.test(username.trim());
}

export {
    validateEmail,
    validatePasswordStrength,
    validateUsername,
}
