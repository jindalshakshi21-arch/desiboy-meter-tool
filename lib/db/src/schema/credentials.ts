import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const credentialsTable = pgTable("desiboy_credentials", {
  id: text("id").primaryKey().default("main"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  version: text("version").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Credentials = typeof credentialsTable.$inferSelect;
