import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import config from "../config/index.js";

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  client ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: config.databaseUrl }),
  });

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (property === "then") {
      return undefined;
    }

    const value = Reflect.get(getClient(), property, getClient());
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});

export async function checkDatabaseReady(): Promise<boolean> {
  if (!config.databaseUrl) {
    return false;
  }

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await client?.$disconnect();
}
