import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronLeft, ChevronRight, RotateCcw, Save, CheckCircle, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReadings } from "@/context/ReadingsContext";
import WarningBanner from "@/components/WarningBanner";
import html2canvas from "html2canvas";

type TabType = "kwh" | "md";
type PanelType = "filters" | "adjustments";
type ActiveElement = "number" | "unit";

interface FilterState {
  contrast: number;
  brightness: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  invert: number;
  hueRotate: number;
  blur: number;
}

const DEFAULT_FILTERS: FilterState = {
  contrast: 100,
  brightness: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
};

type VendorConfig = { kwh: string[]; md: string[] };

const VENDOR_IMAGES: Record<string, VendorConfig> = {
  "HPL":                    { kwh: ["/meters/hpl1.jpg"],                            md: ["/meters/hpl2.jpg"] },
  "Landis":                 { kwh: ["/meters/landis.jpg"],                          md: ["/meters/landis.jpg"] },
  "L&T Meter 2":            { kwh: ["/meters/lt1.jpg"],                             md: ["/meters/lt2.jpg"] },
  "Genus(2nd Meter)":       { kwh: ["/meters/genus1.jpg"],                          md: ["/meters/genus2.jpg"] },
  "Genus Power (4th Meter)":{ kwh: ["/meters/genus_power1.jpg"],                   md: ["/meters/genus_power2.jpg"] },
  "Genus Power":            { kwh: ["/meters/genus3.png"],                          md: ["/meters/genus3.png"] },
  "Bentec Electronics":     { kwh: ["/meters/bentec1.jpg", "/meters/bentec2.jpg"], md: ["/meters/bentec3.png"] },
  "Saral Measurements":     { kwh: ["/meters/saral1.jpg"],                          md: ["/meters/saral2.jpg"] },
  "Capital Power Systems":  { kwh: ["/meters/cps.png"],                            md: ["/meters/cps.png"] },
  "Secure":                 { kwh: ["/meters/secure.jpg"],                          md: ["/meters/secure2.png"] },
  "Havells":                { kwh: ["/meters/havells.jpg"],                         md: ["/meters/havells.jpg"] },
  "Elmeasure":              { kwh: ["/meters/elmeasure.jpg"],                       md: ["/meters/elmeasure.jpg"] },
  "Sanchar":                { kwh: ["/meters/sanchar.jpg"],                         md: ["/meters/sanchar.jpg"] },
  "Visontek":               { kwh: ["/meters/visontek1.jpg"],                       md: ["/meters/visontek2.jpg"] },
  "Maxwell":                { kwh: ["/meters/maxwell.png"],                         md: ["/meters/maxwell.png"] },
  "Flash Electronics":      { kwh: ["/meters/flash.png"],                           md: ["/meters/flash.png"] },
  "LAN":                    { kwh: ["/meters/lan.png"],                             md: ["/meters/lan.png"] },
  "Genus Phase 3":          { kwh: ["/meters/genus_phase3.jpg"],                    md: ["/meters/genus_phase3.jpg"] },
  "L&T Phase 3":            { kwh: ["/meters/lnt_phase3.jpg"],                      md: ["/meters/lnt_phase3.jpg"] },
  "Landis Gyr":             { kwh: ["/meters/landis_gyr.jpg"],                      md: ["/meters/landis_gyr.jpg"] },
};

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  onReset: () => void;
}

function SliderRow({ label, value, min, max, step = 1, unit = "%", onChange, onReset }: SliderRowProps) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-24 text-xs text-foreground font-medium shrink-0">{label}:</span>
      <button onClick={() => onChange(Math.max(min, value - step))} className="w-6 h-6 rounded border border-border bg-white text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors shrink-0">-</button>
      <div className="flex-1">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-primary"
          style={{ background: `linear-gradient(to right, #FF9933 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)` }}
        />
      </div>
      <button onClick={() => onChange(Math.min(max, value + step))} className="w-6 h-6 rounded border border-border bg-white text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors shrink-0">+</button>
      <span className="w-14 text-xs text-muted-foreground text-right shrink-0">{value}{unit}</span>
      <button onClick={onReset} className="ml-1 text-muted-foreground hover:text-foreground shrink-0"><RotateCcw className="w-3.5 h-3.5" /></button>
    </div>
  );
}

interface TouchState {
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
  startDist: number | null;
  startFontSize: number | null;
}

export default function MeterReading() {
  const params = useParams<{ vendor: string }>();
  const [, navigate] = useLocation();
  const vendor = decodeURIComponent(params.vendor || "");

  const [activeTab, setActiveTab] = useState<TabType>("kwh");
  const [activePanel, setActivePanel] = useState<PanelType>("filters");
  const [kwhReading, setKwhReading] = useState("");
  const [mdReading, setMdReading] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [imgIndex, setImgIndex] = useState(0);

  // ── Number overlay (independent per tab) ──
  const [kwhPos, setKwhPos] = useState({ x: 0, y: 0 });
  const [mdPos, setMdPos] = useState({ x: 0, y: 0 });
  const [kwhFontSize, setKwhFontSize] = useState(22);
  const [mdFontSize, setMdFontSize] = useState(22);

  // ── Unit label overlay (completely independent) ──
  const [kwhUnitPos, setKwhUnitPos] = useState({ x: 40, y: 20 });
  const [mdUnitPos, setMdUnitPos] = useState({ x: 40, y: 20 });
  const [kwhUnitSize, setKwhUnitSize] = useState(14);
  const [mdUnitSize, setMdUnitSize] = useState(14);

  // ── Which element drag/pinch controls ──
  const [activeElement, setActiveElement] = useState<ActiveElement>("number");

  const [textColor, setTextColor] = useState("#000000");
  const [textOpacity, setTextOpacity] = useState(100);
  const [showKwhUnit, setShowKwhUnit] = useState(false);
  const [showMdUnit, setShowMdUnit] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [whatsappSharing, setWhatsappSharing] = useState(false);

  const touchRef = useRef<TouchState | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const vendorConfig = VENDOR_IMAGES[vendor];
  const activeImages = vendorConfig?.[activeTab] ?? [];
  const currentImage = activeImages[imgIndex] ?? null;

  // ── Number element getters ──
  const activeReading = activeTab === "kwh" ? kwhReading : mdReading;
  const activePos = activeTab === "kwh" ? kwhPos : mdPos;
  const activeFontSize = activeTab === "kwh" ? kwhFontSize : mdFontSize;
  const setActivePos = activeTab === "kwh" ? setKwhPos : setMdPos;
  const setActiveFontSize = activeTab === "kwh" ? setKwhFontSize : setMdFontSize;
  const showUnit = activeTab === "kwh" ? showKwhUnit : showMdUnit;
  const setShowUnit = activeTab === "kwh" ? setShowKwhUnit : setShowMdUnit;

  // ── Unit label element getters ──
  const activeUnitPos = activeTab === "kwh" ? kwhUnitPos : mdUnitPos;
  const activeUnitSize = activeTab === "kwh" ? kwhUnitSize : mdUnitSize;
  const setActiveUnitPos = activeTab === "kwh" ? setKwhUnitPos : setMdUnitPos;
  const setActiveUnitSize = activeTab === "kwh" ? setKwhUnitSize : setMdUnitSize;

  // ── Currently controlled element (for d-pad / slider) ──
  const ctrlPos = activeElement === "number" ? activePos : activeUnitPos;
  const ctrlFontSize = activeElement === "number" ? activeFontSize : activeUnitSize;
  const setCtrlPos = activeElement === "number" ? setActivePos : setActiveUnitPos;
  const setCtrlFontSize = activeElement === "number" ? setActiveFontSize : setActiveUnitSize;
  const ctrlFontMax = activeElement === "number" ? 72 : 100;

  // When unit is turned OFF, reset mode to "number"
  useEffect(() => {
    if (!showUnit) setActiveElement("number");
  }, [showUnit]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setImgIndex(0);
  };

  const imageStyle = {
    filter: [
      `contrast(${filters.contrast}%)`,
      `brightness(${filters.brightness}%)`,
      `saturate(${filters.saturation}%)`,
      `grayscale(${filters.grayscale}%)`,
      `sepia(${filters.sepia}%)`,
      `invert(${filters.invert}%)`,
      `hue-rotate(${filters.hueRotate}deg)`,
      `blur(${filters.blur}px)`,
    ].join(" "),
  };

  const updateFilter = (key: keyof FilterState) => (value: number) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const resetFilter = (key: keyof FilterState) => () =>
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));

  const move = (dir: "up" | "down" | "left" | "right") => {
    const step = 8;
    setCtrlPos((prev) => ({
      x: prev.x + (dir === "left" ? -step : dir === "right" ? step : 0),
      y: prev.y + (dir === "up" ? -step : dir === "down" ? step : 0),
    }));
  };

  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const pos = activeElement === "number"
        ? (activeTab === "kwh" ? kwhPos : mdPos)
        : (activeTab === "kwh" ? kwhUnitPos : mdUnitPos);
      const fs = activeElement === "number"
        ? (activeTab === "kwh" ? kwhFontSize : mdFontSize)
        : (activeTab === "kwh" ? kwhUnitSize : mdUnitSize);

      if (e.touches.length === 1) {
        touchRef.current = {
          startX: e.touches[0].clientX, startY: e.touches[0].clientY,
          startPosX: pos.x, startPosY: pos.y,
          startDist: null, startFontSize: null,
        };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY,
        );
        touchRef.current = {
          startX: 0, startY: 0, startPosX: pos.x, startPosY: pos.y,
          startDist: dist, startFontSize: fs,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchRef.current) return;
      const sizeMax = activeElement === "number" ? 72 : 100;

      if (e.touches.length === 1 && touchRef.current.startDist === null) {
        const dx = e.touches[0].clientX - touchRef.current.startX;
        const dy = e.touches[0].clientY - touchRef.current.startY;
        const newPos = { x: touchRef.current.startPosX + Math.round(dx), y: touchRef.current.startPosY + Math.round(dy) };
        if (activeElement === "number") {
          if (activeTab === "kwh") setKwhPos(newPos); else setMdPos(newPos);
        } else {
          if (activeTab === "kwh") setKwhUnitPos(newPos); else setMdUnitPos(newPos);
        }
      } else if (e.touches.length === 2 && touchRef.current.startDist !== null && touchRef.current.startFontSize !== null) {
        const dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        const newSize = Math.min(sizeMax, Math.max(10, Math.round(touchRef.current.startFontSize * dist / touchRef.current.startDist)));
        if (activeElement === "number") {
          if (activeTab === "kwh") setKwhFontSize(newSize); else setMdFontSize(newSize);
        } else {
          if (activeTab === "kwh") setKwhUnitSize(newSize); else setMdUnitSize(newSize);
        }
      }
    };

    const onTouchEnd = () => { touchRef.current = null; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeTab, activeElement, kwhPos, mdPos, kwhFontSize, mdFontSize, kwhUnitPos, mdUnitPos, kwhUnitSize, mdUnitSize]);

  const { saveReading } = useReadings();
  const [saved, setSaved] = useState(false);

  const resetAdjustments = () => {
    setKwhPos({ x: 0, y: 0 }); setMdPos({ x: 0, y: 0 });
    setKwhFontSize(22); setMdFontSize(22);
    setKwhUnitPos({ x: 40, y: 20 }); setMdUnitPos({ x: 40, y: 20 });
    setKwhUnitSize(14); setMdUnitSize(14);
    setTextColor("#000000"); setTextOpacity(100);
    setActiveElement("number");
  };

  const handleSave = () => {
    if (!kwhReading && !mdReading) return;
    saveReading(vendor, kwhReading, mdReading);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveToGallery = async () => {
    if (!imgContainerRef.current) return;
    setSavingImg(true);
    try {
      const canvas = await html2canvas(imgContainerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${vendor}_${activeTab}_${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Save failed", err);
    }
    setSavingImg(false);
  };

  const handleWhatsAppShare = async () => {
    if (!imgContainerRef.current) return;
    setWhatsappSharing(true);
    try {
      const canvas = await html2canvas(imgContainerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) { setWhatsappSharing(false); return; }
        const file = new File([blob], `meter_${activeTab}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${vendor} Meter Reading` });
        } else {
          const reading = activeTab === "kwh" ? kwhReading : mdReading;
          const unit = activeTab === "kwh" ? "kWh" : "kW";
          window.open(`https://wa.me/?text=${encodeURIComponent(`${vendor} Meter Reading: ${reading} ${unit}`)}`, "_blank");
        }
        setWhatsappSharing(false);
      }, "image/png");
    } catch {
      setWhatsappSharing(false);
    }
  };

  const overlayStyle = (pos: { x: number; y: number }, fontSize: number) => ({
    top: `calc(50% + ${pos.y}px)`,
    left: `calc(50% + ${pos.x}px)`,
    transform: "translate(-50%, -50%)",
    fontSize: `${fontSize}px`,
    color: textColor,
    opacity: textOpacity / 100,
    fontFamily: "'Courier New', monospace",
    textShadow: textColor === "#000000"
      ? "0 1px 2px rgba(255,255,255,0.3)"
      : `0 0 8px ${textColor}cc, 0 1px 3px rgba(0,0,0,0.9)`,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap" as const,
    lineHeight: 1,
    fontWeight: "bold" as const,
    userSelect: "none" as const,
  });

  return (
    <div className="app-container flex flex-col">
      <WarningBanner />
      <header
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{ background: "linear-gradient(135deg,#FF9933 0%,#e8831a 100%)" }}
      >
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-white text-sm font-bold">
          <ChevronLeft className="w-4 h-4" /><span>DESIBOY</span>
        </button>
        <span className="text-xs font-semibold text-white/80 truncate max-w-[120px]">{vendor}</span>
        <button onClick={() => navigate("/history")} className="text-xs text-white font-bold hover:underline">
          History
        </button>
      </header>
      <div className="flex h-1 shrink-0">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1" style={{ background: "#FFFFFF" }} />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>

      <div className="flex border-b border-border bg-white">
        {(["kwh", "md"] as TabType[]).map((tab) => (
          <button key={tab} onClick={() => handleTabChange(tab)}
            className={cn("flex-1 py-3 text-sm font-semibold text-center transition-colors",
              activeTab === tab
                ? "border-b-2"
                : "text-muted-foreground")}
            style={activeTab === tab ? { color: "#FF9933", borderColor: "#FF9933" } : {}}>
            {tab === "kwh" ? "kWh Reading" : "MD Reading"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Reading input + unit toggle */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white">
          <label className="text-sm font-medium text-foreground whitespace-nowrap shrink-0">
            {activeTab === "kwh" ? "kWh" : "MD"}:
          </label>
          <input
            type="number"
            placeholder={activeTab === "kwh" ? "e.g., 12345" : "e.g., 12.34"}
            value={activeReading}
            onChange={(e) => activeTab === "kwh" ? setKwhReading(e.target.value) : setMdReading(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors"
          />
          <button
            onClick={() => setShowUnit((v) => !v)}
            className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all leading-tight"
            style={showUnit
              ? { background: "#FF9933", color: "#fff", borderColor: "#FF9933" }
              : { background: "#f5f5f5", color: "#aaa", borderColor: "#e0e0e0" }}
          >
            {activeTab === "kwh" ? "kWh" : "kW"}
          </button>
        </div>

        <p className="mx-4 mt-1.5 mb-0 text-[11px] text-muted-foreground">
          💡 <strong>{activeTab === "kwh" ? "kWh" : "kW"} button</strong>{" "}
          {showUnit
            ? "ON — unit label alag drag/pinch se control hoga"
            : "OFF — sirf number dikhega"}
        </p>

        <div className="mx-4 my-2">
          {currentImage ? (
            <>
              {/* Element mode selector — shown only when unit is ON */}
              {showUnit && (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setActiveElement("number")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all"
                    style={activeElement === "number"
                      ? { background: "#FF9933", color: "#fff", borderColor: "#FF9933" }
                      : { background: "#fff", color: "#888", borderColor: "#e0e0e0" }}
                  >
                    📊 Number Control
                  </button>
                  <button
                    onClick={() => setActiveElement("unit")}
                    className="flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all"
                    style={activeElement === "unit"
                      ? { background: "#138808", color: "#fff", borderColor: "#138808" }
                      : { background: "#fff", color: "#888", borderColor: "#e0e0e0" }}
                  >
                    {activeTab === "kwh" ? "kWh" : "kW"} Label Control
                  </button>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground text-center mb-1.5">
                {showUnit
                  ? activeElement === "number"
                    ? "👆 Number drag → hilao  |  🤏 Pinch → size badlo"
                    : `👆 ${activeTab === "kwh" ? "kWh" : "kW"} label drag → hilao  |  🤏 Pinch → size badlo`
                  : "👆 Image pe drag → text hilega  |  🤏 Pinch → size badlega"}
              </p>

              <div
                ref={imgContainerRef}
                className="relative rounded-2xl overflow-hidden select-none"
                style={{ background: "#111", touchAction: "none", cursor: "move" }}
              >
                <img
                  src={currentImage}
                  alt={`${vendor} meter`}
                  className="w-full object-cover rounded-2xl"
                  style={imageStyle}
                  draggable={false}
                />

                {/* ── kWh Number overlay ── */}
                {kwhReading && activeTab === "kwh" && (
                  <div className="absolute pointer-events-none" style={overlayStyle(kwhPos, kwhFontSize)}>
                    {kwhReading}
                  </div>
                )}

                {/* ── kWh Unit label overlay (independent) ── */}
                {kwhReading && showKwhUnit && activeTab === "kwh" && (
                  <div className="absolute pointer-events-none" style={overlayStyle(kwhUnitPos, kwhUnitSize)}>
                    kWh
                  </div>
                )}

                {/* ── MD Number overlay ── */}
                {mdReading && activeTab === "md" && (
                  <div className="absolute pointer-events-none" style={overlayStyle(mdPos, mdFontSize)}>
                    {mdReading}
                  </div>
                )}

                {/* ── MD Unit label overlay (independent) ── */}
                {mdReading && showMdUnit && activeTab === "md" && (
                  <div className="absolute pointer-events-none" style={overlayStyle(mdUnitPos, mdUnitSize)}>
                    kW
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={handleSaveToGallery}
                  disabled={savingImg || whatsappSharing || (!kwhReading && !mdReading)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#138808,#0d6b06)", boxShadow: "0 3px 12px rgba(19,136,8,0.35)" }}
                >
                  {savingImg ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Download className="w-4 h-4" /> Gallery</>
                  )}
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  disabled={whatsappSharing || savingImg || (!kwhReading && !mdReading)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", boxShadow: "0 3px 12px rgba(37,211,102,0.4)" }}
                >
                  {whatsappSharing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sharing...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.529 5.85L.057 23.272c-.073.27.007.556.209.737.149.133.34.2.534.2a.77.77 0 0 0 .218-.032l5.584-1.503A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.785 9.785 0 0 1-4.988-1.363l-.357-.214-3.316.893.877-3.224-.233-.371A9.755 9.755 0 0 1 2.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
                      </svg>
                      WhatsApp
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border flex items-center justify-center py-16 bg-white">
              <p className="text-sm text-muted-foreground text-center px-6">
                Is vendor ke liye abhi koi image available nahi hai.
              </p>
            </div>
          )}

          {activeImages.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-2">
              <button onClick={() => setImgIndex((i) => Math.max(0, i - 1))} disabled={imgIndex === 0}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground">{imgIndex + 1} / {activeImages.length}</span>
              <button onClick={() => setImgIndex((i) => Math.min(activeImages.length - 1, i + 1))} disabled={imgIndex === activeImages.length - 1}
                className="w-8 h-8 rounded-full border border-border bg-white flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Panel tabs */}
        <div className="mx-4 mt-2 flex rounded-xl border border-border overflow-hidden">
          {(["filters", "adjustments"] as PanelType[]).map((p) => (
            <button key={p} onClick={() => setActivePanel(p)}
              className={cn("flex-1 py-2.5 text-sm font-semibold text-center transition-colors",
                activePanel === p ? "bg-white" : "text-muted-foreground bg-muted/40")}
              style={activePanel === p ? { color: "#FF9933" } : {}}>
              {p === "filters" ? "Filters" : "Adjustments"}
            </button>
          ))}
        </div>

        {activePanel === "filters" && (
          <div className="mx-4 mt-3 p-4 rounded-xl border border-border bg-white">
            <p className="text-xs font-bold tracking-widest text-muted-foreground text-center mb-4">IMAGE FILTERS</p>
            <div className="flex flex-col gap-1">
              <SliderRow label="Contrast"   value={filters.contrast}   min={0}   max={200} onChange={updateFilter("contrast")}   onReset={resetFilter("contrast")} />
              <SliderRow label="Brightness" value={filters.brightness} min={0}   max={200} onChange={updateFilter("brightness")} onReset={resetFilter("brightness")} />
              <SliderRow label="Saturation" value={filters.saturation} min={0}   max={200} onChange={updateFilter("saturation")} onReset={resetFilter("saturation")} />
              <SliderRow label="Grayscale"  value={filters.grayscale}  min={0}   max={100} onChange={updateFilter("grayscale")}  onReset={resetFilter("grayscale")} />
              <SliderRow label="Sepia"      value={filters.sepia}      min={0}   max={100} onChange={updateFilter("sepia")}      onReset={resetFilter("sepia")} />
              <SliderRow label="Invert"     value={filters.invert}     min={0}   max={100} onChange={updateFilter("invert")}     onReset={resetFilter("invert")} />
              <SliderRow label="Hue Rotate" value={filters.hueRotate}  min={0}   max={360} step={1} unit="deg" onChange={updateFilter("hueRotate")} onReset={resetFilter("hueRotate")} />
              <SliderRow label="Blur"       value={filters.blur}       min={0}   max={20}  step={0.1} unit="px" onChange={updateFilter("blur")} onReset={resetFilter("blur")} />
            </div>
            <button onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-all"
              style={{ background: "#FF9933" }}>
              Reset Filters
            </button>
          </div>
        )}

        {activePanel === "adjustments" && (
          <div className="mx-4 mt-3 p-4 rounded-xl border border-border bg-white">

            {/* Element selector inside adjustments (shown when unit is ON) */}
            {showUnit && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveElement("number")}
                  className="flex-1 py-1 text-xs font-bold rounded-lg border transition-all"
                  style={activeElement === "number"
                    ? { background: "#FF9933", color: "#fff", borderColor: "#FF9933" }
                    : { background: "#f5f5f5", color: "#888", borderColor: "#e0e0e0" }}
                >
                  📊 Number
                </button>
                <button
                  onClick={() => setActiveElement("unit")}
                  className="flex-1 py-1 text-xs font-bold rounded-lg border transition-all"
                  style={activeElement === "unit"
                    ? { background: "#138808", color: "#fff", borderColor: "#138808" }
                    : { background: "#f5f5f5", color: "#888", borderColor: "#e0e0e0" }}
                >
                  {activeTab === "kwh" ? "kWh" : "kW"} Label
                </button>
              </div>
            )}

            <p className="text-xs font-bold tracking-widest text-muted-foreground text-center mb-1">
              POSITION —{" "}
              <span style={{ color: activeElement === "number" ? "#FF9933" : "#138808" }}>
                {activeElement === "number"
                  ? `${activeTab === "kwh" ? "kWh" : "MD"} Number`
                  : `${activeTab === "kwh" ? "kWh" : "kW"} Label`}
              </span>
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Arrow buttons ya image pe drag karein
            </p>

            <div className="flex flex-col items-center gap-2">
              <button onClick={() => move("up")} className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold active:scale-95 transition-all shadow"
                style={{ background: activeElement === "number" ? "#FF9933" : "#138808" }}>↑</button>
              <div className="flex gap-2">
                <button onClick={() => move("left")} className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold active:scale-95 transition-all shadow"
                  style={{ background: activeElement === "number" ? "#FF9933" : "#138808" }}>←</button>
                <button
                  onClick={() => activeElement === "number" ? setActivePos({ x: 0, y: 0 }) : setActiveUnitPos({ x: 40, y: 20 })}
                  className="w-12 h-12 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center hover:bg-border transition-all">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => move("right")} className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold active:scale-95 transition-all shadow"
                  style={{ background: activeElement === "number" ? "#FF9933" : "#138808" }}>→</button>
              </div>
              <button onClick={() => move("down")} className="w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl font-bold active:scale-95 transition-all shadow"
                style={{ background: activeElement === "number" ? "#FF9933" : "#138808" }}>↓</button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {/* Font size — dynamic for number or unit */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground w-24 shrink-0">
                  {activeElement === "number" ? "Number Size:" : "Label Size:"}
                </span>
                <button onClick={() => setCtrlFontSize((s) => Math.max(10, s - 2))} className="w-6 h-6 rounded border border-border bg-white text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors shrink-0">-</button>
                <div className="flex-1">
                  <input type="range" min={10} max={ctrlFontMax} step={1} value={ctrlFontSize}
                    onChange={(e) => setCtrlFontSize(Number(e.target.value))}
                    className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${activeElement === "number" ? "#FF9933" : "#138808"} ${((ctrlFontSize - 10) / (ctrlFontMax - 10)) * 100}%, #e5e7eb ${((ctrlFontSize - 10) / (ctrlFontMax - 10)) * 100}%)` }}
                  />
                </div>
                <button onClick={() => setCtrlFontSize((s) => Math.min(ctrlFontMax, s + 2))} className="w-6 h-6 rounded border border-border bg-white text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors shrink-0">+</button>
                <span className="w-10 text-xs text-muted-foreground text-right shrink-0">{ctrlFontSize}px</span>
              </div>

              {/* Color — applies to all text */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-24 shrink-0">Text Color:</span>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                <span className="text-xs text-muted-foreground">{textColor}</span>
                <button onClick={() => setTextColor("#000000")} className="text-xs text-muted-foreground hover:text-foreground ml-auto">Reset</button>
              </div>

              {/* Opacity — applies to all text */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground w-24 shrink-0">Opacity:</span>
                <div className="flex-1">
                  <input type="range" min={10} max={100} step={5} value={textOpacity}
                    onChange={(e) => setTextOpacity(Number(e.target.value))}
                    className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
                    style={{ background: `linear-gradient(to right, #FF9933 ${textOpacity}%, #e5e7eb ${textOpacity}%)` }}
                  />
                </div>
                <span className="w-10 text-xs text-muted-foreground text-right shrink-0">{textOpacity}%</span>
              </div>
            </div>

            <button onClick={resetAdjustments}
              className="w-full mt-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-muted transition-all active:scale-[0.98]">
              Reset All Adjustments
            </button>
          </div>
        )}

        <div className="mx-4 mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!kwhReading && !mdReading}
            className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
            style={{ background: saved ? "#138808" : "linear-gradient(135deg,#FF9933,#e8831a)", boxShadow: "0 3px 12px rgba(255,153,51,0.35)" }}
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Reading Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Reading</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
