import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

export default function SystemSettings() {
  const [minWithdrawal, setMinWithdrawal] = useState("200");
  const [referralBonus, setReferralBonus] = useState("50");
  const [dailyBonus, setDailyBonus] = useState("50");
  const [platformFee, setPlatformFee] = useState("5");
  const [rechargeAccounts, setRechargeAccounts] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/admin/settings")
      .then(({ data }) => {
        setMinWithdrawal(String(data.minWithdrawal));
        setReferralBonus(String(data.referralBonus));
        setDailyBonus(String(data.dailyBonus));
        setPlatformFee(String(data.platformFee));
        setRechargeAccounts(data.rechargeAccounts || []);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load settings."),
      );
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      await API.put("/admin/settings", {
        minWithdrawal,
        referralBonus,
        dailyBonus,
        platformFee,
        rechargeAccounts,
      });
      setSuccess("System settings updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRechargeAccounts = async () => {
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const { data } = await API.put("/admin/recharge-accounts", {
        rechargeAccounts,
      });
      setRechargeAccounts(data.rechargeAccounts || []);
      setSuccess("Recharge accounts saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save recharge accounts.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-[#00A86B]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              System Settings & Configurations
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage global platform limits, referral bonuses, and fees.
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl text-sm flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-[#1C2541] rounded-2xl p-6 md:p-8 border border-slate-700/50">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minimum Withdrawal (ETB)
                </label>
                <input
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Referral Reward Bonus (ETB)
                </label>
                <input
                  type="number"
                  value={referralBonus}
                  onChange={(e) => setReferralBonus(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Daily Bonus (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyBonus}
                  onChange={(e) => setDailyBonus(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Platform Fee (%)
                </label>
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00A86B] hover:bg-[#00915c] disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-xl transition flex items-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        <section className="rounded-2xl border border-slate-700/50 bg-[#1C2541] p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Recharge Accounts</h2>
              <p className="mt-1 text-sm text-slate-400">
                These accounts are shown to users when they select Recharge.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setRechargeAccounts((accounts) => [
                  ...accounts,
                  {
                    method: "telebirr",
                    accountNumber: "",
                    accountName: "",
                    logo: "",
                  },
                ])
              }
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <div className="space-y-4">
            {rechargeAccounts.map((account, index) => (
              <div
                key={`${account._id || "new"}-${index}`}
                className="grid gap-3 rounded-xl border border-slate-700/60 bg-[#0B132B] p-4 md:grid-cols-[160px_1fr_1fr_1fr_auto]"
              >
                <select
                  value={account.method}
                  onChange={(event) =>
                    setRechargeAccounts((accounts) =>
                      accounts.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, method: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-[#1C2541] px-3 py-2 text-sm text-white"
                >
                  <option value="telebirr">Telebirr</option>
                  <option value="bank">CBE</option>
                </select>
                <input
                  value={account.accountNumber}
                  onChange={(event) =>
                    setRechargeAccounts((accounts) =>
                      accounts.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, accountNumber: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Account number or phone"
                  className="rounded-lg border border-slate-700 bg-[#1C2541] px-3 py-2 text-sm text-white placeholder-slate-500"
                />
                <input
                  value={account.accountName || ""}
                  onChange={(event) =>
                    setRechargeAccounts((accounts) =>
                      accounts.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, accountName: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Account holder name (optional)"
                  className="rounded-lg border border-slate-700 bg-[#1C2541] px-3 py-2 text-sm text-white placeholder-slate-500"
                />
                <div className="flex items-center gap-2">
                  {account.logo && (
                    <img
                      src={account.logo}
                      alt={`${account.method} logo preview`}
                      className="h-10 w-10 rounded-lg object-contain"
                    />
                  )}
                  <label className="flex-1 cursor-pointer rounded-lg border border-slate-700 bg-[#1C2541] px-3 py-2 text-center text-sm text-slate-300 hover:border-emerald-500">
                    {account.logo ? "Change logo" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 500 * 1024) {
                          setError("Each payment logo must be 500 KB or smaller.");
                          event.target.value = "";
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () =>
                          setRechargeAccounts((accounts) =>
                            accounts.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, logo: reader.result }
                                : item,
                            ),
                          );
                        reader.onerror = () =>
                          setError("Unable to read the selected logo.");
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {account.logo && (
                    <button
                      type="button"
                      onClick={() =>
                        setRechargeAccounts((accounts) =>
                          accounts.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, logo: "" } : item,
                          ),
                        )
                      }
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRechargeAccounts((accounts) =>
                      accounts.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10"
                  aria-label="Remove recharge account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {!rechargeAccounts.length && (
              <p className="text-sm text-slate-500">
                No recharge accounts configured. Add one for users to see.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveRechargeAccounts}
            disabled={loading}
            className="mt-6 inline-flex items-center rounded-xl bg-[#00A86B] px-5 py-3 font-bold text-white hover:bg-[#00915c] disabled:opacity-60"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? "Saving..." : "Save Recharge Accounts"}
          </button>
        </section>
      </main>
    </div>
  );
}
