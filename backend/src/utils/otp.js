import crypto from "node:crypto";

const DEFAULT_OTP_LENGTH = 6;

export const EMAIL_VERIFICATION_OTP_TTL_SECONDS = 10 * 60;
export const PASSWORD_RESET_OTP_TTL_SECONDS = 10 * 60;
export const PASSWORD_RESET_VERIFIED_TTL_SECONDS = 15 * 60;
export const VERIFICATION_OTP_RESEND_COOLDOWN_SECONDS = 60;

function getOtpSecret() {
    return process.env.OTP_SECRET || process.env.JWT_SECRET || "radio-hunt-local-otp-secret";
}

export function generateOtp(length = DEFAULT_OTP_LENGTH) {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;

    return String(crypto.randomInt(min, max + 1));
}

export function hashOtp(otp) {
    return crypto
        .createHmac("sha256", getOtpSecret())
        .update(String(otp))
        .digest("hex");
}

export function verifyOtp(otp, otpHash) {
    const incomingHash = hashOtp(otp);
    const incomingBuffer = Buffer.from(incomingHash, "hex");
    const storedBuffer = Buffer.from(otpHash, "hex");

    if (incomingBuffer.length !== storedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(incomingBuffer, storedBuffer);
}
