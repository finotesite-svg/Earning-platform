import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function SystemSettings() {
  const [minWithdrawal, setMinWithdrawal] = useState("200");
  const [referralBonus, setReferralBonus] = useState("50");
  const [dailyBonus, setDailyBonus] = useState("50");
  const [platformFee, setPlatformFee] = useState("5");
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
      });
      setSuccess("System settings updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update settings.");
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
      </main>
    </div>
  );
}
