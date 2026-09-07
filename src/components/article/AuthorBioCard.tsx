import React from "react";
import Link from "next/link";

interface AuthorBioCardProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    bio?: string | null;
  };
}

export const AuthorBioCard: React.FC<AuthorBioCardProps> = ({ author }) => {
  return (
    <div
      id="author-bio-card"
      data-testid="author-bio-card"
      className="p-6 sm:p-8 rounded-3xl bg-gray-50/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xs"
    >
      {/* Avatar */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-4 ring-[#5B48EE]/10 overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm">
        {author.image ? (
          <img
            src={author.image}
            alt={author.name || "Author"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-[#5B48EE]">
            {author.name ? author.name.charAt(0).toUpperCase() : "A"}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white" id="author-name-heading">
            {author.name || "Anonymous Author"}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400">
            {author.role}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed" id="author-bio-text">
          {author.bio ||
            "Contributing author and software engineer sharing in-depth technical breakdowns and system design patterns."}
        </p>

        <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#5B48EE] dark:text-[#818CF8]">
          <Link href="/" className="hover:underline">
            View all stories by {author.name?.split(" ")[0] || "author"} →
          </Link>
        </div>
      </div>
    </div>
  );
};
