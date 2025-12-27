"use server";

import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function getTeamCount() {
    try {
        const count = await prisma.team.count();
        return count;
    } catch (error) {
        console.error("Error fetching team count:", error);
        return 0;
    }
}

export async function submitPick(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const tournamentId = formData.get("tournamentId") as string;
    const golferName = formData.get("golferName") as string;

    if (!tournamentId || !golferName) return { error: "Missing data" };

    try {
        const team = await prisma.team.findUnique({
            where: { userId: session.user.id },
            include: { picks: true }
        });

        if (!team) return { error: "Team not found" };

        // Check if golfer used and didn't win
        const usedGolfer = team.picks.find((p: { golferName: string; isWinner: boolean }) => p.golferName === golferName && !p.isWinner);
        if (usedGolfer) {
            // Check if they won - logic here assumes we trust the isWinner flag
            // In a real app, we might double check, but rule is: can reuse if they won.
            // But if isWinner is false, we can't reuse.
            return { error: "Golfer already used" };
        }

        // Upsert pick for this tournament
        await prisma.pick.upsert({
            where: {
                teamId_tournamentId: {
                    teamId: team.id,
                    tournamentId: tournamentId
                }
            },
            update: { golferName },
            create: {
                teamId: team.id,
                tournamentId,
                golferName
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Pick error", error);
        return { error: "Failed to submit pick" };
    }
}
