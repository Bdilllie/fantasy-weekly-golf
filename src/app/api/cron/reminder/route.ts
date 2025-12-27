import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

export async function GET(request: Request) {
    try {
        // Security check: Only allow calls with the CRON_SECRET or from Vercel/GitHub
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Find the upcoming tournament
        // We look for tournaments with status 'upcoming'
        const tournament = await prisma.tournament.findFirst({
            where: { status: "upcoming" },
            orderBy: { weekNum: "asc" },
        });

        if (!tournament) {
            return NextResponse.json({ message: "No upcoming tournament found. No reminders sent." });
        }

        // 2. Find teams that haven't picked yet for this tournament
        const teamsWithPicks = await prisma.pick.findMany({
            where: { tournamentId: tournament.id },
            select: { teamId: true },
        });
        const teamIdsWithPicks = teamsWithPicks.map((p) => p.teamId);

        const teamsMissingPicks = await prisma.team.findMany({
            where: {
                id: { notIn: teamIdsWithPicks },
            },
            include: { user: true },
        });

        if (teamsMissingPicks.length === 0) {
            return NextResponse.json({ message: "All users have already submitted their picks!" });
        }

        // 3. Send reminders
        const results = [];
        const baseUrl = process.env.NEXTAUTH_URL || "https://fantasygolfweek.com";

        for (const team of teamsMissingPicks) {
            if (team.user && team.user.email) {
                const emailHtml = `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #1a472a; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Action Required: Lock In Your Pick! ⛳</h1>
                        </div>
                        <div style="padding: 30px; color: #333333; line-height: 1.6;">
                            <p style="font-size: 16px;">Hi <strong>${team.user.name || team.name}</strong>,</p>
                            <p>The first tee time for the <strong>${tournament.name}</strong> is tomorrow, and we don't have your pick yet.</p>
                            
                            <div style="background-color: #f4f7f4; border-left: 4px solid #c9a227; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: bold; color: #1a472a;">TOURNAMENT DETAILS:</p>
                                <p style="margin: 0; font-size: 18px;"><strong>${tournament.name}</strong></p>
                                <p style="margin: 5px 0 0 0; color: #666;">Dates: ${tournament.dates}</p>
                            </div>

                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${baseUrl}/dashboard" style="background-color: #c9a227; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Select My Golfer Now</a>
                            </div>

                            <p style="font-size: 14px; color: #d32f2f; font-weight: bold;">⚠️ THE RULE OF 0:</p>
                            <p style="font-size: 14px; color: #666; margin-top: 5px;">If you fail to submit a pick before the first tee time, you will receive $0 for the week. Don't let your team down!</p>
                        </div>
                        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">The Gentleman's Gamble - Fantasy Golf Weekly</p>
                            <p style="margin: 5px 0 0 0; color: #999999; font-size: 12px;">This is an automated reminder.</p>
                        </div>
                    </div>
                `;

                if (process.env.RESEND_API_KEY) {
                    try {
                        await resend.emails.send({
                            from: 'Fantasy Golf Reminder <reminder@fantasygolfweek.com>', // Note: This domain must be verified in Resend
                            to: team.user.email,
                            subject: `⛳ Reminder: Get your pick in for ${tournament.name}`,
                            html: emailHtml,
                        });
                        results.push({ email: team.user.email, status: 'sent' });
                    } catch (err) {
                        results.push({ email: team.user.email, status: 'error', error: String(err) });
                    }
                } else {
                    results.push({ email: team.user.email, status: 'mocked' });
                }
            }
        }

        return NextResponse.json({
            success: true,
            tournament: tournament.name,
            remindersSent: results.length,
            details: results
        });

    } catch (error) {
        console.error("Reminder error:", error);
        return NextResponse.json({ success: false, error: "Failed to send reminders" }, { status: 500 });
    }
}
