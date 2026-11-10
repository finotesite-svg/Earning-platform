import { useState } from "react";
import API from "../services/api";
import { X, AlertCircle, Loader2 } from "lucide-react";

export default function TaskSubmitModal({ task, onClose, onSubmitSuccess }) {
  const [evidence, setEvidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!evidence) {
      setError("Please provide proof or link of task completion.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/tasks/submit", {
        taskId: task._id || task.id,
        evidence: evidence.trim(),
      });
      onSubmitSuccess(task._id || task.id, data.submission);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit task proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1C2541] border border-slate-700/60 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Submit Task Proof</h2>
          <p className="text-sm text-slate-400 truncate">{task.title}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Proof / Screenshot Link
            </label>
            <textarea
              rows="3"
              required
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Paste your proof link or details here..."
              className="w-full bg-[#0B132B] border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#00A86B]"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-[#00A86B] hover:bg-[#00915c] text-white font-bold py-3 rounded-xl transition flex items-center justify-center shadow-lg shadow-[#00A86B]/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Submit for Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
