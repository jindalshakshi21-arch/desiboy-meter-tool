import { useLocation } from "wouter";
import { ChevronLeft, Trash2, ClipboardList } from "lucide-react";
import { useReadings } from "@/context/ReadingsContext";
import WarningBanner from "@/components/WarningBanner";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    "  " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ReadingHistory() {
  const [, navigate] = useLocation();
  const { readings, deleteReading } = useReadings();

  return (
    <div className="app-container flex flex-col min-h-dvh">
      <WarningBanner />
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-primary text-sm font-semibold">
          <ChevronLeft className="w-4 h-4" /> DESIBOY
        </button>
        <span className="text-sm font-bold text-foreground">Saved Readings</span>
        <div className="w-20" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {readings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Koi reading save nahi hui</p>
            <p className="text-xs text-muted-foreground text-center">
              Meter reading page se "Save Reading" button dabao
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Meter Select Karein
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground text-right mb-1">{readings.length} reading{readings.length > 1 ? "s" : ""} saved</p>
            {readings.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Vendor</p>
                    <p className="text-sm font-bold text-foreground">{r.vendor}</p>
                  </div>
                  <button
                    onClick={() => deleteReading(r.id)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-muted/50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">kWh Reading</p>
                    <p className="text-lg font-bold text-primary font-mono">
                      {r.kwh || <span className="text-muted-foreground text-sm font-normal">—</span>}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">MD Reading</p>
                    <p className="text-lg font-bold text-primary font-mono">
                      {r.md || <span className="text-muted-foreground text-sm font-normal">—</span>}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{formatDate(r.savedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground bg-white">
        © 2026 DESIBOY. All Rights Reserved.
      </footer>
    </div>
  );
}
