"use client";

import React from "react";

export const AmbientOrbs: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {/* Top Left Indigo / Blue Ambient Orb */}
      <div
        className="animate-orb-1 absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[110px] opacity-40 dark:opacity-25 bg-gradient-to-br from-[#6366F1] to-[#3B82F6]"
      />

      {/* Top Right Cyan / Sky Ambient Orb */}
      <div
        className="animate-orb-2 absolute top-[20%] -right-[15%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[120px] opacity-35 dark:opacity-20 bg-gradient-to-bl from-[#0EA5E9] via-[#818CF8] to-transparent"
      />

      {/* Bottom Center Violet / Rose Ambient Glow */}
      <div
        className="animate-orb-3 absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[130px] opacity-30 dark:opacity-15 bg-gradient-to-tr from-[#A855F7] via-[#6366F1] to-transparent"
      />
    </div>
  );
};
