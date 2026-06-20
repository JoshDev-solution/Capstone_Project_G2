"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PawPrint, Mail, Lock, Eye, EyeOff, ArrowRight,
  User, Phone, CheckCircle2, Sun, Moon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";

const steps = ["Account", "Personal Info", "Verify"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 1) { 
      setStep(step + 1); 
      return; 
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
      if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute"
              style={{ left: `${(i * 19) % 88}%`, top: `${(i * 27) % 80}%` }}
            >
              <PawPrint size={20 + (i % 4) * 8} className="text-white/40" />
            </motion.div>
          ))}
        </div>
        <div className="relative text-center text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Join Our Family</h2>
          <p className="text-white/80 text-base max-w-xs mx-auto mb-8">
            Create your free account and start giving your pet the best care possible.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              "Free online appointment booking",
              "Digital medical records access",
              "Vaccination reminders",
              "Direct vet messaging",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-white/90 shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
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
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LJ Veterinary Clinic</span>
          </Link>

          {done ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Registration Submitted!</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm leading-relaxed">
                Your account is pending admin approval. You&apos;ll receive an email notification once approved. Thank you for joining LJ Veterinary Clinic!
              </p>
              <Link href="/login" className="btn btn-primary w-full justify-center">
                Go to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">Create Account</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Join LJ Veterinary Clinic today.
              </p>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      i <= step
                        ? "gradient-primary text-white shadow-md"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                    }`}>
                      {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${i === step ? "text-primary-500" : "text-neutral-400"}`}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px ${i < step ? "bg-primary-300" : "bg-neutral-200 dark:bg-neutral-800"}`} />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleNext} className="flex flex-col gap-4">
                {step === 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" style={{ paddingLeft: "2.5rem" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="reg-password">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input id="reg-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="input pl-10 pr-10" style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" tabIndex={-1}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="confirm-password">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="input pl-10" style={{ paddingLeft: "2.5rem" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="first-name">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input id="first-name" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" className="input pl-10" style={{ paddingLeft: "2.5rem" }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" htmlFor="last-name">Last Name</label>
                        <input id="last-name" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dela Cruz" className="input" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="phone">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63-9XX-XXX-XXXX" className="input pl-10" style={{ paddingLeft: "2.5rem" }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="address">Address</label>
                      <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Barangay, City" className="input" />
                    </div>
                    <div className="flex items-start gap-3 mt-1">
                      <input id="terms" type="checkbox" required className="mt-1 accent-primary-500" />
                      <label htmlFor="terms" className="text-sm text-neutral-500 dark:text-neutral-400 leading-snug cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-primary-500 font-medium hover:underline">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-primary-500 font-medium hover:underline">Privacy Policy</a>.
                      </label>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      {step < 1 ? "Continue" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost text-sm w-full">
                    ← Back
                  </button>
                )}
              </form>

              <p className="text-center text-sm text-neutral-500 mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary-500 font-semibold hover:text-primary-600">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
