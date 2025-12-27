import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import PickForm from "@/components/PickForm";

async function getTeamData(userId: string) {
    const team = await prisma.team.findUnique({
        where: { userId },
        include: {
            picks: {
                include: { tournament: true },
                orderBy: { tournament: { weekNum: "desc" } },
            },
        },
    });
    return team;
}

async function getUsedGolfers(teamId: string) {
    const picks = await prisma.pick.findMany({
        where: { teamId, isWinner: false },
        select: { golferName: true },
    });
    return picks.map((p: { golferName: string }) => p.golferName);
}

async function getCurrentTournament() {
    const tournament = await prisma.tournament.findFirst({
        where: { status: { in: ["upcoming", "active"] } },
        orderBy: { weekNum: "asc" },
    });
    return tournament;
}

async function getTeamRank(teamId: string) {
    const teams = await prisma.team.findMany({
        orderBy: { totalPoints: "desc" },
        select: { id: true },
    });
    const rank = teams.findIndex((t: { id: string }) => t.id === teamId) + 1;
    return { rank, total: teams.length };
}

async function getDivisionRank(teamId: string, division: string) {
    const teams = await prisma.team.findMany({
        where: { division },
        orderBy: { totalPoints: "desc" },
        select: { id: true },
    });
    const rank = teams.findIndex((t: { id: string }) => t.id === teamId) + 1;
    return { rank, total: teams.length };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const team = await getTeamData(session.user.id);

    if (!team) {
        redirect("/register");
    }

    const usedGolfers = await getUsedGolfers(team.id);
    const activeTournament = await getCurrentTournament();
    const overallRank = await getTeamRank(team.id);
    const divRank = team.division ? await getDivisionRank(team.id, team.division) : null;

    // Find pick for active tournament
    const currentPick = activeTournament
        ? team.picks.find((p: { tournamentId: string }) => p.tournamentId === activeTournament.id)
        : null;

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Team Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-serif font-bold text-white drop-shadow-sm">{team.name}</h1>
                                {team.isPaid && (
                                    <span className="bg-[#FDDA0D] text-[#00573F] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-[#00573F]/10 uppercase tracking-tighter" title="Entry Fee Verified">
                                        <span className="text-xs">✓</span> Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-[#FDDA0D] font-bold tracking-widest uppercase text-xs mt-1">
                                {team.division ? `${team.division} Division` : "Division pending..."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Rankings */}
                    <div className="space-y-6">
                        {/* Rankings Box */}
                        <div className="masters-card p-0 overflow-hidden">
                            <div className="bg-[#f9f9f9] border-b border-gray-100 p-4">
                                <h3 className="text-[#1A1A1A] font-serif font-bold text-sm uppercase tracking-tight">Season Standings</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-4 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-medium">Overall Rank</span>
                                    <span className="text-2xl font-serif font-bold text-[#00573F]">
                                        #{overallRank.rank} <span className="text-xs text-gray-400 font-sans font-normal">of {overallRank.total}</span>
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm font-medium">Division Rank</span>
                                    <span className="text-2xl font-serif font-bold text-[#00573F]">
                                        {divRank ? (
                                            <>#{divRank.rank} <span className="text-xs text-gray-400 font-sans font-normal">of {divRank.total}</span></>
                                        ) : "-"}
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-[#00573F]/5">
                                    <span className="text-gray-500 text-sm font-medium">Total Earnings</span>
                                    <span className="text-2xl font-mono font-bold text-[#00573F]">
                                        ${team.totalPoints.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Used Golfers */}
                        <section className="masters-card">
                            <h3 className="text-lg font-serif font-bold text-[#1A1A1A] mb-4">
                                Used Golfers ({usedGolfers.length})
                            </h3>
                            {usedGolfers.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">None yet</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {usedGolfers.map((golfer: string) => (
                                        <span
                                            key={golfer}
                                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200"
                                        >
                                            {golfer}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Pick Interface */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Make a Pick */}
                        <section className="masters-card border-t-8 border-[#FDDA0D] relative overflow-hidden">
                            {activeTournament && (activeTournament.type === "MAJOR" || activeTournament.type === "SIGNATURE" || activeTournament.type === "FEDEX") && (
                                <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg shadow-sm ${activeTournament.type === "MAJOR" ? "bg-[#00573F] text-white" : "bg-[#FDDA0D] text-[#00573F]"}`}>
                                    {activeTournament.type === "MAJOR" ? "2X" : "1.5X"} EVENT BOOST
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-[#00573F] text-white text-xs font-bold rounded-full mb-2">
                                        Current Tournament
                                    </span>
                                    <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                                        {activeTournament ? activeTournament.name : "Season Ended"}
                                    </h2>
                                    {activeTournament && <p className="text-gray-500 font-medium mt-1">{activeTournament.dates}</p>}
                                </div>
                            </div>

                            {!team.isPaid ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center relative overflow-hidden group">
                                    <div className="absolute -top-4 -right-4 text-amber-100 group-hover:text-amber-200 transition">
                                        <span className="text-8xl font-serif font-black italic">!</span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">💵</div>
                                        <h3 className="text-[#1A1A1A] font-serif font-bold text-xl mb-2">Account Not Yet Verified</h3>
                                        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                                            The $500 league entry fee must be verified before you can enter your weekly picks.
                                        </p>

                                        <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm mb-6 inline-block text-left">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Send Payment To:</p>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-50 p-2 rounded-lg">
                                                    <span className="text-blue-600 font-bold">Venmo</span>
                                                </div>
                                                <div>
                                                    <p className="text-[#1A1A1A] font-black text-lg">@Bdillie</p>
                                                    <p className="text-gray-400 text-[10px] font-bold">Last 4 digits: 2134</p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-amber-800 text-[10px] font-black uppercase tracking-widest italic">
                                            Picks will unlock as soon as payment is confirmed by the commissioner.
                                        </p>
                                    </div>
                                </div>
                            ) : activeTournament ? (
                                currentPick ? (
                                    <div className="bg-[#f9f9f9] border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                        <div className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">My Locked Pick</div>
                                        <div className="text-4xl font-serif font-bold text-[#00573F] mb-2">{currentPick.golferName}</div>
                                        <div className="text-sm text-gray-500">Good luck this week! 🍀</div>
                                    </div>
                                ) : (
                                    <PickForm
                                        tournamentId={activeTournament.id}
                                        usedGolfers={usedGolfers}
                                        golfers={["Scottie Scheffler", "Rory McIlroy", "Xander Schauffele", "Viktor Hovland", "Ludvig Aberg", "Patrick Cantlay", "Collin Morikawa", "Max Homa"]}
                                        multiplier={activeTournament.type === "MAJOR" ? 2 : (activeTournament.type === "SIGNATURE" || activeTournament.type === "FEDEX") ? 1.5 : 1}
                                    />
                                )
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-400 italic">No active tournament open for picks.</p>
                                </div>
                            )}
                        </section>

                        {/* Pick History */}
                        <section className="masters-card">
                            <h3 className="text-xl font-serif font-bold text-[#1A1A1A] mb-6">Season Pick History</h3>

                            {team.picks.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-8">No picks made yet. Get started above!</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#F5F5F5] text-gray-500 font-bold uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Week</th>
                                                <th className="px-6 py-3 text-left">Tournament</th>
                                                <th className="px-6 py-3 text-left">Golfer</th>
                                                <th className="px-6 py-3 text-center">Pos</th>
                                                <th className="px-6 py-3 text-right">Earned</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {team.picks.map((pick: { id: string; tournament: { weekNum: number; name: string }; golferName: string; isWinner: boolean; position: string | null; earnings: number; rawEarnings: number; multiplier: number }) => (
                                                <tr key={pick.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 font-mono text-gray-400">{pick.tournament.weekNum}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{pick.tournament.name}</td>
                                                    <td className="px-6 py-4">
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
                                                    <td className="px-6 py-4 text-center">
                                                        {pick.position ? (
                                                            <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">{pick.position}</span>
                                                        ) : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-mono font-bold text-[#00573F]">
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
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
