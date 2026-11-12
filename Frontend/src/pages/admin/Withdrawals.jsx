import { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  TrendingUp,
  CreditCard,
  Clock,
} from "lucide-react";

export default function Withdrawals() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await API.get("/admin/withdrawals");
        setRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load withdrawals.");
      }
    };

    loadRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const paymentReference =
      status === "Completed"
        ? window.prompt("Enter the payment reference or transfer ID:")
        : undefined;
    if (status === "Completed" && !paymentReference?.trim()) return;

    try {
      const response = await API.patch(`/admin/withdrawals/${id}`, {
        status,
        paymentReference,
      });
      const updated = response.data.withdrawal || response.data;
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          (request._id || request.id) === id
            ? { ...request, status: updated.status }
            : request,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update withdrawal.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen space-y-8 bg-[#0B132B] p-6 text-slate-100 md:p-8">
      {/* Header Banner */}
      <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="w-6 h-6 text-[#00A86B] mr-2" />
            Withdrawal Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review user payout requests and update their transfer statuses.
          </p>
        </div>
      </div>

      {/* Withdrawals Table Card */}
      <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center">
          <Clock className="w-5 h-5 text-[#00A86B] mr-2" />
          All Payout Requests ({requests.length})
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method & Account</th>
                  <th className="py-3 px-4 font-semibold">Account Owner</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {requests.map((item) => (
                  <tr
                    key={item._id || item.id}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="py-4 px-4 font-semibold text-white">
                      {item.userId?.name || "User"}
                      <span className="block text-xs text-slate-400 font-mono">
                        {item.userId?.phone}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#00A86B]">
                      {item.amount}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-slate-300">
                        <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {item.paymentMethod}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.accountNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {item.accountName || "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.status === "Rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {item.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(item._id || item.id, "Completed")
                            }
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item._id || item.id, "Rejected")}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {item.status !== "Pending" && (
                        <span className="text-slate-500 text-xs italic">
                          {item.status === "Completed"
                            ? item.paymentReference
                              ? `Paid: ${item.paymentReference}`
                              : "Completed"
                            : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No withdrawal requests found.</p>
          </div>
        )}
      </div>
      </main>
    </>
  );
}
