import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";
import { Users, Copy, Share2, UserCheck, Calendar } from "lucide-react";

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/users/referrals")
      .then(({ data }) => setReferredUsers(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load referrals."),
      );
  }, []);

  const referralCode = user?.referralCode || "";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 text-[#00A86B] mr-2" />
              Referral Program
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Invite friends and earn commission for every active referral.
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-[#00A86B] font-semibold text-sm">
            Total Referrals: {referredUsers.length}
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-[#00A86B]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Share Your Link</h2>
              <p className="text-slate-400 text-sm">
                Copy your unique link and share it with your friends and
                network.
              </p>
            </div>
          </div>

          {!referralCode ? (
            <p className="text-sm text-slate-400">Your referral code is not available yet.</p>
          ) : <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-slate-300 text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto bg-[#00A86B] hover:bg-[#00915c] text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center whitespace-nowrap cursor-pointer shadow-lg shadow-[#00A86B]/20"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>}
        </div>

        {/* Referred Users List Table */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center">
            <UserCheck className="w-5 h-5 text-[#00A86B] mr-2" />
            Your Referred Users
          </h2>

          {error ? (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          ) : referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">#</th>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Phone Number</th>
                    <th className="py-3 px-4 font-semibold">Date Joined</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Reward Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-sm">
                  {referredUsers.map((item, index) => (
                    <tr
                      key={item._id || item.id}
                      className="hover:bg-slate-800/30 transition"
                    >
                      <td className="py-4 px-4 text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {item.referredUserId?.name || "User"}
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-mono">
                        {item.referredUserId?.phone}
                      </td>
                      <td className="py-4 px-4 text-slate-400 flex items-center mt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-[#00A86B]">
                        {Number(item.reward || 0).toFixed(2)} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>No referrals yet. Start sharing your link to earn rewards!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
