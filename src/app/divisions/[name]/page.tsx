import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/components/Header";

const DIVISIONS = ["nicklaus", "woods", "hogan", "jones"];

async function getDivisionStandings(divisionName: string) {
    const properName = divisionName.charAt(0).toUpperCase() + divisionName.slice(1);

    const teams = await prisma.team.findMany({
        where: { division: properName },
        orderBy: { totalPoints: "desc" },
        include: {
            user: { select: { name: true } },
            picks: {
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { tournament: true },
            },
        },
    });

    return { teams, divisionName: properName };
}

export function generateStaticParams() {
    return DIVISIONS.map((name) => ({ name }));
}

export default async function DivisionPage({
    params,
}: {
    params: Promise<{ name: string }>;
}) {
    const { name } = await params;

    if (!DIVISIONS.includes(name.toLowerCase())) {
        notFound();
    }

    const { teams, divisionName } = await getDivisionStandings(name);

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Division Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="text-white/60 hover:text-white flex items-center gap-1 font-bold">
                        <span>←</span> Back to Leaderboard
                    </Link>
                </div>

                <div className="text-center mb-16">
                    <p className="text-[#FDDA0D] font-bold uppercase tracking-widest text-sm mb-2">Division Standings</p>
                    <h1 className="text-6xl font-serif font-bold text-white mb-2">{divisionName}</h1>
                    <p className="text-white/70 italic text-lg">{teams.length} of 10 teams registered</p>
                </div>

                {teams.length === 0 ? (
                    <section className="masters-card p-16 text-center">
                        <p className="text-gray-400 text-xl font-serif italic">No teams assigned to this division yet</p>
                        <p className="text-gray-500 mt-4 max-w-md mx-auto">
                            Teams are randomly assigned to divisions once registration is complete. Check back soon!
                        </p>
                    </section>
                ) : (
                    <section className="masters-card overflow-hidden p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f9f9f9]">
                                <tr className="text-left text-gray-500 font-bold uppercase text-xs tracking-wider border-b border-gray-200">
                                    <th className="px-6 py-5">Rank</th>
                                    <th className="px-6 py-5">Team</th>
                                    <th className="px-6 py-5">Owner</th>
                                    <th className="px-6 py-5 text-center">Picks</th>
                                    <th className="px-6 py-5 text-right">Total Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {teams.map((team: any, index: number) => (
                                    <tr
                                        key={team.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-5">
                                            <span className={`
                                                text-xl font-serif font-bold
                                                ${index === 0 ? "text-[#00573F]" : "text-gray-300"}
                                            `}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[#1A1A1A] font-bold text-lg">{team.name}</span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-medium lowercase">
                                            @{team.user?.name?.replace(/\s+/g, '').toLowerCase() || "unknown"}
                                        </td>
                                        <td className="px-6 py-5 text-center text-gray-600 font-mono">
                                            {team.picks.length}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="text-[#00573F] font-bold text-xl font-mono">
                                                ${team.totalPoints.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Other Divisions */}
                <div className="mt-20">
                    <h2 className="text-2xl font-serif font-bold text-white mb-6 border-b border-white/10 pb-4">Browse Other Divisions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {DIVISIONS.filter((d) => d !== name.toLowerCase()).map((div) => (
                            <Link
                                key={div}
                                href={`/divisions/${div}`}
                                className="masters-card p-6 text-center hover:border-[#FDDA0D] transition transform hover:-translate-y-1 group"
                            >
                                <span className="text-[#00573F] font-serif font-bold text-xl capitalize group-hover:text-[#1A1A1A]">{div} Division</span>
                                <div className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">View Rankings →</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
