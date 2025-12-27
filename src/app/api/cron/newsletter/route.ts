import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { SlashGolfService } from "@/lib/api";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Fallback for dev

export async function GET(request: Request) {
    try {
        // Security check: Only allow Cron or authenticated calls
        // In Vercel, cron jobs have a specific header
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

        // 1. Fetch Data
        const { searchParams } = new URL(request.url);
        const testEmail = searchParams.get('test_email');

        // Get active/recently completed tournament
        const recentTournament = await prisma.tournament.findFirst({
            where: { status: { in: ["active", "completed"] } },
            orderBy: { weekNum: "desc" },
        });

        if (!recentTournament) {
            return NextResponse.json({ message: "No recent tournament found" });
        }

        // Get Top 3 Picks (Best performers of the week)
        const topPicks = await prisma.pick.findMany({
            where: { tournamentId: recentTournament.id },
            orderBy: { earnings: "desc" },
            take: 3,
            include: { team: { include: { user: true } } }
        });

        // Get Overall Leaders
        const overallLeaders = await prisma.team.findMany({
            orderBy: { totalPoints: "desc" },
            take: 5,
            include: { user: true }
        });

        // Get Next Tournament
        const nextTournament = await prisma.tournament.findFirst({
            where: { weekNum: recentTournament.weekNum + 1 },
        });

        // Get Vegas Odds
        const odds = await SlashGolfService.getOdds();

        // 2. Generate Email Content (Simple HTML)
        const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h1 style="color: #1a472a; text-align: center;">The Gentleman's Gamble Weekly ⛳</h1>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #c9a227; margin-top: 0;">${recentTournament.name} Results</h2>
            <p>The dust has settled on another week!</p>
            
            <h3>🏆 Top Picks of the Week</h3>
            <ul>
                ${topPicks.map((p: { team: { name: string }; golferName: string; position: string | null; earnings: number }) => `
                    <li>
                        <strong>${p.team.name}</strong> picked ${p.golferName} 
                        (${p.position}) - <span style="color: green;">$${p.earnings.toLocaleString()}</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1a472a; margin-top: 0;">📈 Overall Leaders</h2>
            <ol>
                ${overallLeaders.map((t: { name: string; totalPoints: number }) => `
                    <li>
                        <strong>${t.name}</strong> - ${t.totalPoints.toLocaleString()} pts
                    </li>
                `).join('')}
            </ol>
        </div>

        ${odds.length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1a472a; margin-top: 0;">🎰 Vegas Favorites</h2>
                <p>Top odds for the upcoming tournament:</p>
                <ul>
                    ${odds.map((o: { name: string; price: number }) => `
                        <li>
                            <strong>${o.name}</strong>: ${o.price > 0 ? '+' : ''}${o.price}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f44336;">
            <p style="color: #f44336; font-size: 12px; margin: 0; font-weight: bold;">⚠️ THE RULE OF 0</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #333;">Reminder: If your golfer misses the cut or withdraws, you earn <strong>$0</strong> for the week.</p>
        </div>

        ${nextTournament ? `
            <div style="background: ${nextTournament.type === 'MAJOR' ? '#1a472a' : '#e6f0e6'}; color: ${nextTournament.type === 'MAJOR' ? 'white' : '#333'}; padding: 25px; border-radius: 8px; text-align: center; border: 2px solid #FDDA0D;">
                <h3 style="margin-top: 0; font-size: 22px;">Next Up: ${nextTournament.name}</h3>
                
                ${(nextTournament.type === 'MAJOR' || nextTournament.type === 'SIGNATURE' || nextTournament.type === 'FEDEX') ? `
                    <div style="background: ${nextTournament.type === 'MAJOR' ? '#FDDA0D' : '#1a472a'}; color: ${nextTournament.type === 'MAJOR' ? '#1a472a' : 'white'}; display: inline-block; padding: 4px 12px; border-radius: 99px; font-weight: bold; font-size: 12px; margin-bottom: 10px;">
                        🚀 ${nextTournament.type === 'MAJOR' ? '2X' : '1.5X'} BOOST EVENT
                    </div>
                    <p style="font-weight: bold; margin: 10px 0;">Large point opportunity! All earnings this week will be multiplied by ${nextTournament.type === 'MAJOR' ? '2' : '1.5'}.</p>
                ` : ''}

                <p style="margin-bottom: 20px;">The first tee time is approaching. Lock in your pick by Wednesday night!</p>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #FDDA0D; color: #1a472a; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Lock In My Pick ⛳</a>
            </div>
        ` : ''}
      </div>
    `;

        // 3. Send Individual Performance Emails to Each Team
        const teams = await prisma.team.findMany({
            include: { user: true, picks: { where: { tournamentId: recentTournament.id } } }
        });

        for (const team of teams) {
            const pick = team.picks[0];
            if (pick && team.user.email) {
                const individualHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e6e6e6; border-radius: 12px;">
                        <h2 style="color: #00573F; margin-top: 0; font-serif: serif;">Weekly Performance Report</h2>
                        <p style="color: #666;">Hello <strong>${team.user.name || team.name}</strong>,</p>
                        <p>Here are the official results for your pick in <strong>${recentTournament.name}</strong>:</p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Your Golfer:</td>
                                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${pick.golferName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Finish Position:</td>
                                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">${pick.position || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666;">Raw Earnings:</td>
                                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">$${pick.rawEarnings.toLocaleString()}</td>
                                </tr>
                                ${pick.multiplier > 1 ? `
                                <tr>
                                    <td style="padding: 8px 0; color: #00573F; font-weight: bold;">${recentTournament.type} Boost:</td>
                                    <td style="padding: 8px 0; color: #00573F; font-weight: bold; text-align: right;">x${pick.multiplier}</td>
                                </tr>
                                ` : ''}
                                <tr style="border-top: 2px solid #ddd;">
                                    <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #1a1a1a;">Total Points:</td>
                                    <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #00573F; text-align: right;">${pick.earnings.toLocaleString()} pts</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="font-size: 14px; color: #888;">This email serves as your official record. If you spot any discrepancies, please contact the commissioner.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #00573F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;">View Full Leaderboard</a>
                        </div>
                    </div>
                `;

                if (process.env.RESEND_API_KEY) {
                    await resend.emails.send({
                        from: 'Gamble Stats <stats@fantasygolfweek.com>',
                        to: team.user.email,
                        subject: `Official Results: ${recentTournament.name} - ${team.name}`,
                        html: individualHtml,
                    });
                } else {
                    console.log(`MOCKED INDIVIDUAL EMAIL for ${team.name}:`);
                    console.log(individualHtml);
                }
            }
        }

        // 4. Send General Recap Email
        const allUsers = await prisma.user.findMany({ select: { email: true } });
        const allSubscribers = await (prisma as any).newsletterSubscriber.findMany({ select: { email: true } });

        const recipients = [
            ...allUsers.map((u: { email: string | null }) => u.email),
            ...allSubscribers.map((s: { email: string }) => s.email)
        ].filter((e: string | null): e is string => !!e);

        const uniqueRecipients = Array.from(new Set(recipients));

        if (testEmail) {
            // Send samples to the test email
            if (process.env.RESEND_API_KEY) {
                // Send Newsletter Sample
                await resend.emails.send({
                    from: 'The Gentleman\'s Gamble <commissioner@fantasygolfweek.com>',
                    to: testEmail,
                    subject: `[SAMPLE] Weekly Roundup - ${recentTournament.name}`,
                    html: emailHtml,
                });

                // Send Individual Recap Sample (using first team found)
                if (teams.length > 0) {
                    const team = teams[0];
                    const pick = team.picks[0] || { golferName: 'Scottie Scheffler', position: 'T1', rawEarnings: 1000000, earnings: 1000000, multiplier: 1 };
                    const individualHtml = `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e6e6e6; border-radius: 12px;">
                            <h2 style="color: #00573F; margin-top: 0; font-serif: serif;">Weekly Performance Report</h2>
                            <p style="color: #666;">Hello <strong>Test User</strong>,</p>
                            <p>Here are the official results for your pick in <strong>${recentTournament.name}</strong>:</p>
                            
                            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Your Golfer:</td>
                                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${pick.golferName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Finish Position:</td>
                                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${pick.position || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #666;">Raw Earnings:</td>
                                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">$${pick.rawEarnings.toLocaleString()}</td>
                                    </tr>
                                    ${(pick.multiplier && pick.multiplier > 1) ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #00573F; font-weight: bold;">${recentTournament.type} Boost:</td>
                                        <td style="padding: 8px 0; color: #00573F; font-weight: bold; text-align: right;">x${pick.multiplier}</td>
                                    </tr>
                                    ` : ''}
                                    <tr style="border-top: 2px solid #ddd;">
                                        <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #1a1a1a;">Total Points:</td>
                                        <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: bold; color: #00573F; text-align: right;">${pick.earnings.toLocaleString()} pts</td>
                                    </tr>
                                </table>
                            </div>
                            <p style="text-align: center; font-size: 12px; color: #999;">[This is a sample sent to ${testEmail}]</p>
                        </div>
                    `;
                    await resend.emails.send({
                        from: 'Gamble Stats <stats@fantasygolfweek.com>',
                        to: testEmail,
                        subject: `[SAMPLE] Official Results: ${recentTournament.name}`,
                        html: individualHtml,
                    });
                }
            }
            return NextResponse.json({ success: true, message: `Samples sent to ${testEmail}` });
        }

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'The Gentleman\'s Gamble <commissioner@fantasygolfweek.com>',
                to: process.env.ADMIN_EMAIL || "admin@example.com",
                bcc: uniqueRecipients,
                subject: `Weekly Roundup - ${recentTournament.name}`,
                html: emailHtml,
            });
        }

        return NextResponse.json({
            success: true,
            individualSent: teams.length,
            newsletterSent: uniqueRecipients.length
        });

    } catch (error) {
        console.error("Newsletter error:", error);
        return NextResponse.json({ success: false, error: "Failed to send newsletter" }, { status: 500 });
    }
}
