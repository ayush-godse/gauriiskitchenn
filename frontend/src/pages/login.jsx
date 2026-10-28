import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import useOtpCooldown, { getOtpRetryAfterSeconds } from "../hooks/useOtpCooldown";
import { apiUrl } from "../api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState("");
    const [cooldown, setCooldown] = useOtpCooldown();
    const { login } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const returnTo = location.state?.from || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            const res = await fetch(apiUrl("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setCooldown(getOtpRetryAfterSeconds(res, data));
                    setError(data.message || "Please wait before requesting another code.");
                    return;
                }
                throw new Error(data.message || "Login failed");
            }
            setOtpSent(true);
            setCooldown(data.resendAfterSeconds || 60);
        } catch (error) {
            console.error("Login failed:", error);
            setError(error.message || "Something went wrong");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setError("");
            const res = await fetch(apiUrl("/api/auth/verify-otp"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Verification failed");
            }
            login(data, data.token);
            navigate(returnTo === "/" && data.role === "admin" ? "/admin" : returnTo, { replace: true });
        } catch (error) {
            console.error("Login verification failed:", error);
            setError(error.message || "Something went wrong");
        }
    };

    const handleResendOtp = async () => {
        try {
            setError("");
            const res = await fetch(apiUrl("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 429) {
                    setCooldown(getOtpRetryAfterSeconds(res, data));
                    setError(data.message || "Please wait before requesting another code.");
                    return;
                }
                throw new Error(data.message || "Could not resend sign-in code");
            }
            setCooldown(data.resendAfterSeconds || 60);
        } catch (error) {
            console.error("Resending sign-in code failed:", error);
            setError(error.message || "Something went wrong");
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={otpSent ? handleVerifyOtp : handleSubmit} className="register-form">
                <h2>Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={otpSent}
                    required
                />
                {otpSent && (
                    <>
                        <p>Enter the verification code sent to {email}.</p>
                        <input
                            type="text"
                            placeholder="6-digit email code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                        />
                    </>
                )}
                <button type="submit" disabled={!otpSent && cooldown > 0}>
                    {otpSent ? "Verify and sign in" : cooldown > 0 ? `Try again in ${cooldown}s` : "Email me a sign-in code"}
                </button>
                {!otpSent && <p>New here? <Link to="/register" state={{ from: returnTo }}>Create an account</Link></p>}
                {otpSent && (
                    <button type="button" onClick={handleResendOtp} disabled={cooldown > 0}>
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                    </button>
                )}
                {error && <p role="alert">{error}</p>}
            </form>
        </div>
    );
};

export default Login;