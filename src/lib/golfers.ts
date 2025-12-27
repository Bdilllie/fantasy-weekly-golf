"use server";

import { prisma } from "@/lib/prisma";
import { TOP_200_GOLFERS } from "@/data/golfers";

/**
 * Get the top 200 golfers from OWGR rankings
 * Falls back to static list if database is empty
 */
export async function getTop200Golfers(): Promise<string[]> {
    try {
        // Try to get from database (updated weekly via cron)
        const golfers = await prisma.golfer.findMany({
            orderBy: { owgrRank: "asc" },
            take: 200,
            select: { name: true },
        });

        if (golfers.length > 0) {
            return golfers.map((g) => g.name);
        }

        // Fallback to static list if database is empty
        return TOP_200_GOLFERS;
    } catch (error) {
        console.error("Error fetching golfers from database:", error);
        // Fallback to static list on error
        return TOP_200_GOLFERS;
    }
}

/**
 * Get golfer with their current OWGR rank
 */
export async function getGolferWithRank(name: string): Promise<{ name: string; rank: number | null }> {
    try {
        const golfer = await prisma.golfer.findUnique({
            where: { name },
            select: { name: true, owgrRank: true },
        });

        return {
            name,
            rank: golfer?.owgrRank || null,
        };
    } catch (error) {
        console.error("Error fetching golfer rank:", error);
        return { name, rank: null };
    }
}

/**
 * Get last update timestamp for OWGR data
 */
export async function getOWGRLastUpdate(): Promise<Date | null> {
    try {
        const latestGolfer = await prisma.golfer.findFirst({
            orderBy: { lastUpdated: "desc" },
            select: { lastUpdated: true },
        });

        return latestGolfer?.lastUpdated || null;
    } catch (error) {
        console.error("Error fetching OWGR last update:", error);
        return null;
    }
}
