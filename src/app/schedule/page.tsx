import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

interface TournamentItem {
    week?: number;
    weekNum?: number;
    name: string;
    dates: string;
    purse?: number | null;
    type: string;
}

// Sample 2025 PGA Tour schedule (will be populated via API)
const SAMPLE_SCHEDULE = [
    { week: 1, name: "Sony Open in Hawaii", dates: "Jan 15-18", purse: 8500000, type: "PGA TOUR" },
    { week: 2, name: "The American Express", dates: "Jan 22-25", purse: 8400000, type: "PGA TOUR" },
    { week: 3, name: "Farmers Insurance Open", dates: "Jan 28-31", purse: 9000000, type: "PGA TOUR" },
    { week: 4, name: "WM Phoenix Open", dates: "Feb 5-8", purse: 9000000, type: "PGA TOUR" },
    { week: 5, name: "AT&T Pebble Beach Pro-Am", dates: "Feb 12-15", purse: 20000000, type: "SIGNATURE" },
    { week: 6, name: "The Genesis Invitational", dates: "Feb 19-22", purse: 20000000, type: "SIGNATURE" },
    { week: 7, name: "Cognizant Classic in The Palm Beaches", dates: "Feb 26-Mar 1", purse: 9000000, type: "PGA TOUR" },
    { week: 8, name: "Arnold Palmer Invitational", dates: "Mar 5-8", purse: 20000000, type: "SIGNATURE" },
    { week: 9, name: "THE PLAYERS Championship", dates: "Mar 12-15", purse: 25000000, type: "PGA TOUR" },
    { week: 10, name: "Valspar Championship", dates: "Mar 19-22", purse: 8500000, type: "PGA TOUR" },
    { week: 11, name: "Texas Children's Houston Open", dates: "Mar 26-29", purse: 9500000, type: "PGA TOUR" },
    { week: 12, name: "Valero Texas Open", dates: "Apr 2-5", purse: 9500000, type: "PGA TOUR" },
    { week: 13, name: "The Masters Tournament", dates: "Apr 9-12", purse: 20000000, type: "MAJOR" },
    { week: 14, name: "RBC Heritage", dates: "Apr 16-19", purse: 20000000, type: "SIGNATURE" },
    { week: 15, name: "Zurich Classic of New Orleans", dates: "Apr 23-26", purse: 9000000, type: "PGA TOUR" },
    { week: 16, name: "Cadillac Championship", dates: "Apr 30-May 3", purse: 20000000, type: "SIGNATURE" },
    { week: 17, name: "Truist Championship", dates: "May 7-10", purse: 20000000, type: "SIGNATURE" },
    { week: 18, name: "PGA Championship", dates: "May 14-17", purse: 18500000, type: "MAJOR" },
    { week: 19, name: "THE CJ CUP Byron Nelson", dates: "May 21-24", purse: 9500000, type: "PGA TOUR" },
    { week: 20, name: "Charles Schwab Challenge", dates: "May 28-31", purse: 9100000, type: "PGA TOUR" },
    { week: 21, name: "The Memorial Tournament", dates: "Jun 4-7", purse: 20000000, type: "SIGNATURE" },
    { week: 22, name: "RBC Canadian Open", dates: "Jun 11-14", purse: 9500000, type: "PGA TOUR" },
    { week: 23, name: "U.S. Open", dates: "Jun 18-21", purse: 21500000, type: "MAJOR" },
    { week: 24, name: "Travelers Championship", dates: "Jun 25-28", purse: 20000000, type: "SIGNATURE" },
    { week: 25, name: "John Deere Classic", dates: "Jul 2-5", purse: 8000000, type: "PGA TOUR" },
    { week: 26, name: "Genesis Scottish Open", dates: "Jul 9-12", purse: 9000000, type: "PGA TOUR" },
    { week: 27, name: "The Open Championship", dates: "Jul 16-19", purse: 17000000, type: "MAJOR" },
    { week: 28, name: "3M Open", dates: "Jul 23-26", purse: 8500000, type: "PGA TOUR" },
    { week: 29, name: "Rocket Mortgage Classic", dates: "Jul 30-Aug 2", purse: 9200000, type: "PGA TOUR" },
    { week: 30, name: "Wyndham Championship", dates: "Aug 6-9", purse: 8500000, type: "PGA TOUR" },
    { week: 31, name: "FedEx St. Jude Championship", dates: "Aug 13-16", purse: 20000000, type: "FEDEX" },
    { week: 32, name: "BMW Championship", dates: "Aug 20-23", purse: 20000000, type: "FEDEX" },
    { week: 33, name: "TOUR Championship", dates: "Aug 27-30", purse: 25000000, type: "FEDEX" },
];

async function getTournaments() {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { weekNum: "asc" },
    });

    if (tournaments.length === 0) {
        return SAMPLE_SCHEDULE;
    }

    return tournaments;
}



export default async function SchedulePage() {
    const tournaments = await getTournaments();

    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="masters-card mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">2026 Season Schedule</h1>
                        <p className="text-gray-500 mt-1">
                            {tournaments.length} tournaments • Validating champions every week.
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 mb-8 pl-2 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                        <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">PGA Tour (1X)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#FDDA0D] border border-gray-300"></span>
                        <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">Major (2X)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                        <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">FedEx Playoffs (1.5X)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                        <span className="text-gray-600 text-xs font-bold uppercase tracking-wider">Signature (1.5X)</span>
                    </div>
                </div>

                {/* Schedule Table */}
                <section className="masters-card overflow-hidden p-0 overflow-x-auto shadow-2xl border-0">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1A1A1A] text-white">
                            <tr className="text-left font-bold uppercase text-[10px] tracking-widest border-b border-white/10">
                                <th className="px-6 py-2.5">Week</th>
                                <th className="px-6 py-2.5">Tournament</th>
                                <th className="px-6 py-2.5">Dates</th>
                                <th className="px-6 py-2.5 text-right">Base Purse</th>
                                <th className="px-6 py-2.5 text-center">Multiplier</th>
                                <th className="px-6 py-2.5 text-right">Total Points</th>
                                <th className="px-6 py-2.5 text-center">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {tournaments.map((t: TournamentItem, index: number) => {
                                const type = t.type.toUpperCase();
                                let multiplier = 1;
                                let rowClass = "hover:bg-gray-50";
                                let typeClass = "bg-gray-100 text-gray-500";

                                if (type === "MAJOR") {
                                    multiplier = 2;
                                    rowClass = "bg-[#FDDA0D]/10 hover:bg-[#FDDA0D]/20";
                                    typeClass = "bg-[#FDDA0D] text-[#00573F]";
                                } else if (type === "FEDEX") {
                                    multiplier = 1.5;
                                    rowClass = "bg-purple-50 hover:bg-purple-100";
                                    typeClass = "bg-purple-600 text-white";
                                } else if (type === "SIGNATURE") {
                                    multiplier = 1.5;
                                    rowClass = "bg-blue-50 hover:bg-blue-100";
                                    typeClass = "bg-blue-600 text-white";
                                }

                                const basePurse = t.purse || 0;
                                const totalPoints = basePurse * multiplier;

                                return (
                                    <tr key={t.week || t.weekNum || index} className={`${rowClass} transition border-l-4 ${type === "MAJOR" ? "border-l-[#FDDA0D]" : type === "FEDEX" ? "border-l-purple-600" : type === "SIGNATURE" ? "border-l-blue-600" : "border-l-transparent"}`}>
                                        <td className="px-6 py-2.5 font-mono text-gray-400 font-bold">
                                            {t.week || t.weekNum}
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <span className="text-[#1A1A1A] font-bold block">{t.name}</span>
                                        </td>
                                        <td className="px-6 py-2.5 text-gray-500 font-medium">{t.dates}</td>
                                        <td className="px-6 py-2.5 text-right text-gray-400 font-mono">
                                            ${(basePurse / 1000000).toFixed(1)}M
                                        </td>
                                        <td className="px-6 py-2.5 text-center">
                                            <span className={`font-bold ${multiplier > 1 ? "text-[#00573F]" : "text-gray-300"}`}>
                                                {multiplier}X
                                            </span>
                                        </td>
                                        <td className="px-6 py-2.5 text-right text-[#00573F] font-mono font-bold text-lg">
                                            ${(totalPoints / 1000000).toFixed(1)}M
                                        </td>
                                        <td className="px-6 py-2.5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${typeClass}`}>
                                                {type}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                <div className="mt-8 text-center bg-white/10 backdrop-blur-md p-4 rounded-lg">
                    <p className="text-white text-sm italic">
                        * Multipliers are applied to official prize money to determine weekly fantasy points.
                    </p>
                </div>
            </main>
        </div>
    );
}
