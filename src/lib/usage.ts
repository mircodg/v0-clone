import { RateLimiterPrisma } from "rate-limiter-flexible";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATION_COST = 1;

export async function getUsageTracker() {
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: FREE_POINTS,
    duration: DURATION,
  });

  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  await usageTracker.consume(userId, GENERATION_COST);
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const usage = await usageTracker.get(userId);
  return usage;
}
