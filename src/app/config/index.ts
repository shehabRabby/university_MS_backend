import "dotenv/config";
import { z } from "zod";

const originList = z
  .string()
  .default("http://localhost:3000")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).min(1))
  .transform((origins) => origins.map((origin) => new URL(origin).origin));

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGIN: originList,
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
  DATABASE_URL: z.string().min(1).optional(),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  const invalidKeys = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid environment configuration: ${invalidKeys}`);
}

const config = {
  nodeEnv: result.data.NODE_ENV,
  port: result.data.PORT,
  corsOrigins: result.data.CORS_ORIGIN,
  logLevel: result.data.LOG_LEVEL,
  databaseUrl: result.data.DATABASE_URL,
};

export default config;
