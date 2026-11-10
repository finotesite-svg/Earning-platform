import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";
import { Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    let inputVal = e.target.value.replace(/\D/g, "");
    if (inputVal.startsWith("0")) {
      inputVal = inputVal.substring(1);
    }
    setPhone(inputVal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{9}$/.test(phone)) {
      setError("Enter a valid 9-digit Ethiopian phone number.");
      return;
    }

    setLoading(true);
    const fullPhoneNumber = `+251${phone}`;

    try {
      const response = await API.post("/auth/login", {
        phone: fullPhoneNumber,
        password,
      });
      login(response.data.user, response.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4 py-8">
      <div className="max-w-md w-full bg-[#1C2541] rounded-2xl shadow-2xl p-8 border border-slate-700/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Login
          </h1>
          <p className="text-slate-400 font-medium mt-1 text-sm">
            Welcome back to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative flex items-center bg-[#0B132B] border border-slate-700/60 rounded-xl overflow-hidden focus-within:border-[#00A86B] transition">
              <div className="flex items-center pl-4 pr-2 text-slate-300 font-semibold select-none border-r border-slate-700/60 py-3.5 bg-slate-800/30">
                <Phone className="w-5 h-5 text-slate-400 mr-2" />
                <span>+251</span>
              </div>
              <input
                type="tel"
                required
                maxLength={9}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="911234567"
                className="w-full bg-transparent py-3.5 px-3 text-white placeholder-slate-500 focus:outline-none text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3.5 pl-12 pr-11 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-lg shadow-[#00A86B]/20 text-base cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6 font-normal">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#00A86B] font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
