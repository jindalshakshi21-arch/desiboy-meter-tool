import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TirangaLogo from "@/components/TirangaLogo";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.ok) {
      navigate("/");
    } else {
      setError(result.error ?? "Login failed");
    }
  };

  return (
    <div className="app-container flex flex-col min-h-dvh" style={{ background: "#f9f5f0" }}>

      {/* Saffron top banner */}
      <div
        className="relative overflow-hidden flex flex-col items-center pt-14 pb-10"
        style={{ background: "linear-gradient(160deg, #FF9933 0%, #e8831a 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20" style={{ background: "#fff" }} />
        <div className="absolute top-20 -left-12 w-32 h-32 rounded-full opacity-10" style={{ background: "#138808" }} />
        <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[40px]" style={{ background: "#f9f5f0" }} />

        <div className="relative z-10 mb-4 drop-shadow-xl" onClick={() => navigate("/admin")}>
          <TirangaLogo size={68} />
        </div>

        <h1 className="relative z-10 text-3xl font-black text-white tracking-widest drop-shadow" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
          DESIBOY
        </h1>
        <p className="relative z-10 text-white/80 text-sm mt-1 font-medium tracking-wide">
          Meter Reading Tool
        </p>

        <div className="relative z-10 flex w-32 h-1.5 rounded-full overflow-hidden mt-4">
          <div className="flex-1" style={{ background: "#FF9933" }} />
          <div className="flex-1" style={{ background: "#FFFFFF" }} />
          <div className="flex-1" style={{ background: "#138808" }} />
        </div>
      </div>

      {/* Form card */}
      <div className="mx-4 -mt-2 bg-white rounded-3xl shadow-xl p-6 border border-orange-100">
        <h2 className="text-xl font-bold mb-0.5" style={{ color: "#1a1a1a" }}>Namaste! 🙏</h2>
        <p className="text-sm text-muted-foreground mb-6">Apna account mein login karein</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide" style={{ color: "#FF9933" }}>USERNAME</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="aapka username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="w-full border-2 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                style={{ borderColor: username ? "#FF9933" : "#e5e7eb" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide" style={{ color: "#138808" }}>PASSWORD</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full border-2 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                style={{ borderColor: password ? "#138808" : "#e5e7eb" }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border rounded-xl px-3 py-2.5 text-xs" style={{ background: "#fff2f2", borderColor: "#fca5a5", color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-black tracking-wide shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-1"
            style={{ background: "linear-gradient(135deg, #FF9933 0%, #138808 100%)", boxShadow: "0 4px 16px rgba(255,153,51,0.35)" }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
            ) : (
              "🇮🇳 Login Karein"
            )}
          </button>
        </form>

        <div className="mt-5 p-3 rounded-xl" style={{ background: "#fff8f0", border: "1px solid #ffe5c0" }}>
          <p className="text-xs text-center leading-relaxed text-muted-foreground">
            Login ke liye apna <span className="font-bold" style={{ color: "#FF9933" }}>username</span> aur{" "}
            <span className="font-bold" style={{ color: "#138808" }}>password</span> use karein
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex flex-col items-center py-4"
        style={{ borderTop: "3px solid transparent", borderImage: "linear-gradient(to right, #FF9933, #FFFFFF, #138808) 1" }}
      >
        <p className="text-xs text-muted-foreground">© 2026 DESIBOY. All Rights Reserved.</p>
        <div className="flex w-20 h-1 rounded-full overflow-hidden mt-2">
          <div className="flex-1" style={{ background: "#FF9933" }} />
          <div className="flex-1" style={{ background: "#FFFFFF", border: "1px solid #eee" }} />
          <div className="flex-1" style={{ background: "#138808" }} />
        </div>
      </div>
    </div>
  );
}
