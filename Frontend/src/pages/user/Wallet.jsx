import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  History,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const [profileResponse, withdrawalsResponse] = await Promise.all([
          API.get("/users/me"),
          API.get("/withdrawal/my-requests"),
        ]);
        const profile = profileResponse.data.user || profileResponse.data;
        setBalance(Number(profile.balance || 0));
        setWithdrawals(withdrawalsResponse.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || "Unable to load wallet.");
      }
    };

    loadWallet();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMsg("Please enter a valid withdrawal amount.");
      return;
    }

    if (withdrawAmount > balance) {
      setErrorMsg("Insufficient balance for this withdrawal.");
      return;
    }

    if (!accountNumber) {
      setErrorMsg("Please enter your account number or phone.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/withdrawal/request", {
        amount: withdrawAmount,
        paymentMethod,
        accountNumber,
      });
      const newRequest = response.data.withdrawal || response.data;
      setWithdrawals((currentRequests) => [newRequest, ...currentRequests]);
      setBalance(Number(response.data.balance));
      setSuccessMsg("Withdrawal request submitted successfully!");
      setAmount("");
      setAccountNumber("");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Unable to submit withdrawal request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <WalletIcon className="w-6 h-6 text-[#00A86B] mr-2" />
              My Wallet & Withdrawals
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your earnings and request payouts directly to your account.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-[#00A86B] font-bold text-base">
            Balance: {balance.toFixed(2)} ETB
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Request Form */}
          <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-white flex items-center">
              <ArrowUpRight className="w-5 h-5 text-[#00A86B] mr-2" />
              Request Payout
            </h2>

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="telebirr">Telebirr</option>
                  <option value="bank">Bank Transfer (CBE)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {paymentMethod === "telebirr"
                    ? "Telebirr Phone Number"
                    : "Bank Account Number"}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    paymentMethod === "telebirr" ? "911234567" : "1000XXXXXXXXX"
                  }
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Withdraw Funds"
                )}
              </button>
            </form>
          </div>

          {/* Withdrawal History Table */}
          <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-white flex items-center">
              <History className="w-5 h-5 text-[#00A86B] mr-2" />
              Withdrawal History
            </h2>

            {withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/60 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Amount</th>
                      <th className="py-3 px-4 font-semibold">Method</th>
                      <th className="py-3 px-4 font-semibold">Account</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 text-sm">
                    {withdrawals.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="hover:bg-slate-800/30 transition"
                      >
                        <td className="py-4 px-4 font-bold text-white">
                          {item.amount}
                        </td>
                        <td className="py-4 px-4 text-slate-300 flex items-center mt-1">
                          <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                          {item.paymentMethod}
                        </td>
                        <td className="py-4 px-4 text-slate-300 font-mono">
                          {item.accountNumber}
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
                        <td className="py-4 px-4 text-right text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No withdrawal requests made yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
