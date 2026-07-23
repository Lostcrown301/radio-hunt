import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import Background from "../components/background/Background";
import Logo from "../components/layout/Logo";
import { loginUser } from "../services/authService";
import styles from "./AuthPage.module.css";

function getErrorMessage(error) {
    return error.response?.data?.message || "Login failed. Please try again.";
}

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field) => (event) => {
        setForm((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await loginUser(form);
            navigate("/game");
        }
        catch (err) {
            setError(getErrorMessage(err));
        }
        finally {
            setIsSubmitting(false);
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
                    <section className={styles.panel} aria-labelledby="login-title">
                        <div className={styles.titleRow}>
                            <span className={styles.titleIcon}>
                                <FiLogIn />
                            </span>
                            <h2 id="login-title" className={styles.title}>Log in</h2>
                        </div>
                        <p className={styles.subtitle}>Jump back into Radio Hunt with your email or username.</p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label className={styles.field}>
                                <span className={styles.label}>Email or username</span>
                                <input
                                    className={styles.input}
                                    value={form.identifier}
                                    onChange={updateField("identifier")}
                                    autoComplete="username"
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
                                    autoComplete="current-password"
                                    required
                                />
                            </label>

                            {error && <div className={styles.error}>{error}</div>}

                            <button className={styles.submit} type="submit" disabled={isSubmitting}>
                                <FiLogIn />
                                {isSubmitting ? "Logging in..." : "Log in"}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <span>New to Radio Hunt?</span>
                            <Link className={styles.link} to="/register">Create an account</Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
