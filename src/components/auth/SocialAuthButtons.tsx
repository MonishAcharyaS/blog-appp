"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SocialAuthButtonsProps {
  callbackUrl?: string;
  disabled?: boolean;
}

interface SocialConfig {
  google: boolean;
  github: boolean;
  linkedin: boolean;
  demoMode: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  callbackUrl = "/",
  disabled = false,
}) => {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [config, setConfig] = useState<SocialConfig | null>(null);

  useEffect(() => {
    fetch("/api/auth/social-config")
      .then((res) => res.json())
      .then((data: SocialConfig) => setConfig(data))
      .catch((err) => {
        console.warn("Could not fetch social auth config:", err);
      });
  }, []);

  const handleOAuthSignIn = async (provider: "google" | "github" | "linkedin") => {
    try {
      setLoadingProvider(provider);

      // Check whether live OAuth credentials are configured
      let isLiveConfigured = false;
      if (config) {
        if (provider === "google" && config.google) isLiveConfigured = true;
        if (provider === "github" && config.github) isLiveConfigured = true;
        if (provider === "linkedin" && config.linkedin) isLiveConfigured = true;
      } else {
        // If config is still loading, fetch it synchronously or await it
        try {
          const res = await fetch("/api/auth/social-config");
          const data: SocialConfig = await res.json();
          setConfig(data);
          if (provider === "google" && data.google) isLiveConfigured = true;
          if (provider === "github" && data.github) isLiveConfigured = true;
          if (provider === "linkedin" && data.linkedin) isLiveConfigured = true;
        } catch (e) {
          console.warn("Error fetching social-config during sign-in:", e);
        }
      }

      // If live OAuth credentials are configured for this provider, run standard NextAuth OAuth flow
      if (isLiveConfigured) {
        await signIn(provider, { callbackUrl });
        return;
      }

      // Otherwise, run seamless sandbox/mock flow for dev/demo/CI test environments
      const demoUsers = {
        google: {
          email: "alex.google@demo.blogify.io",
          name: "Alex Vance (Google)",
          image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        },
        github: {
          email: "octocat.github@demo.blogify.io",
          name: "Dev Octocat (GitHub)",
          image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
        },
        linkedin: {
          email: "sarah.linkedin@demo.blogify.io",
          name: "Sarah Jenkins (LinkedIn)",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        },
      };

      const selected = demoUsers[provider];
      const res = await signIn("credentials", {
        provider,
        email: selected.email,
        name: selected.name,
        image: selected.image,
        redirect: false,
        callbackUrl: callbackUrl || "/",
      });

      if (res?.error) {
        setLoadingProvider(null);
        if (res.error.toLowerCase().includes("suspended") || res.error.toLowerCase().includes("banned")) {
          router.push("/login?error=AccessDenied");
        } else {
          router.push("/login?error=OAuthSignin");
        }
      } else if (res?.ok) {
        // Hard navigate so NextAuth cookies and session are freshly populated everywhere
        window.location.assign(callbackUrl || "/");
      }
    } catch (err) {
      console.error(`Failed to initiate ${provider} sign-in:`, err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="social-auth-section">
      {/* Visual Divider */}
      <div className="relative flex items-center justify-center my-5">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        <span
          id="social-auth-divider-text"
          data-testid="social-auth-divider-text"
          className="absolute px-3 bg-white dark:bg-gray-900 text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400"
        >
          Or continue with
        </span>
      </div>

      {/* Social Provider Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Google Button */}
        <button
          type="button"
          id="social-login-google"
          data-testid="social-login-google"
          disabled={disabled || !!loadingProvider}
          onClick={() => handleOAuthSignIn("google")}
          className="relative group flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-gray-200/90 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loadingProvider === "google" ? (
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* GitHub Button */}
        <button
          type="button"
          id="social-login-github"
          data-testid="social-login-github"
          disabled={disabled || !!loadingProvider}
          onClick={() => handleOAuthSignIn("github")}
          className="relative group flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-gray-200/90 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loadingProvider === "github" ? (
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 fill-current text-gray-900 dark:text-white shrink-0" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          )}
          <span>GitHub</span>
        </button>

        {/* LinkedIn Button */}
        <button
          type="button"
          id="social-login-linkedin"
          data-testid="social-login-linkedin"
          disabled={disabled || !!loadingProvider}
          onClick={() => handleOAuthSignIn("linkedin")}
          className="relative group flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl border border-gray-200/90 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loadingProvider === "linkedin" ? (
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          )}
          <span>LinkedIn</span>
        </button>
      </div>
    </div>
  );
};

