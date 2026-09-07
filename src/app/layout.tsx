import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blogify - Share your ideas with the world",
  description: "A modern, scalable blog platform.",
};

const themeInitScript = `
  (function() {
    try {
      var storedTheme = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <ThemeProvider>
            {/* Top fixed theme switcher floating bar for easy global accessibility */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
