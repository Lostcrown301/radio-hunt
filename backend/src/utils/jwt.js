import crypto from "node:crypto";

const DEFAULT_ACCESS_TOKEN_TTL = "15m";
const DEFAULT_REFRESH_TOKEN_TTL = "30d";

function base64UrlEncode(value) {
    const source = typeof value === "string" ? value : JSON.stringify(value);

    return Buffer.from(source).toString("base64url");
}

function base64UrlDecode(value) {
    return Buffer.from(value, "base64url").toString("utf8");
}

function parseDurationMs(duration) {
    if (typeof duration === "number") {
        return duration * 1000;
    }

    const match = String(duration).trim().match(/^(\d+)([smhd])?$/i);

    if (!match) {
        throw new Error(`Invalid token duration: ${duration}`);
    }

    const amount = Number(match[1]);
    const unit = (match[2] || "s").toLowerCase();
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
}

function getTokenSecret(type) {
    const secret = type === "refresh"
        ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        : process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(`${type === "refresh" ? "JWT_REFRESH_SECRET" : "JWT_ACCESS_SECRET"} is not configured`);
    }

    return secret;
}

function signToken(payload, secret, expiresIn) {
    const header = {
        alg: "HS256",
        typ: "JWT",
    };
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = Math.floor((Date.now() + parseDurationMs(expiresIn)) / 1000);
    const body = {
        ...payload,
        iat: issuedAt,
        exp: expiresAt,
    };
    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
    const signature = crypto
        .createHmac("sha256", secret)
        .update(unsignedToken)
        .digest("base64url");

    return `${unsignedToken}.${signature}`;
}

function verifyToken(token, secret, expectedType) {
    const [encodedHeader, encodedPayload, signature] = String(token).split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
        throw new Error("Invalid token format");
    }

    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(unsignedToken)
        .digest("base64url");
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
        signatureBuffer.length !== expectedSignatureBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
        throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
    }

    if (expectedType && payload.type !== expectedType) {
        throw new Error("Invalid token type");
    }

    return payload;
}

export function getAccessTokenTtl() {
    return process.env.JWT_ACCESS_EXPIRES_IN || DEFAULT_ACCESS_TOKEN_TTL;
}

export function getRefreshTokenTtl() {
    return process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_TOKEN_TTL;
}

export function getRefreshTokenExpiresAt() {
    return new Date(Date.now() + parseDurationMs(getRefreshTokenTtl()));
}

export function generateAccessToken(user) {
    return signToken({
        sub: user.id,
        username: user.username,
        email: user.email,
        type: "access",
    }, getTokenSecret("access"), getAccessTokenTtl());
}

export function generateRefreshToken(user) {
    return signToken({
        sub: user.id,
        type: "refresh",
        tokenId: crypto.randomUUID(),
    }, getTokenSecret("refresh"), getRefreshTokenTtl());
}

export function verifyAccessToken(token) {
    return verifyToken(token, getTokenSecret("access"), "access");
}

export function verifyRefreshToken(token) {
    return verifyToken(token, getTokenSecret("refresh"), "refresh");
}

export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
