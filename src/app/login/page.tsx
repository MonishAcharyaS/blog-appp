"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    authError === "CredentialsSignin" ? "Invalid email or password" : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.toLowerCase().includes("suspended")) {
          setErrorMessage("Your account has been suspended. Please contact support.");
        } else {
          setErrorMessage("Invalid email or password. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Successful sign in -> redirect to callbackUrl or home
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
      {/* Registration Success Banner */}
      {registered && (
        <div
          id="registered-banner"
          className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm font-medium"
        >
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Account created successfully! You can now sign in.</span>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div
          id="login-error-banner"
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
          <span id="login-error-text">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-[#5B48EE] focus:border-transparent"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <a
              href="#forgot"
              className="text-xs font-medium text-[#5B48EE] hover:text-[#4936E3] dark:text-[#818CF8] dark:hover:text-[#A5B4FC] transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 pl-3.5 pr-11 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-[#5B48EE] focus:border-transparent"
            />
            <button
              type="button"
              id="toggle-password-btn"
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#5B48EE] focus:ring-[#5B48EE]"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600 dark:text-gray-400">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="login-submit-btn"
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
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Card Footer / Switch to Register */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
        Don&apos;t have an account yet?{" "}
        <Link
          id="link-to-register"
          href="/register"
          className="font-semibold text-[#5B48EE] hover:text-[#4936E3] dark:text-[#818CF8] dark:hover:text-[#A5B4FC] transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Sign in to access your feed, bookmarks, and stories
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-8 text-center text-sm text-gray-400">
              Loading sign in form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
