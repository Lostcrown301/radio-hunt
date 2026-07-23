/*
Purpose:
Protects routes that require an authenticated user.

Should contain:
- Reading authentication credentials from requests
- Calling token verification utilities
- Attaching authenticated user context to the request

Should NOT contain:
- Login or registration logic
- Database write operations
- Password hashing
- Controller response workflows except middleware errors
*/

import { AuthServiceError } from "../errors/auth.errors.js";
import { findUserById } from "../repositories/auth.repository.js";
import { verifyAccessToken } from "../utils/jwt.js";

function getBearerToken(req) {
    const authorizationHeader = req.get("authorization");

    if (!authorizationHeader?.startsWith("Bearer ")) {
        return null;
    }

    return authorizationHeader.slice("Bearer ".length).trim();
}

export async function requireAuth(req, res, next) {
    const token = getBearerToken(req);

    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
            code: "AUTHENTICATION_REQUIRED",
        });
    }

    try {
        const payload = verifyAccessToken(token);
        const user = await findUserById(payload.sub);

        if (!user) {
            throw new AuthServiceError("Authenticated user not found", 401, "AUTHENTICATED_USER_NOT_FOUND");
        }

        const { passwordHash, ...safeUser } = user;
        req.user = safeUser;

        return next();
    }
    catch (error) {
        if (error instanceof AuthServiceError) {
            return res.status(error.statusCode).json({
                message: error.message,
                code: error.code,
            });
        }

        return res.status(401).json({
            message: "Invalid or expired access token",
            code: "INVALID_ACCESS_TOKEN",
        });
    }
}
