import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";

// Helper to get active tournament
async function getActiveTournament() {
    const tournament = await prisma.tournament.findFirst({
        where: { status: { in: ["active", "completed"] } },
        orderBy: { weekNum: "desc" },
    });

    if (!tournament) {
        return await prisma.tournament.findFirst({
            orderBy: { weekNum: "asc" },
        });
    }

    return tournament;
}

async function getPicks(tournamentId: string) {
    const picks = await prisma.pick.findMany({
        where: { tournamentId },
        include: {
            team: {
                include: {
                    user: { select: { name: true } },
                },
            },
        },
        orderBy: { team: { totalPoints: "desc" } },
    });
    return picks;
}

export default async function PicksPage() {
    const tournament = await getActiveTournament();

    if (!tournament) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="max-w-7xl mx-auto px-4 py-12 text-center text-white">
                    <h1 className="text-3xl font-serif font-bold mb-4">No Active Tournament</h1>
                    <p className="text-white/60">Check back when the season starts!</p>
                </main>
            </div>
        );
    }

    const picks = await getPicks(tournament.id);

    // Stats
    const golferCounts: Record<string, number> = {};
    picks.forEach((p: { golferName: string }) => {
        golferCounts[p.golferName] = (golferCounts[p.golferName] || 0) + 1;
    });

    const sortedGolfers = Object.entries(golferCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-10 text-center">
                    <p className="text-[#FDDA0D] font-bold uppercase tracking-widest text-sm mb-2">Weekly Reveal</p>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">{tournament.name}</h1>
                    <p className="text-white/70">Week {tournament.weekNum} • {picks.length} Picks locked in</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main List */}
                    <div className="lg:col-span-3">
                        <section className="masters-card overflow-hidden p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#f9f9f9]">
                                    <tr className="text-left text-gray-500 font-bold uppercase text-xs tracking-wider border-b border-gray-200">
                                        <th className="py-2.5 px-6">Team</th>
                                        <th className="py-2.5 px-6">Division</th>
                                        <th className="py-2.5 px-6 font-serif">Golfer Pick</th>
                                        <th className="py-2.5 px-6 text-right">Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {picks.map((pick: any) => (
                                        <tr key={pick.id} className="hover:bg-gray-50 transition">
                                            <td className="py-2.5 px-6">
                                                <span className="text-[#1A1A1A] font-bold block">{pick.team.name}</span>
                                                <span className="text-gray-400 text-xs">{pick.team.user?.name}</span>
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">
                                                    {pick.team.division || "-"}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[#00573F] font-bold">{pick.golferName}</span>
                                                    {pick.multiplier > 1 && (
                                                        <span className="text-[10px] text-[#FDDA0D] bg-[#00573F] px-1.5 py-0.5 rounded font-bold w-fit mt-1">
                                                            {pick.multiplier}X MULTIPLIER
                                                        </span>
                                                    )}
                                                </div>
                                                {pick.isWinner && <span className="ml-2">🏆</span>}
                                            </td>
                                            <td className="py-2.5 px-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-mono font-bold text-[#00573F] text-lg">
                                                        ${pick.earnings.toLocaleString()}
                                                    </span>
                                                    {pick.multiplier > 1 && (
                                                        <span className="text-[10px] text-gray-400">
                                                            Base: ${pick.rawEarnings.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {picks.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400 italic">
                                                No picks made for this tournament yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <section className="masters-card">
                            <h3 className="text-[#1A1A1A] font-serif font-bold mb-4">Most Picked</h3>
                            <div className="space-y-4">
                                {sortedGolfers.map(([name, count], i) => (
                                    <div key={name} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-300 font-mono text-sm">#{i + 1}</span>
                                            <span className="text-gray-700 text-sm font-medium">{name}</span>
                                        </div>
                                        <span className="bg-[#00573F] text-white px-2.5 py-1 rounded text-xs font-bold">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                                {sortedGolfers.length === 0 && (
                                    <p className="text-gray-400 text-xs italic">No data yet</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
