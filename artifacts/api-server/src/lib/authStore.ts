import { randomUUID } from "node:crypto";
import { db, credentialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const DEFAULT_USERNAME = "desiboy";
const DEFAULT_PASSWORD = "meter@2026";
const DEFAULT_VERSION = "v1";

let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureDefaults() {
  if (initialized) return;
  await db.insert(credentialsTable).values({
    id: "main",
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD,
    version: DEFAULT_VERSION,
  }).onConflictDoNothing();
  initialized = true;
}

function getReady() {
  if (!initPromise) {
    initPromise = ensureDefaults().catch((err) => { initPromise = null; throw err; });
  }
  return initPromise;
}

const validTokens = new Set<string>();

export const authStore = {
  getCredentials: async () => {
    await getReady();
    const rows = await db
      .select()
      .from(credentialsTable)
      .where(eq(credentialsTable.id, "main"))
      .limit(1);
    if (rows.length === 0) {
      return { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD, version: DEFAULT_VERSION };
    }
    const row = rows[0]!;
    return { username: row.username, password: row.password, version: row.version };
  },

  updateCredentials: async (username: string, password: string): Promise<string> => {
    await getReady();
    const newVersion = "v-" + randomUUID().slice(0, 8);
    await db
      .update(credentialsTable)
      .set({ username: username.trim(), password, version: newVersion })
      .where(eq(credentialsTable.id, "main"));
    validTokens.clear();
    return newVersion;
  },

  generateAdminToken: (): string => {
    const token = randomUUID();
    validTokens.add(token);
    return token;
  },

  validateAdminToken: (token: string): boolean => {
    return validTokens.has(token);
  },
};
