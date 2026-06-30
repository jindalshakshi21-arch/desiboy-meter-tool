import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = resolve(__dirname, "..", "public");
if (existsSync(staticDir)) {
  // Serve meter images with 7-day cache so repeat visits are instant
  app.use(
    "/meters",
    express.static(resolve(staticDir, "meters"), {
      maxAge: "7d",
      immutable: true,
    }),
  );
  // Serve all other static files with 1-day cache
  app.use(express.static(staticDir, { maxAge: "1d" }));
  // Express 5 requires named wildcard parameter
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(resolve(staticDir, "index.html"));
  });
}

export default app;
