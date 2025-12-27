import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

/**
 * Fetches the latest OWGR rankings and updates the database
 * This endpoint is called by a cron job every Tuesday
 */
export async function GET(request: Request) {
    try {
        // Verify this is a cron request (optional security)
        const authHeader = request.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("Starting OWGR sync...");

        // Fetch OWGR data from the official website
        const owgrData = await fetchOWGRRankings();

        if (!owgrData || owgrData.length === 0) {
            throw new Error("Failed to fetch OWGR data");
        }

        console.log(`Fetched ${owgrData.length} golfers from OWGR`);

        // Update database with new rankings
        const updatePromises = owgrData.map((golfer) =>
            prisma.golfer.upsert({
                where: { name: golfer.name },
                update: {
                    owgrRank: golfer.rank,
                    country: golfer.country,
                    lastUpdated: new Date(),
                },
                create: {
                    name: golfer.name,
                    owgrRank: golfer.rank,
                    country: golfer.country,
                    lastUpdated: new Date(),
                },
            })
        );

        await Promise.all(updatePromises);

        console.log("OWGR sync completed successfully");

        return NextResponse.json({
            success: true,
            message: `Updated ${owgrData.length} golfers`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("OWGR sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync OWGR rankings", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

/**
 * Fetches OWGR rankings from the official website
 * Returns top 200 players
 */
async function fetchOWGRRankings(): Promise<Array<{ name: string; rank: number; country?: string }>> {
    try {
        // Try primary source: OWGR official website
        const response = await fetch("https://www.owgr.com/ranking", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
        });

        if (!response.ok) {
            console.log("OWGR website unavailable, using fallback data source");
            return await fetchFallbackRankings();
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const golfers: Array<{ name: string; rank: number; country?: string }> = [];

        // Parse the OWGR table
        $("table.table-styled tbody tr").each((index, element) => {
            if (index >= 200) return false; // Stop after 200

            const rank = parseInt($(element).find("td").eq(0).text().trim());
            const name = $(element).find("td").eq(1).text().trim();
            const country = $(element).find("td").eq(2).text().trim();

            if (name && rank) {
                golfers.push({
                    name: cleanGolferName(name),
                    rank,
                    country: country || undefined,
                });
            }
        });

        if (golfers.length > 0) {
            return golfers;
        }

        // If parsing failed, use fallback
        return await fetchFallbackRankings();
    } catch (error) {
        console.error("Error fetching OWGR:", error);
        return await fetchFallbackRankings();
    }
}

/**
 * Fallback data source using PGA Tour website or static data
 */
async function fetchFallbackRankings(): Promise<Array<{ name: string; rank: number; country?: string }>> {
    try {
        // Try PGA Tour official rankings page
        const response = await fetch("https://www.pgatour.com/stats/detail/186", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            },
        });

        if (response.ok) {
            const html = await response.text();
            const $ = cheerio.load(html);
            const golfers: Array<{ name: string; rank: number; country?: string }> = [];

            $("table tbody tr").each((index, element) => {
                if (index >= 200) return false;

                const rank = index + 1;
                const nameElement = $(element).find("td a").first();
                const name = nameElement.text().trim();

                if (name) {
                    golfers.push({
                        name: cleanGolferName(name),
                        rank,
                    });
                }
            });

            if (golfers.length > 0) {
                return golfers;
            }
        }
    } catch (error) {
        console.error("Fallback fetch error:", error);
    }

    // Last resort: return current static list from database or file
    console.log("Using existing database rankings as fallback");
    const existingGolfers = await prisma.golfer.findMany({
        orderBy: { owgrRank: "asc" },
        take: 200,
    });

    if (existingGolfers.length > 0) {
        return existingGolfers.map((g) => ({
            name: g.name,
            rank: g.owgrRank,
            country: g.country || undefined,
        }));
    }

    // Absolute fallback: use the static list
    const { TOP_200_GOLFERS } = await import("@/data/golfers");
    return TOP_200_GOLFERS.map((name, index) => ({
        name,
        rank: index + 1,
    }));
}

/**
 * Clean golfer names to ensure consistency
 */
function cleanGolferName(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, " ") // Remove extra spaces
        .replace(/[^\w\s'-]/g, "") // Remove special characters except hyphens and apostrophes
        .trim();
}
