"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminUserItem } from "@/types/blog";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "READER">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

  // Modal confirmation states
  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null);
  const [roleTarget, setRoleTarget] = useState<AdminUserItem | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch users with current query filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  // Handle Ban / Unban execution
  const handleConfirmBanToggle = async () => {
    if (!banTarget) return;
    const nextBanStatus = !banTarget.isBanned;

    try {
      setActionInProgress(true);
      setActionError(null);

      const res = await fetch(`/api/admin/users/${banTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextBanStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update ban status");
      }

      // Optimistically / state update
      setUsers((prev) =>
        prev.map((u) => (u.id === banTarget.id ? { ...u, isBanned: nextBanStatus } : u))
      );
      setBanTarget(null);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to execute ban action");
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle Role Change execution
  const handleConfirmRoleToggle = async () => {
    if (!roleTarget) return;
    const nextRole = roleTarget.role === "ADMIN" ? "READER" : "ADMIN";

    try {
      setActionInProgress(true);
      setActionError(null);

      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === roleTarget.id ? { ...u, role: nextRole } : u))
      );
      setRoleTarget(null);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to execute role change");
    } finally {
      setActionInProgress(false);
    }
  };

  // Counters
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const readerCount = users.filter((u) => u.role === "READER").length;
  const bannedCount = users.filter((u) => u.isBanned).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              User Management
            </h1>
            <span
              id="total-users-badge"
              data-testid="total-users-badge"
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#5B48EE] dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
            >
              {totalCount} registered
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage registered members, promote administrators, and enforce platform security suspensions.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Users</p>
          <p id="metric-total-users" className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {totalCount}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Administrators</p>
          <p id="metric-admin-users" className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {adminCount}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Readers</p>
          <p id="metric-reader-users" className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {readerCount}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Suspended (Banned)</p>
          <p id="metric-banned-users" className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {bannedCount}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            id="admin-users-search"
            data-testid="admin-users-search"
            type="text"
            placeholder="Search users by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#5B48EE]/20 focus:border-[#5B48EE]"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs (Role & Status) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {(["all", "ADMIN", "READER"] as const).map((r) => (
              <button
                key={r}
                id={`filter-role-${r}`}
                data-testid={`filter-role-${r}`}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === r
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {(["all", "active", "banned"] as const).map((s) => (
              <button
                key={s}
                id={`filter-status-${s}`}
                data-testid={`filter-status-${s}`}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>

          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              id="reset-users-filters-btn"
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table
            id="admin-users-table"
            data-testid="admin-users-table"
            className="w-full text-left text-xs"
          >
            <thead className="bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px] border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Activity</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr id="loading-users-row" data-testid="loading-users-row">
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#5B48EE] border-t-transparent animate-spin" />
                      <span>Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                      No users found matching the current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;

                  return (
                    <tr
                      key={user.id}
                      id={`user-row-${user.id}`}
                      data-testid={`user-row-${user.id}`}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* User Avatar + Identity */}
                      <td className="px-5 py-4 max-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[#5B48EE] dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-gray-900 dark:text-white truncate">
                                {user.name || "Anonymous"}
                              </p>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge & Toggle Button */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            id={`user-role-badge-${user.id}`}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              user.role === "ADMIN"
                                ? "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                          {!isSelf && (
                            <button
                              type="button"
                              id={`toggle-role-${user.id}`}
                              data-testid={`toggle-role-${user.id}`}
                              onClick={() => setRoleTarget(user)}
                              title={user.role === "ADMIN" ? "Demote to READER" : "Promote to ADMIN"}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 underline cursor-pointer"
                            >
                              {user.role === "ADMIN" ? "Demote" : "Promote"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          id={`user-status-badge-${user.id}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            user.isBanned
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isBanned ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>{user.isBanned ? "Banned" : "Active"}</span>
                        </span>
                      </td>

                      {/* Activity Metrics */}
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span>{user._count?.posts ?? 0} posts</span>
                          <span>•</span>
                          <span>{user._count?.comments ?? 0} comments</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions: Ban / Unban */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isSelf ? (
                          <span
                            id={`self-lockout-indicator-${user.id}`}
                            className="text-[11px] text-gray-400 italic"
                            title="You cannot ban or demote your own account"
                          >
                            Current Account
                          </span>
                        ) : (
                          <button
                            type="button"
                            id={`toggle-ban-${user.id}`}
                            data-testid={`toggle-ban-${user.id}`}
                            onClick={() => setBanTarget(user)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              user.isBanned
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            {user.isBanned ? "Unban User" : "Ban User"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban / Unban Confirmation Modal */}
      {banTarget && (
        <div
          id="ban-user-modal"
          data-testid="ban-user-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                banTarget.isBanned
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              }`}
            >
              {banTarget.isBanned ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {banTarget.isBanned ? "Unban User Account?" : "Suspend & Ban User?"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {banTarget.isBanned ? (
                  <>
                    Are you sure you want to restore access for{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">
                      {banTarget.name || banTarget.email}
                    </strong>
                    ? They will be able to log in and participate in discussions again.
                  </>
                ) : (
                  <>
                    Are you sure you want to suspend{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">
                      {banTarget.name || banTarget.email}
                    </strong>
                    ? Their active sessions will be invalidated immediately and login attempts will be rejected with an account suspension notice.
                  </>
                )}
              </p>

              {actionError && (
                <div
                  id="action-error-alert"
                  className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold text-left"
                >
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="cancel-ban-btn"
                data-testid="cancel-ban-btn"
                onClick={() => {
                  setBanTarget(null);
                  setActionError(null);
                }}
                disabled={actionInProgress}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-ban-btn"
                data-testid="confirm-ban-btn"
                onClick={handleConfirmBanToggle}
                disabled={actionInProgress}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50 cursor-pointer ${
                  banTarget.isBanned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionInProgress
                  ? "Processing..."
                  : banTarget.isBanned
                  ? "Confirm Unban"
                  : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {roleTarget && (
        <div
          id="role-change-modal"
          data-testid="role-change-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {roleTarget.role === "ADMIN" ? "Demote to Reader?" : "Promote to Administrator?"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {roleTarget.role === "ADMIN" ? (
                  <>
                    Are you sure you want to demote{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">
                      {roleTarget.name || roleTarget.email}
                    </strong>{" "}
                    from <strong>ADMIN</strong> to <strong>READER</strong>? They will lose access to all admin management tools.
                  </>
                ) : (
                  <>
                    Are you sure you want to promote{" "}
                    <strong className="text-gray-900 dark:text-white font-bold">
                      {roleTarget.name || roleTarget.email}
                    </strong>{" "}
                    to <strong>ADMIN</strong>? They will gain full access to articles, comment moderation, metrics, and user management.
                  </>
                )}
              </p>

              {actionError && (
                <div
                  id="role-action-error-alert"
                  className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold text-left"
                >
                  {actionError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="cancel-role-change-btn"
                data-testid="cancel-role-change-btn"
                onClick={() => {
                  setRoleTarget(null);
                  setActionError(null);
                }}
                disabled={actionInProgress}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-role-change-btn"
                data-testid="confirm-role-change-btn"
                onClick={handleConfirmRoleToggle}
                disabled={actionInProgress}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#5B48EE] hover:bg-[#4C3BDB] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {actionInProgress
                  ? "Updating..."
                  : roleTarget.role === "ADMIN"
                  ? "Confirm Demote"
                  : "Confirm Promote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
