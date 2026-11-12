import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { ChevronLeft, ChevronRight, CreditCard, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [error, setError] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    API.get("/admin/users", { params: { page: userPage, limit: 10 } })
      .then(({ data }) => {
        setUsers(data.users);
        setUserPagination(data.pagination);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load users."),
      );
  }, [userPage]);

  useEffect(() => {
    API.get("/admin/payment-accounts")
      .then(({ data }) => setPaymentAccounts(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load payment accounts."),
      );
  }, []);

  const reviewPaymentAccount = async (account, status) => {
    setError("");
    try {
      await API.patch(
        `/admin/payment-accounts/${account.userId}/${account._id}`,
        { status },
      );
      setPaymentAccounts((current) =>
        current.map((item) =>
          item._id === account._id ? { ...item, status } : item,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to review payment account.",
      );
    }
  };

  const toggleStatus = async (user) => {
    setError("");
    try {
      const { data } = await API.patch(
        `/admin/users/${user._id || user.id}/status`,
        { isActive: !user.isActive },
      );
      setUsers((current) =>
        current.map((item) =>
          (item._id || item.id) === (user._id || user.id)
            ? data.user
            : item,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status.");
    }
  };

  const updateRole = async (user, role) => {
    setError("");
    try {
      const { data } = await API.patch(
        `/admin/users/${user._id || user.id}/role`,
        { role },
      );
      setUsers((current) =>
        current.map((item) =>
          (item._id || item.id) === (user._id || user.id)
            ? data.user
            : item,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 text-[#00A86B] mr-2" />
              Manage Platform Users
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              View and control registered user accounts and roles.
            </p>
          </div>
        </div>

        <div className="bg-[#1C2541] rounded-2xl border border-slate-700/50 overflow-hidden">
          {error && (
            <p className="p-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/30 text-slate-400 text-sm">
                  <th className="p-4 font-semibold">User Name</th>
                  <th className="p-4 font-semibold">Phone Number</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium text-white flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#00A86B] flex items-center justify-center font-bold mr-3 border border-emerald-500/20">
                        {(u.name || "U").charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 text-slate-300">{u.phone}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        disabled={(u._id || u.id) === currentUser?.id}
                        onChange={(event) => updateRole(u, event.target.value)}
                        aria-label={`Role for ${u.name}`}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          u.role === "admin"
                            ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                            : "border-slate-700 bg-slate-800 text-slate-300"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/10 text-[#00A86B] border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {u.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          u.isActive
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-[#00A86B] hover:bg-emerald-500/20"
                        }`}
                      >
                        {u.isActive ? "Block User" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-700/60 px-4 py-3">
            <p className="text-sm text-slate-400">
              {userPagination.total} user{userPagination.total === 1 ? "" : "s"} total
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPage((page) => page - 1)}
                disabled={userPage <= 1}
                className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous users page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-20 text-center text-sm text-slate-400">
                Page {userPagination.page} of {userPagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setUserPage((page) => page + 1)}
                disabled={userPage >= userPagination.pages}
                className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next users page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#1C2541]">
          <div className="border-b border-slate-700/60 p-6">
            <h2 className="flex items-center text-lg font-bold text-white">
              <CreditCard className="mr-2 h-5 w-5 text-[#00A86B]" />
              Payment Account Requests
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Approve accounts before users can select them for withdrawals.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/30 text-sm text-slate-400">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Method</th>
                  <th className="p-4 font-semibold">Account Owner</th>
                  <th className="p-4 font-semibold">Account Number</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {paymentAccounts.map((account) => (
                  <tr key={account._id} className="hover:bg-slate-800/20">
                    <td className="p-4 font-medium text-white">
                      {account.userName}
                      <span className="block text-xs text-slate-400">{account.userPhone}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {account.method === "telebirr" ? "Telebirr" : "CBE"}
                    </td>
                    <td className="p-4 text-slate-300">{account.accountName || "—"}</td>
                    <td className="p-4 font-mono text-slate-300">{account.accountNumber}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : account.status === "Rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {account.status === "Pending" ? (
                        <div className="space-x-2">
                          <button
                            type="button"
                            onClick={() => reviewPaymentAccount(account, "Approved")}
                            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewPaymentAccount(account, "Rejected")}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-500">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!paymentAccounts.length && (
              <p className="p-8 text-center text-sm text-slate-500">
                No payment account requests found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
