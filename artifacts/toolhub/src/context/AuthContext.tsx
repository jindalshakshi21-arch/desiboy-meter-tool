import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface AuthUser {
  name: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "desiboy_user";
const VERSION_KEY = "desiboy_session_v";
const POLL_INTERVAL_MS = 30_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
  };

  const checkVersion = async () => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (!storedVersion) return;
    try {
      const res = await fetch("/api/auth/version");
      if (!res.ok) return;
      const data = await res.json() as { version: string };
      if (data.version !== storedVersion) {
        doLogout();
      }
    } catch {
      /* network error — stay logged in */
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (saved && storedVersion) {
          const res = await fetch("/api/auth/version").catch(() => null);
          if (res?.ok) {
            const data = await res.json() as { version: string };
            if (data.version === storedVersion) {
              setUser(JSON.parse(saved));
            } else {
              localStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(VERSION_KEY);
            }
          } else {
            setUser(JSON.parse(saved));
          }
        }
      } catch {
        /* ignore */
      }
      setIsLoading(false);
    };
    void init();
  }, []);

  useEffect(() => {
    if (user) {
      pollRef.current = setInterval(() => { void checkVersion(); }, POLL_INTERVAL_MS);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  const login = async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    if (!username || !password) {
      return { ok: false, error: "Username aur password dono zaroori hain." };
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json() as { ok: boolean; error?: string; version?: string };
      if (!data.ok) return { ok: false, error: data.error ?? "Login failed" };
      const u: AuthUser = { name: "DESIBOY User", username: username.trim() };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      localStorage.setItem(VERSION_KEY, data.version ?? "v1");
      return { ok: true };
    } catch {
      return { ok: false, error: "Server se connect nahi ho pa raha. Thodi der baad try karein." };
    }
  };

  const logout = () => doLogout();

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
