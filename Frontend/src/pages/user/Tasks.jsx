import { useCallback, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import TaskSubmitModal from "../../components/TaskSubmitModal";
import API from "../../services/api";
import { Award, CheckSquare, Clock, Flame, Gift, Sparkles } from "lucide-react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastClaimAt, setLastClaimAt] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async () => {
    try {
      const [tasksResponse, submissionsResponse, profileResponse] =
        await Promise.all([
          API.get("/tasks"),
          API.get("/tasks/submissions/mine"),
          API.get("/users/me"),
        ]);
      const profile = profileResponse.data.user || profileResponse.data;
      setTasks(tasksResponse.data);
      setSubmissions(submissionsResponse.data);
      setBalance(Number(profile.balance || 0));
      setStreak(Number(profile.dailyStreak || 0));
      setLastClaimAt(profile.lastDailyClaimAt || null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingTime = lastClaimAt && currentTime
    ? new Date(lastClaimAt).getTime() + 24 * 60 * 60 * 1000 - currentTime
    : 0;
  const timeLeft =
    remainingTime > 0
      ? `${Math.floor(remainingTime / 3_600_000)
          .toString()
          .padStart(2, "0")}:${Math.floor((remainingTime % 3_600_000) / 60_000)
          .toString()
          .padStart(2, "0")}:${Math.floor((remainingTime % 60_000) / 1000)
          .toString()
          .padStart(2, "0")}`
      : "";

  const handleDailyClaim = async () => {
    setError("");
    setNotice("");
    setClaimLoading(true);
    try {
      const { data } = await API.post("/users/daily-claim");
      setBalance(Number(data.user.balance));
      setStreak(Number(data.user.dailyStreak));
      setLastClaimAt(data.user.lastDailyClaimAt);
      setNotice(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to claim daily bonus.");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleSubmitSuccess = (taskId, submission) => {
    setSubmissions((current) => [
      submission || { taskId, status: "Pending", _id: `${taskId}-${Date.now()}` },
      ...current,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-gradient-to-r from-[#1C2541] to-[#0B132B] rounded-3xl p-6 md:p-8 border border-slate-700/60 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} Day Streak</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Earning Tasks
            </h1>
            <p className="text-slate-400 text-sm">
              Claim your daily reward and submit proof for available tasks.
            </p>
          </div>
          <div className="bg-[#0B132B]/80 px-6 py-4 rounded-2xl border border-slate-700/60">
            <p className="text-xs text-slate-400">Current Balance</p>
            <p className="text-xl font-bold text-white">{balance.toFixed(2)} ETB</p>
          </div>
        </div>

        {(error || notice) && (
          <div
            className={`p-4 rounded-xl text-sm ${
              error
                ? "bg-red-500/10 border border-red-500/50 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/50 text-emerald-400"
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="bg-[#1C2541] rounded-3xl p-6 md:p-8 border border-slate-700/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider">
              Daily Reward
            </span>
            <h2 className="text-xl font-bold text-white flex items-center mt-2">
              <Sparkles className="w-5 h-5 text-amber-400 mr-2" />
              Claim your daily bonus
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Rewards are credited by the server once every 24 hours.
            </p>
          </div>
          <button
            onClick={handleDailyClaim}
            disabled={claimLoading || currentTime === null || Boolean(timeLeft)}
            className="w-full md:w-auto bg-[#00A86B] disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold px-8 py-4 rounded-2xl transition flex items-center justify-center"
          >
            {claimLoading ? (
              "Claiming..."
            ) : currentTime === null ? (
              "Checking daily reward..."
            ) : timeLeft ? (
              <>
                <Clock className="w-5 h-5 mr-2" /> Next claim in {timeLeft}
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" /> Claim Daily Bonus
              </>
            )}
          </button>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center">
            <CheckSquare className="w-5 h-5 text-[#00A86B] mr-2" />
            Available Tasks
          </h2>
          {loading ? (
            <p className="text-center py-8 text-slate-400">Loading tasks...</p>
          ) : tasks.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => {
                const taskId = String(task._id || task.id);
                const submission = submissions.find(
                  (item) => String(item.taskId?._id || item.taskId) === taskId,
                );
                const status = submission?.status;
                return (
                  <article
                    key={taskId}
                    className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-3">
                      <span className="bg-emerald-500/10 text-[#00A86B] border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center">
                        <Award className="w-3.5 h-3.5 mr-1" />
                        {Number(task.reward).toFixed(2)} ETB
                      </span>
                      <h3 className="font-bold text-white">{task.title}</h3>
                      <p className="text-sm text-slate-400">
                        {task.instructions || task.description}
                      </p>
                      {task.link && (
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#00A86B] underline break-all"
                        >
                          Open task
                        </a>
                      )}
                    </div>
                    {status === "Approved" ? (
                      <button disabled className="bg-slate-800 text-slate-400 py-3 rounded-xl">
                        Approved
                      </button>
                    ) : status === "Pending" ? (
                      <button disabled className="bg-slate-800 text-slate-400 py-3 rounded-xl">
                        Pending review
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3 rounded-xl"
                      >
                        {status === "Rejected" ? "Resubmit proof" : "Submit proof"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-400">No active tasks right now.</p>
          )}
        </section>
      </main>
      {selectedTask && (
        <TaskSubmitModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
