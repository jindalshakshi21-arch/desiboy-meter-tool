import { useState, FormEvent } from "react";
import { Shield, Eye, EyeOff, Loader2, CheckCircle, LogOut, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const DARK_BG: React.CSSProperties = {
  background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
  minHeight: "100dvh",
  maxWidth: "480px",
  margin: "0 auto",
  color: "#fff",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(255,255,255,0.2)",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  color: "#ffffff",
  caretColor: "#f59e0b",
  outline: "none",
};

const INPUT_FOCUS = {
  border: "1.5px solid #f59e0b",
  background: "rgba(255,255,255,0.12)",
};

function DarkInput({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoCapitalize,
  spellCheck,
  minLength,
  style,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoCapitalize?: string;
  spellCheck?: boolean;
  minLength?: number;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      minLength={minLength}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...INPUT_STYLE, ...(focused ? INPUT_FOCUS : {}), ...style }}
    />
  );
}

export default function AdminPanel() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json() as { ok: boolean; error?: string; token?: string };
      if (!data.ok) {
        setLoginError(data.error ?? "Login failed");
      } else {
        setAdminToken(data.token ?? null);
      }
    } catch {
      setLoginError("Server se connect nahi ho pa raha.");
    }
    setLoginLoading(false);
  };

  const handleChangeCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");
    if (newPassword !== confirmPassword) {
      setChangeError("Dono passwords match nahi kar rahe.");
      return;
    }
    setChangeLoading(true);
    try {
      const res = await fetch("/api/admin/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: adminToken, username: newUsername, password: newPassword }),
      });
      const data = await res.json() as { ok: boolean; error?: string; message?: string };
      if (!data.ok) {
        setChangeError(data.error ?? "Change failed");
        if (res.status === 403) setAdminToken(null);
      } else {
        setChangeSuccess("✅ " + (data.message ?? "Credentials change ho gaye!"));
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setChangeError("Server se connect nahi ho pa raha.");
    }
    setChangeLoading(false);
  };

  if (!adminToken) {
    return (
      <div style={DARK_BG} className="flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{ background: "#f59e0b" }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#fff" }}>Admin Panel</h1>
          <p className="text-sm mb-8" style={{ color: "#9ca3af" }}>DESIBOY — Authorized Access Only</p>

          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: "#d1d5db" }}>
                  Admin Username
                </label>
                <DarkInput
                  type="text"
                  value={loginUsername}
                  onChange={setLoginUsername}
                  placeholder="admin username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: "#d1d5db" }}>
                  Admin Password
                </label>
                <div className="relative">
                  <DarkInput
                    type={showLoginPass ? "text" : "password"}
                    value={loginPassword}
                    onChange={setLoginPassword}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ background: "#f59e0b" }}
              >
                {loginLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  : "Admin Login"}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs pb-6" style={{ color: "#4b5563" }}>© 2026 DESIBOY. All Rights Reserved.</p>
      </div>
    );
  }

  return (
    <div style={DARK_BG} className="flex flex-col">
      <header className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "#fbbf24" }} />
          <span className="font-bold text-sm" style={{ color: "#fff" }}>Admin Panel</span>
        </div>
        <button
          onClick={() => setAdminToken(null)}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
          style={{ color: "#9ca3af" }}
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.2)" }}>
            <CheckCircle className="w-4 h-4" style={{ color: "#4ade80" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#fff" }}>Admin Access Granted</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Aap users ke credentials change kar sakte hain</p>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-6"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <div className="flex items-start gap-2">
            <KeyRound className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#fcd34d" }}>Credentials Change Karne Ka Effect</p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(253,211,77,0.7)" }}>
                Jab aap naya username/password set karenge, sabhi logged-in users automatic logout ho jayenge (30 seconds ke andar).
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-sm font-bold mb-4" style={{ color: "#fff" }}>User Credentials Set Karein</p>

          <form onSubmit={handleChangeCredentials} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide" style={{ color: "#d1d5db" }}>Naya Username</label>
              <DarkInput
                type="text"
                value={newUsername}
                onChange={setNewUsername}
                placeholder="kam se kam 3 characters"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide" style={{ color: "#d1d5db" }}>Naya Password</label>
              <div className="relative">
                <DarkInput
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="kam se kam 6 characters"
                  minLength={6}
                  required
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9ca3af" }}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide" style={{ color: "#d1d5db" }}>Password Confirm Karein</label>
              <DarkInput
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="wahi password dobara likhen"
                required
                style={confirmPassword && newPassword !== confirmPassword
                  ? { border: "1.5px solid rgba(239,68,68,0.6)" }
                  : {}}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs" style={{ color: "#f87171" }}>Passwords match nahi kar rahe</p>
              )}
            </div>

            {changeError && (
              <div className="rounded-xl px-3 py-2.5 text-xs"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                {changeError}
              </div>
            )}
            {changeSuccess && (
              <div className="rounded-xl px-3 py-2.5 text-xs"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}>
                {changeSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={changeLoading || (!!confirmPassword && newPassword !== confirmPassword)}
              className="w-full py-3 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "#f59e0b" }}
            >
              {changeLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                : <><KeyRound className="w-4 h-4" /> Credentials Update Karein</>}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs pb-5" style={{ color: "#4b5563" }}>© 2026 DESIBOY. All Rights Reserved.</p>
    </div>
  );
}
