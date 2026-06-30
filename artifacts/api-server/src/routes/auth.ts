import { Router } from "express";
import { authStore } from "../lib/authStore";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ ok: false, error: "Username aur password dono zaroori hain." });
    return;
  }
  try {
    const creds = await authStore.getCredentials();
    if (username.trim() !== creds.username || password !== creds.password) {
      res.status(401).json({ ok: false, error: "Username ya password galat hai. Dobara try karein." });
      return;
    }
    res.json({ ok: true, version: creds.version });
  } catch {
    res.status(500).json({ ok: false, error: "Server error. Thodi der baad try karein." });
  }
});

router.get("/version", async (_req, res) => {
  try {
    const { version } = await authStore.getCredentials();
    res.json({ version });
  } catch {
    res.status(500).json({ version: "unknown" });
  }
});

export default router;
