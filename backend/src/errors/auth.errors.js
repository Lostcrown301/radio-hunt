export class AuthServiceError extends Error {
    constructor(message, statusCode = 400, code = "AUTH_ERROR", payload = {}) {
        super(message);
        this.name = "AuthServiceError";
        this.statusCode = statusCode;
        this.code = code;
        this.payload = payload;
    }
}
