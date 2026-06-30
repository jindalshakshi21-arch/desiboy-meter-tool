import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function WarningBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative z-50 flex items-start gap-3 px-4 py-3 text-sm font-medium animate-in slide-in-from-top duration-300"
      style={{
        background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)",
        borderBottom: "2px solid #f87171",
        boxShadow: "0 4px 20px rgba(239,68,68,0.35)",
      }}
    >
      {/* Pulse dot */}
      <span className="relative flex h-3 w-3 shrink-0 mt-0.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300" />
      </span>

      <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        <p className="text-red-100 font-bold text-xs tracking-wide uppercase mb-0.5">
          ⚠️ Server Cost Warning
        </p>
        <p className="text-red-200 text-xs leading-relaxed">
          Is app ko chalate rehne ke liye{" "}
          <span className="font-black text-white bg-red-700 rounded px-1">
            ₹1,800/month
          </span>{" "}
          ka server kharch aata hai. Agar payment band hui toh{" "}
          <span className="font-bold text-yellow-300">
            app server se crash hokar band ho sakti hai
          </span>
          . Kripya apna support dijiye! 🙏
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
        aria-label="Close warning"
      >
        <X className="w-3.5 h-3.5 text-red-300" />
      </button>
    </div>
  );
}
