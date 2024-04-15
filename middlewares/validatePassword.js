function validatePassword(password) {
    const minLength = 8;
    const containsNumber = /\d/; // Checks if the password contains at least one number
    const containsLetter = /[a-zA-Z]/; // Checks if the password contains at least one letter

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }
    if (!containsNumber.test(password)) {
        return 'Password must contain at least one number';
    }
    if (!containsLetter.test(password)) {
        return 'Password must contain at least one letter';
    }
    return null;
}
exports.validatePassword = validatePassword;
