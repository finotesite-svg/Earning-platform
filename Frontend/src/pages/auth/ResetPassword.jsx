import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { KeyRound, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Request phone, 2: New password
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone) return;
    setLoading(true);
    try {
      await API.post("/auth/password-reset/request", {
        phone: `+251${phone.replace(/^0/, "")}`,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!code || !newPassword) return;
    setLoading(true);
    try {
      await API.post("/auth/password-reset/confirm", {
        phone: `+251${phone.replace(/^0/, "")}`,
        code,
        newPassword,
      });
      setSuccess("Password updated successfully!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1C2541] rounded-2xl p-8 border border-slate-700/50 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto text-[#00A86B]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm">
            {step === 1
              ? "Enter your phone number to receive a reset code."
              : "Enter your new secure password."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl text-sm flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="flex bg-[#0B132B] border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-[#00A86B]">
                <span className="bg-[#1C2541] text-slate-400 px-3.5 py-3 text-sm font-medium border-r border-slate-700/60 flex items-center">
                  +251
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="911234567"
                  className="w-full bg-transparent py-3 px-4 text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00A86B]/25 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Send Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00A86B]/25 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
