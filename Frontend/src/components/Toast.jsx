import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ type = "success", message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-[#1C2541] border border-slate-700 text-white px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      {type === "success" ? (
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#00A86B] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
      )}

      <div className="text-sm font-medium pr-4">{message}</div>

      <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
