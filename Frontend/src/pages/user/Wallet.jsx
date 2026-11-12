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
  Copy,
  X,
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
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [rechargeAccounts, setRechargeAccounts] = useState([]);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [copiedRecharge, setCopiedRecharge] = useState("");
  const [rechargeError, setRechargeError] = useState("");
  const approvedPaymentAccounts = paymentAccounts.filter(
    (account) => account.status === "Approved",
  );

  useEffect(() => {
    if (!approvedPaymentAccounts.length) return;
    const firstAccount = approvedPaymentAccounts[0];
    setPaymentMethod(firstAccount.method);
    setAccountNumber(firstAccount.accountNumber);
  }, [paymentAccounts]);

  const loadRechargeAccounts = async () => {
    try {
      const { data } = await API.get("/users/recharge-accounts");
      setRechargeAccounts(
        Array.isArray(data) ? data : data.rechargeAccounts || [],
      );
      setRechargeError("");
    } catch (err) {
      setRechargeAccounts([]);
      setRechargeError(
        err.response?.data?.message || "Unable to load recharge accounts.",
      );
    }
  };

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const profileResponse = await API.get("/users/me");
        const profile = profileResponse.data.user || profileResponse.data;
        setBalance(Number(profile.balance || 0));
        try {
          const withdrawalsResponse = await API.get("/withdrawal/my-requests");
          setWithdrawals(withdrawalsResponse.data);
        } catch (err) {
          setWithdrawals([]);
          setErrorMsg(
            err.response?.data?.message ||
              "Unable to load withdrawal history.",
          );
        }
        try {
          const paymentResponse = await API.get("/users/me/payment-accounts");
          setPaymentAccounts(paymentResponse.data);
        } catch {
          setPaymentAccounts([]);
        }
        await loadRechargeAccounts();
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
      setErrorMsg("Please select an approved payment account in your profile.");
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

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-24 sm:px-6 md:pb-8">
        {/* Header Section */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <WalletIcon className="w-6 h-6 text-[#00A86B] mr-2" />
              My Wallet & Withdrawals
            </h1>
          
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-[#00A86B] font-bold text-base">
            Balance: {balance.toFixed(2)} ETB
          </div>
          <button
            type="button"
            onClick={async () => {
              setIsRechargeOpen(true);
              await loadRechargeAccounts();
            }}
            className="rounded-xl bg-[#00A86B] px-4 py-2 font-bold text-white hover:bg-[#00915c]"
          >
            Recharge
          </button>
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
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    const firstAccount = approvedPaymentAccounts.find(
                      (account) => account.method === e.target.value,
                    );
                    setAccountNumber(firstAccount?.accountNumber || "");
                  }}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                >
                  {["telebirr", "bank"].map((method) => (
                    <option
                      key={method}
                      value={method}
                      disabled={!approvedPaymentAccounts.some((account) => account.method === method)}
                    >
                      {method === "telebirr" ? "Telebirr" : "Bank Transfer (CBE)"}
                      {!approvedPaymentAccounts.some((account) => account.method === method)
                        ? " (not approved)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {approvedPaymentAccounts.some((account) => account.method === paymentMethod) && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Saved Account
                  </label>
                  <select
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/60 bg-[#0B132B] px-4 py-3 text-white focus:outline-none focus:border-[#00A86B]"
                  >
                    {approvedPaymentAccounts
                      .filter((account) => account.method === paymentMethod)
                      .map((account) => (
                        <option key={account._id} value={account.accountNumber}>
                         {account.accountNumber}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {!approvedPaymentAccounts.length && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                  Add a payment account in your profile .
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !approvedPaymentAccounts.length}
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
      {isRechargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#1C2541] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Recharge Account</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Send money to one of these accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRechargeOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Close recharge dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {rechargeError && (
                <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
                  {rechargeError}
                </p>
              )}
              {rechargeAccounts.map((account) => (
                <div
                  key={account._id || `${account.method}-${account.accountNumber}`}
                  className="rounded-xl border border-slate-700/60 bg-[#0B132B] p-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                      {account.logo ? (
                        <img
                          src={account.logo}
                          alt={`${account.method} logo`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#00A86B]">
                          {account.method === "telebirr" ? "TB" : "CBE"}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-[#00A86B]">
                      {account.method === "telebirr" ? "Telebirr" : "CBE"}
                    </p>
                  </div>
                  <p className="mt-2 break-all font-mono text-lg text-white">
                    {account.accountNumber}
                  </p>
                  {account.accountName && (
                    <p className="mt-1 text-sm text-slate-400">
                      Account name: {account.accountName}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(account.accountNumber);
                      setCopiedRecharge(
                        account._id || `${account.method}-${account.accountNumber}`,
                      );
                      window.setTimeout(() => setCopiedRecharge(""), 2000);
                    }}
                    className="mt-3 inline-flex items-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {copiedRecharge ===
                    (account._id || `${account.method}-${account.accountNumber}`)
                      ? "Copied"
                      : "Copy account"}
                  </button>
                </div>
              ))}
              {!rechargeAccounts.length && (
                <p className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-300">
                  No recharge account has been configured .
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
