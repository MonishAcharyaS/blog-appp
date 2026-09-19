import { Metadata } from "next";
import Link from "next/link";
import { TiltCard } from "@/components/3d/TiltCard";

export const metadata: Metadata = {
  title: "About Us | Blogify Cyber-Matrix",
  description: "Learn more about Blogify, the cutting-edge cybernetic engineering and technology blogging platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          SYSTEM_PROFILE // ABOUT_US
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-wider text-gray-900 dark:text-white uppercase">
          Architecting the Future of Tech Publishing
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base font-mono text-gray-600 dark:text-gray-400">
          {"// Blogify is a spatial 3D cyber-matrix knowledge platform dedicated to engineers, creators, and technology pioneers."}
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TiltCard maxTilt={15} enableGlare={true} className="h-full">
          <div className="h-full p-6 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-cyan-500/20 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF] text-xl font-mono font-bold">
              01
            </div>
            <h3 className="text-lg font-bold font-mono text-gray-900 dark:text-white">Spatial Design</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Designed from first principles with 3D spatial perspective, cyber grids, and tactile feedback to make technical reading immersive.
            </p>
          </div>
        </TiltCard>

        <TiltCard maxTilt={15} enableGlare={true} className="h-full">
          <div className="h-full p-6 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-cyan-500/20 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[#5B48EE] dark:text-[#818CF8] text-xl font-mono font-bold">
              02
            </div>
            <h3 className="text-lg font-bold font-mono text-gray-900 dark:text-white">AI-Augmented Creation</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Integrated Gemini AI capabilities empower authors with instant draft synthesis, structure polishing, and automated visual generation.
            </p>
          </div>
        </TiltCard>

        <TiltCard maxTilt={15} enableGlare={true} className="h-full">
          <div className="h-full p-6 rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200 dark:border-cyan-500/20 shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-xl font-mono font-bold">
              03
            </div>
            <h3 className="text-lg font-bold font-mono text-gray-900 dark:text-white">Global Community</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Join thousands of developers, researchers, and system designers publishing engineering case studies and architecture breakdowns.
            </p>
          </div>
        </TiltCard>
      </div>

      {/* Narrative Section */}
      <div className="p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 space-y-4">
        <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white uppercase tracking-wider">
          Our Mission
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Technology moves at hyper-speed, but the platforms we use to share breakthroughs shouldn&apos;t look like static documents from decades ago. Blogify blends high-performance edge infrastructure, reactive typography, and cyberpunk aesthetic themes to deliver an unmatched reading and writing experience.
        </p>
        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00F0FF] text-black hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Explore Telemetry Feed
          </Link>
          <Link
            href="/guidelines"
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all"
          >
            Review Writing Guidelines →
          </Link>
        </div>
      </div>
    </div>
  );
}
