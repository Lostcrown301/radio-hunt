import { getEmailVerificationConfig } from "../config/emailVerification.js";
import { ConsoleEmailProvider } from "./providers/ConsoleEmailProvider.js";
import { GmailEmailProvider } from "./providers/GmailEmailProvider.js";

export function createEmailProvider(providerName = getEmailVerificationConfig().provider) {
    switch (providerName) {
        case "console":
            return new ConsoleEmailProvider();
        case "gmail":
            return new GmailEmailProvider();
        default:
            throw new Error(`Unsupported EMAIL_PROVIDER: ${providerName}`);
    }
}
