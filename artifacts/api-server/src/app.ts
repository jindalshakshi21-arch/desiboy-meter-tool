import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve built frontend static files when deployed as a single service (e.g. Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = resolve(__dirname, "..", "public");
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => {
    res.sendFile(resolve(staticDir, "index.html"));
  });
}

export default app;
