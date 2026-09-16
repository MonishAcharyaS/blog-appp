import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const isGoogleConfigured = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes("placeholder")
);

export const isGithubConfigured = !!(
  process.env.GITHUB_ID &&
  process.env.GITHUB_SECRET &&
  !process.env.GITHUB_ID.includes("placeholder")
);

export const isLinkedinConfigured = !!(
  process.env.LINKEDIN_CLIENT_ID &&
  process.env.LINKEDIN_CLIENT_SECRET &&
  !process.env.LINKEDIN_CLIENT_ID.includes("placeholder")
);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "github-client-id-placeholder",
      clientSecret: process.env.GITHUB_SECRET || "github-client-secret-placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "linkedin-client-id-placeholder",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "linkedin-client-secret-placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
        provider: { label: "Provider", type: "text" },
        name: { label: "Name", type: "text" },
        image: { label: "Image", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.toLowerCase().trim();

        // Handle Social Sandbox / Mock login flow
        if (credentials.provider) {
          try {
            let dbUser = await prisma.user.findUnique({
              where: { email },
            });

            if (dbUser) {
              if (dbUser.isBanned) {
                throw new Error("Account suspended");
              }
              if (!dbUser.image && credentials.image) {
                dbUser = await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { image: credentials.image },
                });
              }
            } else {
              dbUser = await prisma.user.create({
                data: {
                  email,
                  name: credentials.name || email.split("@")[0],
                  image: credentials.image || null,
                  role: "READER",
                  isBanned: false,
                },
              });
            }

            return {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
              role: dbUser.role,
              isBanned: dbUser.isBanned,
            };
          } catch (dbErr: any) {
            if (dbErr.message === "Account suspended") throw dbErr;
            console.error("Database unavailable during sandbox social login, using fallback:", dbErr);
            return {
              id: `demo-${credentials.provider}-id`,
              name: credentials.name || email.split("@")[0],
              email,
              image: credentials.image || null,
              role: "READER",
              isBanned: false,
            };
          }
        }

        // Handle Standard Password login flow
        if (!credentials.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        if (user.isBanned) {
          throw new Error("Account suspended");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, verify or provision user in PostgreSQL
      if (account && account.provider !== "credentials" && account.provider !== "social-sandbox") {
        if (!user.email) return false;

        const email = user.email.toLowerCase().trim();
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (dbUser) {
            // Check banned status
            if (dbUser.isBanned) {
              return "/login?error=AccessDenied";
            }

            // Sync user avatar or name if missing
            if (!dbUser.image && user.image) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { image: user.image },
              });
            }
          } else {
            // Provision new OAuth user
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split("@")[0],
                image: user.image || null,
                role: "READER",
                isBanned: false,
              },
            });
          }

          // Attach database ID and role to user object so jwt callback receives them
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).isBanned = dbUser.isBanned;
          return true;
        } catch (err) {
          console.error("Error handling OAuth sign in:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isBanned = user.isBanned;
      } else if (token.id) {
        // Sync role and isBanned from database to reflect any admin updates immediately
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, isBanned: true },
          });
          if (freshUser) {
            token.role = freshUser.role;
            token.isBanned = freshUser.isBanned;
          }
        } catch (err) {
          console.error("Failed to sync fresh user data in jwt callback:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "READER";
        session.user.isBanned = !!token.isBanned;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

