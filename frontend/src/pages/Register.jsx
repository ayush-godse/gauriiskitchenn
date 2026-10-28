import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import useOtpCooldown, { getOtpRetryAfterSeconds } from "../hooks/useOtpCooldown";
import { apiUrl } from "../api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setCooldown(getOtpRetryAfterSeconds(res, data));
          setError(data.message || "Please wait before requesting another code.");
          return;
        }
        throw new Error(data.message || "Registration failed");
      }
      setOtpSent(true);
      setCooldown(data.resendAfterSeconds || 60);
    } catch (error) {
      console.error("Registration failed:", error);
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
      navigate(returnTo, { replace: true });
    } catch (error) {
      console.error("Registration verification failed:", error);
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
        throw new Error(data.message || "Could not resend verification code");
      }
      setCooldown(data.resendAfterSeconds || 60);
    } catch (error) {
      console.error("Resending registration code failed:", error);
      setError(error.message || "Something went wrong");
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={otpSent ? handleVerifyOtp : handleSubmit}>
        <h2>Register</h2>

        {!otpSent ? (
          <>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              title="Enter a 10-digit phone number"
              required
            />
            <button type="submit" disabled={cooldown > 0}>
              {cooldown > 0 ? `Try again in ${cooldown}s` : "Send email code"}
            </button>
            <p>Already registered? <Link to="/login" state={{ from: returnTo }}>Sign in</Link></p>
          </>
        ) : (
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
            <button type="submit">Verify and register</button>
            <button type="button" onClick={handleResendOtp} disabled={cooldown > 0}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  );
};

export default Register;