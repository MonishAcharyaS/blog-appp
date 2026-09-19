import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Writing Guidelines | Blogify Cyber-Matrix",
  description: "Standards, formatting guidelines, and editorial principles for publishing on Blogify.",
};

export default function GuidelinesPage() {
  const guidelines = [
    {
      rule: "01 // Technical Depth & Clarity",
      desc: "We value clear explanations, reproducible code snippets, and deep architectural diagrams over buzzword-heavy overviews.",
    },
    {
      rule: "02 // Original Research & Ground Truth",
      desc: "Ensure benchmarks, code examples, and technical claims are validated against working implementations.",
    },
    {
      rule: "03 // Markdown & Code Formatting",
      desc: "Use syntax-highlighted code blocks, clear section headings (H2, H3), and structured lists to keep technical articles easily scannable.",
    },
    {
      rule: "04 // Ethical AI Usage",
      desc: "AI writing assistants are encouraged for outlining and research, but the final prose must reflect the author's voice, experience, and verification.",
    },
    {
      rule: "05 // Respectful & Constructive Discourse",
      desc: "Blogify is a collaborative community of engineers and builders. Respect peer opinions in comments and moderation discussions.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
          EDITORIAL_PROTOCOL // GUIDELINES
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-wide text-gray-900 dark:text-white uppercase">
          Author Writing Guidelines
        </h1>
        <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {"// Essential criteria and formatting standards for all published posts."}
        </p>
      </div>

      <div className="space-y-4">
        {guidelines.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-800 space-y-2 hover:border-cyan-500/30 transition-all"
          >
            <h3 className="text-sm font-bold font-mono text-[#00F0FF] uppercase tracking-wider">
              {item.rule}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold font-mono text-gray-900 dark:text-white">Ready to publish your article?</h4>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">Launch the spatial editor with rich text and AI tools.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] text-black hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
        >
          Create Post →
        </Link>
      </div>
    </div>
  );
}
