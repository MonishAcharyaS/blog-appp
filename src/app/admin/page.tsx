import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            System administration, analytics, post publishing, and user management.
          </p>
        </div>
        <span
          id="admin-role-badge"
          className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider"
        >
          {session?.user?.role ?? "ADMIN"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold uppercase text-gray-400">Total Posts</p>
          <p id="metric-posts" className="text-2xl font-black text-gray-900 mt-2">4</p>
        </div>
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold uppercase text-gray-400">Registered Users</p>
          <p id="metric-users" className="text-2xl font-black text-gray-900 mt-2">3</p>
        </div>
        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold uppercase text-gray-400">System Status</p>
          <p id="metric-status" className="text-sm font-bold text-emerald-600 mt-3 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
            Operational
          </p>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/80">
        <p className="text-xs text-indigo-900 font-medium">
          Logged in as <strong>{session?.user?.name}</strong> ({session?.user?.email}) with administrative privileges.
        </p>
      </div>
    </div>
  );
}
