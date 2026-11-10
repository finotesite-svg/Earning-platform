import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  LifeBuoy,
  Bell,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";

export default function Support() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get("/support/notifications"),
      API.get("/support/tickets"),
    ])
      .then(([notificationResponse, ticketResponse]) => {
        setNotifications(notificationResponse.data);
        setTickets(ticketResponse.data);
      })
      .catch((err) =>
        setError(
          err.response?.data?.message || "Unable to load support information.",
        ),
      );
  }, []);

  const handleMarkAsRead = async (item) => {
    if (item.isRead) return;
    try {
      const { data } = await API.patch(
        `/support/notifications/${item._id || item.id}/read`,
      );
      setNotifications((current) =>
        current.map((notification) =>
          (notification._id || notification.id) === (item._id || item.id)
            ? data
            : notification,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update notification.");
    }
  };

  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/support/tickets", { subject, message });
      setTickets((current) => [data.ticket, ...current]);
      setSuccess(
        "Support ticket submitted successfully. Our team will contact you soon.",
      );
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit support ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {error && (
          <div
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="flex bg-[#1C2541] p-1.5 rounded-2xl border border-slate-700/50 max-w-xs shadow-lg">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer ${
              activeTab === "notifications"
                ? "bg-[#00A86B] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer ${
              activeTab === "support"
                ? "bg-[#00A86B] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LifeBuoy className="w-4 h-4 mr-2" />
            Support
          </button>
        </div>

        {activeTab === "notifications" ? (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white flex items-center">
              <Bell className="w-5 h-5 text-[#00A86B] mr-2" />
              Platform Notifications
            </h1>

            <div className="space-y-3">
              {notifications.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => handleMarkAsRead(item)}
                  className={`p-5 rounded-2xl border transition cursor-pointer ${
                    item.isRead
                      ? "bg-[#1C2541]/50 border-slate-800 text-slate-400"
                      : "bg-[#1C2541] border-slate-700/60 text-slate-100 shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="font-bold text-white">{item.title}</h2>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-[#1C2541] rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-white flex items-center">
                  <LifeBuoy className="w-5 h-5 text-[#00A86B] mr-2" />
                  Customer Support
                </h1>
                <p className="text-sm text-slate-400">
                  Having trouble? Send us a message and our support team will
                  assist you.
                </p>
              </div>

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl text-sm flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSendTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Payout delay issue or task approval"
                    className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#00A86B] hover:bg-[#00915c] text-white font-bold px-6 py-3.5 rounded-xl transition flex items-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#1C2541] rounded-2xl p-6 md:p-8 border border-slate-700/50 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white">
                Your Submitted Support Tickets
              </h2>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t._id || t.id}
                    className="bg-[#0B132B] p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">
                          {t.subject}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({new Date(t.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{t.message}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center shrink-0">
                      <Clock className="w-3 h-3 mr-1" /> {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
