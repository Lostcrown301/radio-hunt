export async function sendVerificationEmail(user, otp) {
    return sendAuthEmail({
        to: user.email,
        subject: "Verify your Radio Hunt account",
        text: `Use this code to verify your Radio Hunt account: ${otp}`,
    });
}

export async function sendPasswordResetEmail(user, otp) {
    return sendAuthEmail({
        to: user.email,
        subject: "Reset your Radio Hunt password",
        text: `Use this code to reset your Radio Hunt password: ${otp}`,
    });
}

async function sendAuthEmail(message) {
    if (process.env.NODE_ENV !== "production") {
        console.info(`[auth email] ${message.subject} -> ${message.to}: ${message.text}`);
    }

    return {
        accepted: true,
        provider: "console",
    };
}
