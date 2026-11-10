import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import API from "../../services/api";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default function SubmissionsReview() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/submissions")
      .then(({ data }) => setSubmissions(data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load submissions."),
      );
  }, []);

  const handleAction = async (id, newStatus) => {
    setError("");
    try {
      const { data } = await API.put(`/admin/submissions/${id}`, {
        status: newStatus,
      });
      setSubmissions((current) =>
        current.map((sub) =>
          (sub._id || sub.id) === id
            ? { ...sub, status: data.submission.status }
            : sub,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to review submission.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-[#1C2541] rounded-2xl p-6 border border-slate-700/50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ClipboardCheck className="w-6 h-6 text-[#00A86B] mr-2" />
              Task Submissions Review
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review user task proofs and approve rewards.
            </p>
          </div>
        </div>

        <div className="bg-[#1C2541] rounded-2xl border border-slate-700/50 overflow-hidden">
          {error && (
            <p className="p-4 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/30 text-slate-400 text-sm">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Task Title</th>
                  <th className="p-4 font-semibold">Proof / Link</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-sm">
                {submissions.map((sub) => (
                  <tr                   key={sub._id || sub.id} className="hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium text-white">
                      {sub.userId?.name || sub.userId?.phone || "User"}
                    </td>
                    <td className="p-4 text-slate-300">{sub.taskId?.title || "Task"}</td>
                    <td className="p-4">
                      <a
                        href={sub.evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00A86B] hover:underline inline-flex items-center text-xs"
                      >
                        View Proof <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.status === "Approved"
                            ? "bg-emerald-500/10 text-[#00A86B] border border-emerald-500/20"
                            : sub.status === "Rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {sub.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(sub._id || sub.id, "Approved")}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00A86B] px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{" "}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(sub._id || sub.id, "Rejected")}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
