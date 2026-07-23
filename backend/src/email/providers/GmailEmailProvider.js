import { EmailProvider } from "./EmailProvider.js";

export class GmailEmailProvider extends EmailProvider {
    constructor({
        user = process.env.GMAIL_USER,
        appPassword = process.env.GMAIL_APP_PASSWORD,
    } = {}) {
        super();
        this.user = user;
        this.appPassword = appPassword;
    }

    async send(message) {
        if (!this.user || !this.appPassword) {
            throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are required for EMAIL_PROVIDER=gmail");
        }

        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: this.user,
                pass: this.appPassword,
            },
        });

        const result = await transporter.sendMail({
            from: message.from || this.user,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
        });

        return {
            accepted: result.accepted?.length > 0,
            provider: "gmail",
            messageId: result.messageId,
        };
    }
}
