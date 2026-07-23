const DEFAULT_OTP_EXPIRY_MINUTES = 10;

function parseBoolean(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }

    return String(value).trim().toLowerCase() === "true";
}

function parsePositiveInteger(value, defaultValue) {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultValue;
    }

    return parsed;
}

export function getEmailVerificationConfig() {
    const enabled = parseBoolean(process.env.EMAIL_VERIFICATION_ENABLED, true);
    const provider = process.env.EMAIL_PROVIDER || (process.env.NODE_ENV === "production" ? "gmail" : "console");
    const otpExpiryMinutes = parsePositiveInteger(
        process.env.OTP_EXPIRY_MINUTES,
        DEFAULT_OTP_EXPIRY_MINUTES,
    );

    return {
        enabled,
        provider,
        otpExpiryMinutes,
        otpTtlSeconds: otpExpiryMinutes * 60,
    };
}

export function isEmailVerificationEnabled() {
    return getEmailVerificationConfig().enabled;
}
