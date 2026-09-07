"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Authentication Test Portal</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-700">Session Status: <span id="session-status" className="font-mono text-indigo-600">{status}</span></p>
        {session?.user && (
          <div className="mt-2 text-xs text-gray-600 space-y-1" id="user-info">
            <p><strong>Name:</strong> <span id="user-name">{session.user.name}</span></p>
            <p><strong>Email:</strong> <span id="user-email">{session.user.email}</span></p>
            <p><strong>Role:</strong> <span id="user-role" className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">{session.user.role}</span></p>
            <p><strong>ID:</strong> <span id="user-id">{session.user.id}</span></p>
            <button
              id="logout-btn"
              onClick={() => signOut({ redirect: false })}
              className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {!session && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && (
            <div id="error-message" className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Sign In with Credentials
          </button>
        </form>
      )}
    </div>
  );
}
