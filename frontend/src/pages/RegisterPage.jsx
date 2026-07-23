import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiRefreshCcw, FiUserPlus } from "react-icons/fi";
import Background from "../components/background/Background";
import Logo from "../components/layout/Logo";
import {
    registerUser,
    resendVerificationOtp,
    verifyEmailOtp,
} from "../services/authService";
import styles from "./AuthPage.module.css";

function getErrorMessage(error) {
    return error.response?.data?.message || "Something went wrong. Please try again.";
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [registeredUser, setRegisteredUser] = useState(null);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const updateField = (field) => (event) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setIsSubmitting(true);

        try {
            const result = await registerUser(form);

            if (result.accessToken) {
                navigate("/game");
                return;
            }

            setRegisteredUser(result.user);
            setMessage(result.message || "Registration successful. Enter the OTP sent to your email.");
        }
        catch (err) {
            setError(getErrorMessage(err));
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        if (!registeredUser?.id) {
            return;
        }

        setError("");
        setMessage("");
        setIsVerifying(true);

        try {
            await verifyEmailOtp(registeredUser.id, otp);
            navigate("/game");
        }
        catch (err) {
            setError(getErrorMessage(err));
        }
        finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!registeredUser?.id) {
            return;
        }

        setError("");
        setMessage("");
        setIsResending(true);

        try {
            const result = await resendVerificationOtp(registeredUser.id);
            setMessage(result.message || "Verification OTP sent.");
        }
        catch (err) {
            setError(getErrorMessage(err));
        }
        finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <Background />
            <div className={styles.page}>
                <header className={styles.header}>
                    <Logo />
                </header>

                <main className={styles.main}>
                    <section className={styles.panel} aria-labelledby="register-title">
                        <div className={styles.titleRow}>
                            <span className={styles.titleIcon}>
                                <FiUserPlus />
                            </span>
                            <h2 id="register-title" className={styles.title}>
                                {registeredUser ? "Verify email" : "Create account"}
                            </h2>
                        </div>
                        <p className={styles.subtitle}>
                            {registeredUser
                                ? "Enter the six digit code from your verification email."
                                : "Save your Radio Hunt identity before chasing the next station."}
                        </p>

                        {!registeredUser ? (
                            <form className={styles.form} onSubmit={handleRegister}>
                                <label className={styles.field}>
                                    <span className={styles.label}>Name</span>
                                    <input
                                        className={styles.input}
                                        value={form.name}
                                        onChange={updateField("name")}
                                        autoComplete="name"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Username</span>
                                    <input
                                        className={styles.input}
                                        value={form.username}
                                        onChange={updateField("username")}
                                        autoComplete="username"
                                        minLength={3}
                                        maxLength={32}
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Email</span>
                                    <input
                                        className={styles.input}
                                        type="email"
                                        value={form.email}
                                        onChange={updateField("email")}
                                        autoComplete="email"
                                        required
                                    />
                                </label>

                                <label className={styles.field}>
                                    <span className={styles.label}>Password</span>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        value={form.password}
                                        onChange={updateField("password")}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                </label>

                                {message && <div className={styles.message}>{message}</div>}
                                {error && <div className={styles.error}>{error}</div>}

                                <button className={styles.submit} type="submit" disabled={isSubmitting}>
                                    <FiUserPlus />
                                    {isSubmitting ? "Creating..." : "Create account"}
                                </button>
                            </form>
                        ) : (
                            <form className={styles.form} onSubmit={handleVerify}>
                                <div className={styles.verificationBox}>
                                    {message && <div className={styles.message}>{message}</div>}
                                    {error && <div className={styles.error}>{error}</div>}

                                    <label className={styles.field}>
                                        <span className={styles.label}>Verification OTP</span>
                                        <input
                                            className={styles.input}
                                            value={otp}
                                            onChange={(event) => setOtp(event.target.value)}
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            required
                                        />
                                    </label>

                                    <button className={styles.submit} type="submit" disabled={isVerifying}>
                                        <FiCheckCircle />
                                        {isVerifying ? "Verifying..." : "Verify email"}
                                    </button>

                                    <button
                                        className={styles.secondaryButton}
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                    >
                                        <FiRefreshCcw />
                                        {isResending ? "Sending..." : "Resend OTP"}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className={styles.footer}>
                            <span>Already have an account?</span>
                            <Link className={styles.link} to="/login">Log in</Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
