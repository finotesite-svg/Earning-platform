import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

export default function Verify() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/verify", {
        code: otp,
        phone: searchParams.get("phone") || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1C2541] rounded-2xl p-8 border border-slate-700/50 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto text-[#00A86B]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Phone Verification</h1>
          <p className="text-slate-400 text-sm">
            Enter the verification code sent to your phone number.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-center text-2xl tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
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
              <>
                Verify Code
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
