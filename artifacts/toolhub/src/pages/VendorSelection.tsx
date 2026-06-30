import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, X, Menu, ClipboardList, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReadings } from "@/context/ReadingsContext";
import TirangaLogo from "@/components/TirangaLogo";
import WarningBanner from "@/components/WarningBanner";

const VENDORS = [
  "HPL",
  "Landis",
  "L&T Meter 2",
  "Genus(2nd Meter)",
  "Genus Power (4th Meter)",
  "Bentec Electronics",
  "Saral Measurements",
  "Capital Power Systems",
  "Genus Power",
  "Maxwell",
  "Flash Electronics",
  "LAN",
  "Visontek",
  "Secure",
  "Havells",
  "Elmeasure",
  "Sanchar",
  "Genus Phase 3",
  "L&T Phase 3",
  "Landis Gyr",
];

export default function VendorSelection() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { readings } = useReadings();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (vendor: string) => {
    navigate(`/meter/${encodeURIComponent(vendor)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container" style={{ background: "#f9f5f0" }}>

      {/* Warning Banner */}
      <WarningBanner />

      {/* Saffron Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: "linear-gradient(135deg, #FF9933 0%, #e8831a 100%)" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <TirangaLogo size={32} />
            <div>
              <span className="text-white font-black text-lg tracking-widest leading-none block" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                DESIBOY
              </span>
              <span className="text-white/70 text-[10px] leading-none">Meter Reading Tool</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {menuOpen
                ? <X className="w-5 h-5 text-white" />
                : <Menu className="w-5 h-5 text-white" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-2xl border border-orange-100 z-50 overflow-hidden">
                <div className="px-4 py-3" style={{ background: "linear-gradient(135deg,#fff8f0,#f0fff4)" }}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Logged in as</p>
                  <p className="text-sm font-bold text-foreground truncate mt-0.5">{user?.username ?? "User"}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); navigate("/history"); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" style={{ color: "#FF9933" }} />
                    Saved Readings
                  </span>
                  {readings.length > 0 && (
                    <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FF9933" }}>
                      {readings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 transition-colors border-t border-border"
                  style={{ color: "#dc2626" }}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tricolor ribbon under header */}
        <div className="flex h-1.5">
          <div className="flex-1" style={{ background: "#FF9933" }} />
          <div className="flex-1" style={{ background: "#FFFFFF" }} />
          <div className="flex-1" style={{ background: "#138808" }} />
        </div>
      </header>

      {/* Body */}
      <div className="px-5 py-5">
        <div className="text-center mb-6">
          <h1 className="text-xl font-black tracking-tight" style={{ color: "#1a1a1a" }}>
            Meter Vendor Chunein
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Apne meter ki company select karein aur reading shuru karein
          </p>
          <div className="flex justify-center mt-3">
            <div className="flex w-24 h-1 rounded-full overflow-hidden">
              <div className="flex-1" style={{ background: "#FF9933" }} />
              <div className="flex-1" style={{ background: "#FFFFFF", border: "1px solid #eee" }} />
              <div className="flex-1" style={{ background: "#138808" }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {VENDORS.map((vendor, i) => {
            const accentColor = i % 3 === 0 ? "#FF9933" : i % 3 === 1 ? "#138808" : "#000080";
            return (
              <button
                key={`${vendor}-${i}`}
                onClick={() => handleSelect(vendor)}
                className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl bg-white text-left shadow-sm active:scale-[0.98] transition-all duration-150"
                style={{
                  borderLeft: `4px solid ${accentColor}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ background: accentColor }}
                  >
                    {vendor.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{vendor}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t" style={{ borderColor: "#f0e8e0" }}>
        <div className="flex justify-center mb-2">
          <div className="flex w-16 h-1 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: "#FF9933" }} />
            <div className="flex-1" style={{ background: "#FFFFFF", border: "1px solid #eee" }} />
            <div className="flex-1" style={{ background: "#138808" }} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 DESIBOY. All Rights Reserved.</p>
      </div>
    </div>
  );
}
