import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Blogify Cyber-Matrix",
  description: "Privacy policy and data protection principles on Blogify.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
          PRIVACY_PROTOCOL // DATA_PROTECTION
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-wide text-gray-900 dark:text-white uppercase">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us when creating an account (such as name and email), as well as content you author, comments you post, and telemetry preferences (e.g. dark/light theme).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            2. How We Use Your Data
          </h2>
          <p>
            Your information is used solely to authenticate your sessions, display your author profile, deliver weekly newsletters (if opted-in), and secure the platform against spam. We do not sell your personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            3. Cookies & Session Storage
          </h2>
          <p>
            We use secure HTTP-only cookies and local storage to store authentication tokens (NextAuth) and user interface configurations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            4. Contact & Data Deletion
          </h2>
          <p>
            To request full data deletion or account removal, contact our administration team or manage your settings in your profile dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
