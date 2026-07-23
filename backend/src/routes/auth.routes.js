/*
Purpose:
Defines authentication HTTP endpoints and connects them to controllers.

Should contain:
- Auth route paths
- Route-level middleware wiring
- Controller method references

Should NOT contain:
- Authentication business logic
- Database queries
- Password hashing
- JWT generation or verification logic
*/

import express from "express";
import {
    login,
    logout,
    logoutAll,
    refresh,
    register,
    requestPasswordResetOtp,
    resendVerification,
    resetUserPassword,
    restoreAccount,
    scheduleAccountDeletion,
    verifyEmail,
    verifyPasswordReset,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.post("/password-reset/request", requestPasswordResetOtp);
router.post("/password-reset/verify", verifyPasswordReset);
router.post("/password-reset/reset", resetUserPassword);
router.delete("/account", requireAuth, scheduleAccountDeletion);
router.post("/account/cancel-deletion", requireAuth, restoreAccount);

export default router;
