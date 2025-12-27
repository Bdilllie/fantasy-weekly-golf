import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SlashGolfService } from "@/lib/api";

export async function GET() {
    try {
        // 1. Sync Schedule (Simplified: just first time or forced)
        // For now, we'll fetch schedule and upsert tournaments
        const schedule = await SlashGolfService.getSchedule(2026);

        let tournamentsSynced = 0;
        for (const t of schedule) {
            // Parse dates to determine status? 
            // For simplicity, we just import them. status logic needs date parsing.

            // Skip if no tournId
            if (!t.tournId) continue;

            // Clean purse string "$20,000,000" -> 20000000
            const purseValue = t.purse ? parseFloat(t.purse.replace(/[^0-9.]/g, "")) : 0;

            await prisma.tournament.upsert({
                where: { id: t.tournId }, // Assuming tournId is unique enough, or we use our own ID logic
                update: {
                    name: t.name,
                    dates: t.dates,
                    purse: purseValue,
                    // type: DetermineType(t) // Logic needed
                },
                create: {
                    id: t.tournId,
                    name: t.name,
                    dates: t.dates,
                    purse: purseValue,
                    type: "PGA TOUR", // Default, would need logic to detect Major/FedEx
                    weekNum: parseInt(t.tournId) || 0, // Fallback week num logic needed
                    status: "upcoming"
                }
            });
            tournamentsSynced++;
        }

        // 2. Sync Leaderboard for Active Tournament
        // Find active tournament
        const activeTournament = await prisma.tournament.findFirst({
            where: { status: "active" },
        });

        let scoresUpdated = 0;
        if (activeTournament) {
            const leaderboard = await SlashGolfService.getLeaderboard(activeTournament.id);

            // Update Picks
            for (const player of leaderboard) {
                const rawEarnings = player.earnings ? parseFloat(player.earnings.replace(/[^0-9.]/g, "")) : 0;
                const isWinner = player.position === "1" || player.position === "T1";

                let multiplier = 1;
                const tournType = activeTournament.type.toUpperCase();

                if (tournType === "MAJOR") {
                    multiplier = 2;
                } else if (tournType === "SIGNATURE" || tournType === "FEDEX") {
                    multiplier = 1.5;
                }

                const finalPoints = rawEarnings * multiplier;

                // Update all picks for this golfer in this tournament
                const picks = await prisma.pick.findMany({
                    where: {
                        tournamentId: activeTournament.id,
                        golferName: player.name
                    }
                });

                for (const pick of picks) {
                    await prisma.pick.update({
                        where: { id: pick.id },
                        data: {
                            position: player.position,
                            rawEarnings: rawEarnings,
                            multiplier: multiplier,
                            worldRanking: null,
                            earnings: finalPoints,
                            isWinner: isWinner
                        } as any
                    });
                    scoresUpdated++;
                }
            }

            // 3. Update Team Totals
            // Re-aggregate total points for all teams
            const teams = await prisma.team.findMany({ include: { picks: true } });
            for (const team of teams) {
                const total = team.picks.reduce((acc: number, pick: { earnings: number }) => acc + pick.earnings, 0);
                await prisma.team.update({
                    where: { id: team.id },
                    data: { totalPoints: total }
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Sync complete",
            stats: {
                tournamentsSynced,
                scoresUpdated
            }
        });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
    }
}
