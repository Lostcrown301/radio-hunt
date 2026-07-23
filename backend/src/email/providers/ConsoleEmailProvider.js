import { EmailProvider } from "./EmailProvider.js";

export class ConsoleEmailProvider extends EmailProvider {
    async send(message) {
        console.info(`[auth email] ${message.subject} -> ${message.to}: ${message.text}`);

        return {
            accepted: true,
            provider: "console",
        };
    }
}
