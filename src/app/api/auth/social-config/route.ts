import { NextResponse } from "next/server";
import {
  isGoogleConfigured,
  isGithubConfigured,
  isLinkedinConfigured,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    google: isGoogleConfigured,
    github: isGithubConfigured,
    linkedin: isLinkedinConfigured,
    demoMode: !isGoogleConfigured && !isGithubConfigured && !isLinkedinConfigured,
  });
}
