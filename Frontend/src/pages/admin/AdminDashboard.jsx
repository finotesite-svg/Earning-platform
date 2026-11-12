import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  Users,
  CheckSquare,
  Wallet,
  ArrowUpRight,
  ClipboardCheck,
  RefreshCw,
  Settings,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    API.get("/admin/overview")
      .then(({ data }) => {
        if (isCurrent) setOverview(data);
      })
      .catch((err) => {
        if (isCurrent) {
          setError(
            err.response?.data?.message ||
              "Unable to load platform statistics.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshKey]);

  const refreshOverview = () => {
    setIsLoading(true);
    setError("");
    setRefreshKey((key) => key + 1);
  };

  const submissions = overview?.recentSubmissions || [];
  const withdrawals = overview?.recentWithdrawals || [];
  const queue = [
    ...submissions.map((submission) => ({
      id: submission._id,
      type: "Task review",
      name: submission.userId?.name || "Unknown member",
      detail: submission.taskId?.title || "Task submission",
      createdAt: submission.createdAt,
      to: "/admin/submissions",
    })),
    ...withdrawals.map((withdrawal) => ({
      id: withdrawal._id,
      type: "Withdrawal",
      name: withdrawal.userId?.name || "Unknown member",
      detail: `${Number(withdrawal.amount || 0).toFixed(2)} ETB requested`,
      createdAt: withdrawal.createdAt,
      to: "/admin/withdrawals",
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 6);

  const stats = [
    {
      label: "Total members",
      value: overview?.totalUsers?.toLocaleString() ?? "—",
      note: "Registered accounts",
      icon: Users,
      color: "text-sky-700 bg-sky-50",
      to: "/admin/users",
    },
    {
      label: "Active tasks",
      value: overview?.activeTasks?.toLocaleString() ?? "—",
      note: "Currently available",
      icon: CheckSquare,
      color: "text-emerald-700 bg-emerald-50",
      to: "/admin/tasks",
    },
    {
      label: "Reviews waiting",
      value: overview?.pendingSubmissionCount?.toLocaleString() ?? "—",
      note: "Task submissions",
      icon: ClipboardCheck,
      color: "text-amber-700 bg-amber-50",
      to: "/admin/submissions",
    },
    {
      label: "Payouts waiting",
      value: `${Number(overview?.pendingPayouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`,
      note: `${overview?.pendingWithdrawalCount ?? "—"} requests pending`,
      icon: Wallet,
      color: "text-rose-700 bg-rose-50",
      to: "/admin/withdrawals",
    },
  ];

  return (
    <>
      <Navbar />
    <main className="min-h-screen bg-[#f3f5f1] text-[#18271f]">
      <header className="border-b border-[#dce4dc] bg-white">
        <div className="mx-auto flex max-w-360 flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              Platform / Overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Operations dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              A live view of your members, tasks, and outstanding requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Admin workspace
            </span>
            <button
              type="button"
              onClick={refreshOverview}
              disabled={isLoading}
              aria-label="Refresh dashboard data"
              title="Refresh dashboard data"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-360 space-y-7 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {error && (
          <div
            className="flex flex-col gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={refreshOverview}
              className="inline-flex items-center gap-2 font-semibold hover:underline"
            >
              Try again <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <section
          aria-label="Platform statistics"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map(({ label, value, note, icon: Icon, color, to }) => (
            <Link
              key={label}
              to={to}
              className="group border border-[#dfe5df] border-t-2 border-t-emerald-700 bg-white p-5 transition hover:border-[#bac9bc] hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 truncate text-2xl font-bold tabular-nums text-[#17271f]">
                    {isLoading && !overview ? "..." : value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{note}</p>
                </div>
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 opacity-0 transition group-hover:opacity-100">
                Open <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <div className="min-w-0 border border-[#dfe5df] bg-white">
            <div className="flex items-center justify-between border-b border-[#e7ece7] px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-bold text-[#18271f]">Needs attention</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest pending reviews and withdrawal requests
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                {isLoading && !overview ? "..." : queue.length} latest
              </span>
            </div>

            {queue.length > 0 ? (
              <ul className="divide-y divide-[#edf0ed]">
                {queue.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      to={item.to}
                      className="flex min-w-0 items-center gap-3 px-5 py-4 transition hover:bg-[#f8faf8] sm:gap-4 sm:px-6"
                    >
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.type === "Withdrawal" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {item.type === "Withdrawal" ? (
                          <Wallet className="h-4 w-4" />
                        ) : (
                          <ClipboardCheck className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate text-sm font-semibold text-[#18271f]">
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.type}
                          </span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-500">
                          {item.detail}
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-xs tabular-nums text-slate-400 sm:block">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-[#18271f]">
                  {isLoading ? "Loading requests" : "You're all caught up"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isLoading
                    ? "Pending items will appear here."
                    : "There are no pending reviews or payouts."}
                </p>
              </div>
            )}
          </div>

          <div className="border border-[#dfe5df] bg-white">
            <div className="border-b border-[#e7ece7] px-5 py-4 sm:px-6">
              <h2 className="font-bold text-[#18271f]">Workspace</h2>
              <p className="mt-1 text-xs text-slate-500">
                Jump into a management area
              </p>
            </div>
            <nav
              aria-label="Admin workspace"
              className="divide-y divide-[#edf0ed]"
            >
              {[
                {
                  label: "Review submissions",
                  detail: "Approve or reject task work",
                  to: "/admin/submissions",
                  icon: ClipboardCheck,
                },
                {
                  label: "Process withdrawals",
                  detail: "Review member payout requests",
                  to: "/admin/withdrawals",
                  icon: Wallet,
                },
                {
                  label: "Manage members",
                  detail: "Accounts and access",
                  to: "/admin/users",
                  icon: Users,
                },
                {
                  label: "Manage tasks",
                  detail: "Create and maintain tasks",
                  to: "/admin/tasks",
                  icon: CheckSquare,
                },
                {
                  label: "Platform settings",
                  detail: "Fees, bonuses, and limits",
                  to: "/admin/settings",
                  icon: Settings,
                },
                {
                  label: "Financial reports",
                  detail: "Ledger, referrals, and audit activity",
                  to: "/admin/reports",
                  icon: BarChart3,
                },
              ].map(({ label, detail, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 px-5 py-4 transition hover:bg-[#f8faf8] sm:px-6"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-800" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#18271f]">
                      {label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {detail}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-emerald-800" />
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
