/*
Purpose:
Defines validation rules for authentication request payloads.

Should contain:
- Registration input validation rules
- Login input validation rules
- OTP and refresh token input validation rules

Should NOT contain:
- Database queries
- Password hashing
- JWT logic
- Express route definitions
*/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateRequiredString(value, field, errors) {
    if (typeof value !== "string" || !value.trim()) {
        errors[field] = `${field} is required`;
    }
}

function validatePassword(value, field, errors) {
    if (typeof value !== "string" || value.length < 8) {
        errors[field] = `${field} must be at least 8 characters`;
    }
}

function result(errors) {
    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

export function validateRegisterPayload(payload) {
    const errors = {};

    validateRequiredString(payload.name, "name", errors);
    validateRequiredString(payload.username, "username", errors);
    validateRequiredString(payload.email, "email", errors);
    validatePassword(payload.password, "password", errors);

    if (!errors.username && !USERNAME_PATTERN.test(payload.username)) {
        errors.username = "username must be 3-32 characters and contain only letters, numbers, and underscores";
    }

    if (!errors.email && !EMAIL_PATTERN.test(payload.email)) {
        errors.email = "email must be valid";
    }

    return result(errors);
}

export function validateLoginPayload(payload) {
    const errors = {};
    const identifier = payload.identifier || payload.email || payload.username;

    validateRequiredString(identifier, "identifier", errors);
    validateRequiredString(payload.password, "password", errors);

    return result(errors);
}

export function validateOtpPayload(payload) {
    const errors = {};

    validateRequiredString(payload.userId, "userId", errors);
    validateRequiredString(payload.otp, "otp", errors);

    if (!errors.userId && !UUID_PATTERN.test(payload.userId)) {
        errors.userId = "userId must be valid";
    }

    if (!errors.otp && !/^\d{6}$/.test(payload.otp)) {
        errors.otp = "otp must be 6 digits";
    }

    return result(errors);
}

export function validateUserIdPayload(payload) {
    const errors = {};

    validateRequiredString(payload.userId, "userId", errors);

    if (!errors.userId && !UUID_PATTERN.test(payload.userId)) {
        errors.userId = "userId must be valid";
    }

    return result(errors);
}

export function validateRefreshTokenPayload(payload) {
    const errors = {};

    validateRequiredString(payload.refreshToken, "refreshToken", errors);

    return result(errors);
}

export function validatePasswordResetRequestPayload(payload) {
    const errors = {};

    validateRequiredString(payload.email, "email", errors);

    if (!errors.email && !EMAIL_PATTERN.test(payload.email)) {
        errors.email = "email must be valid";
    }

    return result(errors);
}

export function validateResetPasswordPayload(payload) {
    const errors = {};

    validateRequiredString(payload.userId, "userId", errors);
    validatePassword(payload.newPassword, "newPassword", errors);

    if (!errors.userId && !UUID_PATTERN.test(payload.userId)) {
        errors.userId = "userId must be valid";
    }

    return result(errors);
}
