import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  CRON_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  CRON_SECRET: process.env.CRON_SECRET,
  NODE_ENV: process.env.NODE_ENV
});

if (env.NODE_ENV === "production" && !env.CRON_SECRET) {
  throw new Error("CRON_SECRET is required in production");
}
