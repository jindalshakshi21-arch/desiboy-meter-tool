import { Router } from "express";
import { authStore } from "../lib/authStore";

const ADMIN_USERNAME = "mohittheboss";
const ADMIN_PASSWORD = "desiboy@1008";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ ok: false, error: "Admin credentials galat hain." });
    return;
  }
  const token = authStore.generateAdminToken();
  res.json({ ok: true, token });
});

router.post("/change-credentials", async (req, res) => {
  const { token, username, password } = req.body as {
    token?: string;
    username?: string;
    password?: string;
  };
  if (!token || !authStore.validateAdminToken(token)) {
    res.status(403).json({ ok: false, error: "Admin session invalid hai. Dobara login karein." });
    return;
  }
  if (!username || username.trim().length < 3) {
    res.status(400).json({ ok: false, error: "Username kam se kam 3 characters ka hona chahiye." });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ ok: false, error: "Password kam se kam 6 characters ka hona chahiye." });
    return;
  }
  try {
    const newVersion = await authStore.updateCredentials(username, password);
    res.json({ ok: true, version: newVersion, message: "Credentials update ho gaye. Sabhi users logout ho jayenge." });
  } catch {
    res.status(500).json({ ok: false, error: "Database error. Thodi der baad try karein." });
  }
});

export default router;
