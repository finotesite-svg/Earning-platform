import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import { useAuth } from "../../context/useAuth";
import {
  User,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const { login, user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await API.get("/users/me");
        const profile = response.data.user || response.data;
        setName(profile.name || "");
        setPhone((profile.phone || "").replace(/^\+251/, ""));
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load profile.");
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !phone) {
      setError("Name and phone number cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+251${phone.replace(/^0/, "")}`;
      const profileResponse = await API.patch("/users/me", {
        name,
        phone: phoneNumber,
      });
      const updatedUser = profileResponse.data.user || profileResponse.data;

      if (currentPassword && newPassword) {
        await API.patch("/users/me/password", {
          currentPassword,
          newPassword,
        });
      }

      login({ ...user, ...updatedUser }, localStorage.getItem("token"));
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex items-center space-x-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-[#00A86B] text-2xl font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Profile Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Update your personal details and security settings.
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

        {/* Form Section */}
        <div className="bg-[#1C2541] rounded-2xl p-6 md:p-8 border border-slate-700/50">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>

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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent py-3 px-4 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-700/50" />

            <h2 className="text-lg font-bold text-white flex items-center">
              <Lock className="w-5 h-5 text-[#00A86B] mr-2" />
              Change Password
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00A86B] hover:bg-[#00915c] text-white font-bold px-6 py-3.5 rounded-xl transition flex items-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
