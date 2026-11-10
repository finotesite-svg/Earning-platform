import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { useAuth } from "../../context/useAuth";
import {
  Wallet,
  ArrowUpRight,
  ArrowRight,
  CheckSquare,
  Users,
  X,
  Loader2,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(Number(user?.balance || 0));
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // አዲስ የተጨመሩ ስቴቶች (Method እና Account Number)
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    API.get("/users/me")
      .then(({ data }) => setBalance(Number((data.user || data).balance || 0)))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Unable to load your balance."),
      )
      .finally(() => setIsLoadingBalance(false));
  }, []);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      setMessage("እባክዎ ትክክለኛ መጠን ያስገቡ።");
      return;
    }

    if (amount > balance) {
      setMessage("ቀሪ ሂሳብዎ በቂ አይደለም!");
      return;
    }

    if (!accountNumber) {
      setMessage(
        paymentMethod === "telebirr"
          ? "እባክዎ የቴሌብር ስልክ ቁጥርዎን ያስገቡ።"
          : "እባክዎ የባንክ አካውንት ቁጥርዎን ያስገቡ።",
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/withdrawal/request", {
        amount,
        paymentMethod,
        accountNumber,
      });
      setBalance(Number(data.balance));
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      setAccountNumber("");
      setPaymentMethod("telebirr");
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to request withdrawal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2541] to-[#182744] rounded-3xl p-6 md:p-10 border border-slate-700/50">
          <div className="absolute -right-12 -top-20 w-64 h-64 rounded-full bg-[#00A86B]/10 blur-3xl pointer-events-none" />
          <div>
            <p className="text-[#00A86B] text-sm font-semibold tracking-wide uppercase mb-3">
              Your earning dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Welcome back, {user?.name || "User"}!
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-3 max-w-xl">
              Complete tasks, invite friends, and keep track of your earnings—all
              from one place.
            </p>
          </div>
          <Link
            to="/tasks"
            className="relative mt-6 inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#00915c] text-white font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-[#00A86B]/20"
          >
            Explore tasks <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        <section aria-label="Account overview" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#1C2541] p-6 rounded-2xl border border-slate-700/50 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Available balance</p>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#00A86B]">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mt-4">
                {isLoadingBalance ? "Loading..." : `${balance.toFixed(2)} ETB`}
              </p>
            </div>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="w-full bg-slate-800/70 hover:bg-slate-700/70 text-white font-semibold px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Withdraw funds <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/tasks"
            className="group bg-[#1C2541] p-6 rounded-2xl border border-slate-700/50 hover:border-[#00A86B]/50 transition flex flex-col justify-between gap-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-white">Earn with tasks</p>
                <p className="text-sm text-slate-400 mt-2">
                  Find available tasks and earn rewards for completed work.
                </p>
              </div>
              <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#00A86B]">
              Browse tasks <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to="/referrals"
            className="group bg-[#1C2541] p-6 rounded-2xl border border-slate-700/50 hover:border-[#00A86B]/50 transition flex flex-col justify-between gap-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-white">Invite friends</p>
                <p className="text-sm text-slate-400 mt-2">
                  Share your referral link and grow your earning community.
                </p>
              </div>
              <div className="w-11 h-11 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#00A86B]">
              View referrals <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
      </main>

      {/* Withdraw Modal Popup */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1C2541] border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Wallet className="w-5 h-5 text-[#00A86B] mr-2" /> Request
                Withdrawal
              </h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {message && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                  {message}
                </div>
              )}

              <div className="bg-[#0B132B] p-4 rounded-xl border border-slate-700/60 flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  Available Balance:
                </span>
                <span className="font-bold text-emerald-400 text-lg">
                  {balance.toFixed(2)} ETB
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setAccountNumber(""); // ዘዴውን ሲቀይር የቁጥር ፊልዱን ባዶ ለማድረግ
                  }}
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B]"
                >
                  <option value="telebirr">Telebirr</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              {/* Conditional Input based on Selection */}
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  {paymentMethod === "telebirr"
                    ? "Telebirr Phone Number"
                    : "Bank Account Number"}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    paymentMethod === "telebirr"
                      ? "e.g. 0912345678"
                      : "e.g. 1000123456789"
                  }
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">
                  Amount to Withdraw (ETB)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-[#0B132B] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-[#00A86B]/20 flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirm Withdrawal"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
