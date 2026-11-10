import { useState } from "react";
import { History, ArrowUpRight, Gift, CheckCircle2, Clock } from "lucide-react";

export default function TransactionHistory() {
  const [transactions] = useState([
    {
      id: 1,
      type: "Daily Check-in",
      amount: "+50.00 ETB",
      method: "Bonus",
      status: "Completed",
      date: "2026-10-24 10:30",
    },
    {
      id: 2,
      type: "Withdrawal",
      amount: "-150.00 ETB",
      method: "Telebirr",
      status: "Pending",
      date: "2026-10-23 15:45",
    },
    {
      id: 3,
      type: "Task Reward",
      amount: "+30.00 ETB",
      method: "Task",
      status: "Completed",
      date: "2026-10-22 09:15",
    },
  ]);

  return (
    <div className="bg-[#1C2541] rounded-3xl p-6 md:p-8 border border-slate-700/50 space-y-6 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center">
          <History className="w-5 h-5 text-[#00A86B] mr-2" />
          Transaction & Activity History
        </h2>
        <span className="text-xs text-slate-400 bg-[#0B132B] px-3 py-1 rounded-full border border-slate-700/60">
          Recent Activities
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0B132B] text-xs uppercase text-slate-400 border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3 rounded-l-xl">Type</th>
              <th className="px-4 py-3">Method / Source</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-xl">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                <td className="px-4 py-4 font-medium text-white flex items-center space-x-2">
                  {tx.type.includes("Withdrawal") ? (
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#00A86B] flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                  )}
                  <span>{tx.type}</span>
                </td>
                <td className="px-4 py-4 text-slate-400">{tx.method}</td>
                <td
                  className={`px-4 py-4 font-bold ${tx.amount.startsWith("+") ? "text-[#00A86B]" : "text-red-400"}`}
                >
                  {tx.amount}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium ${
                      tx.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {tx.status === "Completed" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-400 text-xs">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
