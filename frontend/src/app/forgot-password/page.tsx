"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Mail, Phone, Lock, Eye, EyeOff, ArrowRight,
  ArrowLeft, KeyRound, ShieldCheck, CheckCircle2, AlertCircle,
  Sun, Moon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

type Step = "request" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [method, setMethod] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;

  // ── Step 1: Request OTP ──
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");
      setSentTo(data.sentTo);
      setMethod(data.method);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otpCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP.");
      setResetToken(data.resetToken);
      setStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed.");
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handler ──
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpCode(newOtp);
    const next = document.getElementById(`otp-${Math.min(pasted.length, 5)}`);
    next?.focus();
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setOtpCode(["", "", "", "", "", ""]);
    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSentTo(data.sentTo);
      setError(""); // Clear any old error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    request: { icon: KeyRound, title: "Forgot Password?", subtitle: "Enter your registered email or phone number and we'll send you an OTP." },
    verify: { icon: ShieldCheck, title: "Verify OTP", subtitle: `Enter the 6-digit code sent to ${sentTo}` },
    reset: { icon: Lock, title: "Create New Password", subtitle: "Your identity has been verified. Set your new password below." },
    success: { icon: CheckCircle2, title: "Password Reset!", subtitle: "Your password has been changed successfully." },
  };

  const current = stepConfig[step];

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute text-white/30"
              style={{ left: `${(i * 17) % 90}%`, top: `${(i * 23) % 85}%` }}
            >
              <PawPrint size={24 + (i % 3) * 12} />
            </motion.div>
          ))}
        </div>
        <div className="relative text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <PawPrint className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-3"
          >
            LJ Veterinary Clinic
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-lg max-w-xs mx-auto"
          >
            Compassionate Care for Every Paw
          </motion.p>

          {/* Security features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex flex-col gap-3 text-left max-w-xs mx-auto"
          >
            {[
              "OTP verification via email/phone",
              "Secure password reset process",
              "Account lockout protection",
              "Encrypted data transmission",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-white/90 shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 btn-icon btn-ghost rounded-full w-10 h-10 flex items-center justify-center"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo (mobile) */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LJ Veterinary Clinic</span>
          </Link>

          {/* Step Progress */}
          {step !== "success" && (
            <div className="flex items-center gap-1 mb-8">
              {(["request", "verify", "reset"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    (["request", "verify", "reset"] as Step[]).indexOf(step) >= i
                      ? "gradient-primary text-white shadow-md"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                  }`}>
                    {(["request", "verify", "reset"] as Step[]).indexOf(step) > i ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-px ${
                      (["request", "verify", "reset"] as Step[]).indexOf(step) > i
                        ? "bg-primary-300"
                        : "bg-neutral-200 dark:bg-neutral-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-lg">
              <current.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{current.title}</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{current.subtitle}</p>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-6"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 1: Request OTP ── */}
          {step === "request" && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleRequestOtp}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="identifier">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or +63-9XX-XXX-XXXX"
                    className="input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  We&apos;ll send a 6-digit OTP to verify your identity.
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </motion.form>
          )}

          {/* ── Step 2: Verify OTP ── */}
          {step === "verify" && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-5"
            >
              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
                {method === "email" ? (
                  <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                ) : (
                  <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                )}
                <span className="text-sm text-primary-600 dark:text-primary-400">
                  OTP sent to <strong>{sentTo}</strong>
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-neutral-200 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-neutral-900 outline-none transition-colors"
                    />
                  ))}
                </div>
                <p className="text-xs text-neutral-400 mt-3 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <>
                    Verify OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep("request"); setError(""); }}
                  className="flex items-center gap-1 text-neutral-500 hover:text-primary-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </motion.form>
          )}

          {/* ── Step 3: Reset Password ── */}
          {step === "reset" && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleResetPassword}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input pl-10 pr-10"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="confirm-new-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      newPassword.length >= i * 3
                        ? i <= 1
                          ? "bg-danger"
                          : i <= 2
                          ? "bg-warning"
                          : i <= 3
                          ? "bg-primary-400"
                          : "bg-success"
                        : "bg-neutral-200 dark:bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-400 -mt-3">
                {newPassword.length === 0
                  ? "Enter a password"
                  : newPassword.length < 6
                  ? "Too weak"
                  : newPassword.length < 9
                  ? "Fair"
                  : newPassword.length < 12
                  ? "Good"
                  : "Strong"}
              </p>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  <>
                    Reset Password <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Password Reset Successful!</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm leading-relaxed">
                Your password has been changed. You can now log in with your new credentials.
              </p>
              <Link href="/login" className="btn btn-primary btn-lg w-full justify-center">
                Go to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
