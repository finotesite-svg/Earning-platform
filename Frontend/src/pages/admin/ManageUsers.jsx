import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { Users } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/users")
      .then(({ data }) => setUsers(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load users."),
      );
  }, []);

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
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
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
        </div>
      </main>
    </div>
  );
}
