import { createEmailProvider } from "../email/emailProviderFactory.js";

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
    const provider = createEmailProvider();

    return provider.send(message);
}
