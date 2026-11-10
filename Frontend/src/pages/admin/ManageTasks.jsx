import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
  CheckSquare,
  Plus,
  Trash2,
  Award,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";

export default function ManageTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await API.get("/tasks");
        setTasks(response.data.tasks || response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !reward || !link) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await API.post("/admin/tasks", {
        title,
        description: "",
        reward: Number(reward),
        link,
      });
      const newTask = response.data.task || response.data;
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      setTitle("");
      setReward("");
      setLink("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create task.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/admin/tasks/${id}`);
      setTasks((currentTasks) =>
        currentTasks.filter((task) => (task._id || task.id) !== id),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete task.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 p-6 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <CheckSquare className="w-6 h-6 text-[#00A86B] mr-2" />
            Manage Tasks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create new earning tasks or delete outdated tasks for users.
          </p>
        </div>
        <Link
          to="/admin"
          className="bg-[#0B132B] hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm border border-slate-700/60 transition"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Task Form */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Plus className="w-5 h-5 text-[#00A86B] mr-2" />
            Add New Task
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Join Telegram Group"
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reward Amount (ETB)
              </label>
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="50"
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00A86B]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
            >
              Create Task
            </button>
          </form>
        </div>

        {/* Existing Tasks List */}
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 space-y-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white flex items-center">
            <CheckSquare className="w-5 h-5 text-[#00A86B] mr-2" />
            Active Tasks List ({tasks.length})
          </h2>

          {loading && (
            <div className="text-center py-8 text-slate-400">Loading tasks...</div>
          )}

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id || task.id}
                className="bg-[#0B132B] p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center text-[#00A86B] font-semibold">
                      <Award className="w-3.5 h-3.5 mr-1" /> {task.reward}
                    </span>
                    <span className="flex items-center truncate max-w-xs">
                      <LinkIcon className="w-3.5 h-3.5 mr-1" /> {task.link}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task._id || task.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl border border-red-500/30 transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
