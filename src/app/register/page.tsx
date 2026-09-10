"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError("Email address is required.");
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError("Password is required.");
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Client-side validations
    let hasError = false;

    if (!name.trim()) {
      hasError = true;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to register. Please try again.");
        setLoading(false);
        return;
      }

      // Success -> Redirect to /login?registered=true
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 group">
            <span className="text-3xl font-black tracking-tight text-gray-950 dark:text-white font-sans transition-colors">
              Blogify
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B48EE]" />
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Join our community to share stories, follow creators, and comment
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
          {/* Server Error Banner */}
          {serverError && (
            <div
              id="register-error-banner"
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm font-medium"
            >
              <svg
                className="w-5 h-5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span id="register-server-error-text">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Monish Achari"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-[#5B48EE] focus:border-transparent"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onBlur={handleEmailBlur}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@example.com"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 ${
                  emailError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:ring-[#5B48EE] focus:border-transparent"
                }`}
              />
              {emailError && (
                <p id="email-validation-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onBlur={handlePasswordBlur}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full rounded-xl border pl-3.5 pr-11 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 ${
                    passwordError
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-700 focus:ring-[#5B48EE] focus:border-transparent"
                  }`}
                />
                <button
                  type="button"
                  id="register-toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError ? (
                <p id="password-validation-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {passwordError}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                placeholder="Re-enter password"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 ${
                  confirmPasswordError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:ring-[#5B48EE] focus:border-transparent"
                }`}
              />
              {confirmPasswordError && (
                <p id="confirm-password-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Terms Disclaimer */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#terms" className="text-[#5B48EE] dark:text-[#818CF8] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="text-[#5B48EE] dark:text-[#818CF8] hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#5B48EE] hover:bg-[#4936E3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5B48EE] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Social OAuth Buttons (Google, GitHub, LinkedIn) */}
          <SocialAuthButtons callbackUrl="/" disabled={loading} />

          {/* Card Footer / Switch to Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              id="link-to-login"
              href="/login"
              className="font-semibold text-[#5B48EE] hover:text-[#4936E3] dark:text-[#818CF8] dark:hover:text-[#A5B4FC] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
