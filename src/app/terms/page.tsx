import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Blogify Cyber-Matrix",
  description: "Terms of Service and user agreement for the Blogify platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
          LEGAL_PROTOCOL // TERMS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-wide text-gray-900 dark:text-white uppercase">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
          Last updated: September 2026
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Blogify, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            2. User Content & Intellectual Property
          </h2>
          <p>
            You retain ownership of the content, articles, and media you publish on Blogify. By publishing content, you grant Blogify a non-exclusive license to host, display, and distribute your material across the network.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            3. Conduct & Community Standards
          </h2>
          <p>
            Users agree not to post malicious code, abuse API limits, spam comment threads, or publish plagiarized content. Violations may result in suspension or permanent account termination.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-mono text-gray-900 dark:text-white uppercase">
            4. Limitation of Liability
          </h2>
          <p>
            Blogify is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages resulting from platform use.
          </p>
        </section>
      </div>
    </div>
  );
}
