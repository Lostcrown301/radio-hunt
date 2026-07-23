import argon2 from "argon2";

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
};

export async function hashPassword(password) {
    return await argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hashedPassword, password) {
    try {
        return await argon2.verify(hashedPassword, password);
    }
    catch {
        return false;
    }
}

// future improvement : adding password strength check