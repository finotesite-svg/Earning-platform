import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { BarChart3, ClipboardList, Users } from "lucide-react";

function totalFor(items, id) {
  return Number(items.find((item) => item._id === id)?.total || 0);
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/reports/financial")
      .then(({ data }) => setReport(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load reports."),
      );
  }, []);

  const ledgerTotals = report?.ledgerTotals || [];
  const withdrawalTotals = report?.withdrawalTotals || [];
  const referralTotals = report?.referralTotals || {};

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <header className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
          <h1 className="flex items-center text-2xl font-bold text-white">
            <BarChart3 className="mr-2 h-6 w-6 text-[#00A86B]" />
            Financial Reports
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Review ledger totals, payout activity, referral rewards, and recent
            administrative actions.
          </p>
        </header>

        {error && (
          <p className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
            <Users className="h-5 w-5 text-purple-400" />
            <p className="mt-4 text-sm text-slate-400">Total referrals</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {referralTotals.totalReferrals || 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {Number(referralTotals.totalRewards || 0).toFixed(2)} ETB rewarded
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
            <ClipboardList className="h-5 w-5 text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">Task rewards paid</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {totalFor(ledgerTotals, "task_reward").toFixed(2)} ETB
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <p className="mt-4 text-sm text-slate-400">Completed payouts</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {Number(withdrawalTotals.find((item) => item._id === "Completed")?.amount || 0).toFixed(2)} ETB
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Ledger totals</h2>
            <div className="space-y-3">
              {ledgerTotals.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-slate-400">{item._id}</span>
                  <span className="font-semibold text-slate-200">
                    {Number(item.total).toFixed(2)} ETB ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Payout totals</h2>
            <div className="space-y-3">
              {withdrawalTotals.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-slate-400">{item._id}</span>
                  <span className="font-semibold text-slate-200">
                    {Number(item.amount).toFixed(2)} ETB ({item.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Recent audit activity</h2>
          <div className="space-y-3">
            {(report?.recentAuditLogs || []).map((log) => (
              <div key={log._id} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-300">{log.action}</span>
                <span className="text-right text-slate-500">
                  {log.adminId?.name || "Admin"} ·{" "}
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {report && !report.recentAuditLogs?.length && (
              <p className="text-sm text-slate-500">No audit activity yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
