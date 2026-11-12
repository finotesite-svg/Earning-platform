import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Check,
  ClipboardList,
  Users,
  X,
} from "lucide-react";

function totalFor(items, id) {
  return Number(items.find((item) => item._id === id)?.total || 0);
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([API.get("/admin/reports/financial"), API.get("/admin/deposits")])
      .then(([reportResponse, depositsResponse]) => {
        setReport(reportResponse.data);
        setDeposits(depositsResponse.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load reports."),
      );
  }, []);

  const ledgerTotals = report?.ledgerTotals || [];
  const withdrawalTotals = report?.withdrawalTotals || [];
  const referralTotals = report?.referralTotals || {};
  const kpis = report?.kpis || {};

  const updateDeposit = async (id, status) => {
    try {
      await API.patch(`/admin/deposits/${id}`, { status });
      setDeposits((current) =>
        current.map((deposit) =>
          deposit._id === id ? { ...deposit, status } : deposit,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update deposit.");
    }
  };

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

        <section>
          <h2 className="mb-4 text-lg font-bold text-white">
            Deposit and withdrawal KPIs
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {["daily", "weekly", "monthly", "overall"].map((period) => {
              const values = kpis[period] || {};
              return (
                <div
                  key={period}
                  className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-5"
                >
                  <p className="font-semibold capitalize text-white">{period}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2">
                        <ArrowDownToLine className="h-4 w-4 text-emerald-400" />
                        Deposits
                      </span>
                      <span className="font-bold text-emerald-400">
                        {Number(values.deposits?.amount || 0).toFixed(2)} ETB
                      </span>
                    </p>
                    <p className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-2">
                        <ArrowUpFromLine className="h-4 w-4 text-amber-400" />
                        Withdrawals
                      </span>
                      <span className="font-bold text-amber-400">
                        {Number(values.withdrawals?.amount || 0).toFixed(2)} ETB
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {values.deposits?.count || 0} deposits ·{" "}
                      {values.withdrawals?.count || 0} withdrawals
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">
            Pending deposits ({deposits.filter((item) => item.status === "Pending").length})
          </h2>
          <div className="space-y-3">
            {deposits.filter((item) => item.status === "Pending").map((deposit) => (
              <div
                key={deposit._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-[#0B132B] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="text-sm">
                  <p className="font-semibold text-white">
                    {deposit.userId?.name || "User"} · {Number(deposit.amount).toFixed(2)} ETB
                  </p>
                  <p className="text-slate-400">
                    {deposit.paymentMethod} · {deposit.reference}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateDeposit(deposit._id, "Approved")}
                    className="inline-flex items-center rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDeposit(deposit._id, "Rejected")}
                    className="inline-flex items-center rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
            {report && !deposits.some((item) => item.status === "Pending") && (
              <p className="text-sm text-slate-500">No pending deposits.</p>
            )}
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
