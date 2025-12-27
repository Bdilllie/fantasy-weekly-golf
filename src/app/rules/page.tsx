import Link from "next/link";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";

async function getTeamCount() {
    return await prisma.team.count();
}

export default async function RulesPage() {
    const teamCount = await getTeamCount();
    return (
        <div className="min-h-screen">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <p className="text-[#FDDA0D] font-bold uppercase tracking-widest text-sm mb-2">The Handbook</p>
                    <h1 className="text-5xl font-serif font-bold text-white mb-2 uppercase tracking-tight">The Gentleman's Gamble</h1>
                    <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Fantasy Golf Weekly</p>
                </div>

                <div className="space-y-12">
                    {/* Overview */}
                    <section className="masters-card">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-6 flex items-center gap-2">
                            <span>🎯</span> Overview
                        </h2>
                        <div className="text-gray-700 space-y-4 text-lg leading-relaxed">
                            <p>
                                <span className="text-[#00573F] font-bold">The Gentleman's Gamble</span> is a prestige season-long fantasy golf competition where 40 players
                                compete for a <span className="text-[#00573F] font-bold">$20,000 prize pool</span>.
                            </p>
                            <p>
                                Each week, you pick one PGA Tour golfer to represent your team. Your score
                                is calculated based on the official prize money your golfer wins at that specific tournament.
                            </p>
                        </div>
                    </section>

                    {/* Entry */}
                    <section className="masters-card">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-6 flex items-center gap-2">
                            <span>💵</span> Entry Fee & Prize Pool
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Buy-In</p>
                                <p className="text-4xl font-serif font-bold text-[#1A1A1A]">$500</p>
                            </div>
                            <div className="bg-[#00573F] rounded-2xl p-8 text-center text-white shadow-xl transform hover:scale-[1.02] transition">
                                <p className="text-[#FDDA0D] text-xs font-bold uppercase tracking-widest mb-1">
                                    {teamCount >= 40 ? 'Official Prize Pool' : 'Estimated Prize Pool'}
                                </p>
                                <p className="text-4xl font-serif font-bold italic">
                                    ${(teamCount * 500).toLocaleString()}
                                </p>
                                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-2 leading-none">
                                    {teamCount} / 40 Teams Registered
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Divisions */}
                    <section className="masters-card">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-6 flex items-center gap-2">
                            <span>🤝</span> Divisions
                        </h2>
                        <p className="text-gray-700 mb-6">
                            The 40 competing teams are randomly assigned to four iconic divisions, each consisting of 10 teams:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["Nicklaus", "Woods", "Hogan", "Jones"].map((div) => (
                                <div key={div} className="bg-white border border-gray-100 rounded-xl p-5 text-center shadow-sm">
                                    <p className="text-[#00573F] font-bold text-lg mb-1">{div}</p>
                                    <p className="text-gray-400 text-xs">10 Teams</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Scoring */}
                    <section className="masters-card">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-8 flex items-center gap-2">
                            <span>📝</span> Scoring System
                        </h2>
                        <div className="grid gap-6">
                            <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="bg-[#00573F] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <p className="font-bold text-[#1A1A1A] text-lg">Weekly Selection</p>
                                    <p className="text-gray-600 mt-1">
                                        Select exactly one golfer before the first tee time of each tournament.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="bg-[#00573F] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <p className="font-bold text-[#1A1A1A] text-lg">Earnings-Based Points</p>
                                    <p className="text-gray-600 mt-1">
                                        You earn 1 point for every $1 USD your picked golfer earns in that tournament.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-[#FDDA0D]/10 rounded-2xl border border-[#FDDA0D]/30">
                                <div className="bg-[#00573F] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <p className="font-bold text-[#1A1A1A] text-lg">Event Boost Multipliers 🚀</p>
                                    <p className="text-gray-600 mt-1">
                                        Earn even more points during prestige events on the calendar:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-[#00573F] font-serif font-bold text-xl">The Majors</p>
                                                <span className="bg-[#00573F] text-white px-3 py-1 rounded-full font-bold text-sm">2X BOOST</span>
                                            </div>
                                            <p className="text-gray-500 text-xs italic">Masters, US Open, Open Championship, PGA Champ</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-[#00573F] font-serif font-bold text-xl">Signature & FedEx Playoffs</p>
                                                <span className="bg-[#00573F] text-white px-3 py-1 rounded-full font-bold text-sm">1.5X BOOST</span>
                                            </div>
                                            <p className="text-gray-500 text-xs italic">Signature Events and all Season Ending Playoff events</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="bg-[#00573F] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                                <div>
                                    <p className="font-bold text-[#1A1A1A] text-lg">The Cut Line</p>
                                    <p className="text-gray-600 mt-1">
                                        If your golfer misses the cut or withdraws, you earn zero points for that week. No exceptions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Golfer Reuse Rule */}
                    <section className="masters-card border-l-8 border-[#FDDA0D]">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-4 flex items-center gap-2">
                            <span>⚠️</span> The "Once-Only" Rule
                        </h2>
                        <div className="text-gray-700 space-y-4">
                            <p className="text-xl">
                                <span className="text-[#1A1A1A] font-bold">Each golfer can only be used ONCE per season.</span>
                            </p>
                            <p className="text-gray-600">
                                Strategy is key. Once you utilize a golfer, they are removed from your available roster for the remainder of the year.
                            </p>
                            <div className="bg-[#FDDA0D]/10 border border-[#FDDA0D]/50 rounded-xl p-6 mt-6">
                                <p className="text-[#00573F] font-bold text-lg mb-2">🏆 The Champion's Exception</p>
                                <p className="text-gray-700 leading-relaxed">
                                    If the golfer you picked <span className="text-black font-bold">wins the tournament</span>,
                                    their name is restored to your available field. This reward allows elite pickers to capitalize on the tour's top talent multiple times.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* The Postseason */}
                    <section className="masters-card bg-gradient-to-br from-white to-green-50/30">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-6 flex items-center gap-2">
                            <span>⛳</span> The Postseason
                        </h2>
                        <div className="space-y-6">
                            <p className="text-gray-700 leading-relaxed">
                                The regular season concludes before the FedEx Cup Playoffs. The field is then narrowed to an elite 8-team playoff bracket to determine the seasonal champion.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                                    <p className="text-[#00573F] font-bold uppercase text-[10px] tracking-widest mb-3">Qualification</p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        The <span className="font-bold">top 2 teams</span> from each of the 4 divisions (Nicklaus, Woods, Hogan, Jones) automatically qualify for the postseason.
                                    </p>
                                </div>
                                <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                                    <p className="text-[#00573F] font-bold uppercase text-[10px] tracking-widest mb-3">Seeding & Format</p>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Qualified teams are seeded 1-8 based on total season earnings. The playoffs span the <span className="font-bold">final 3 weeks</span> of the PGA Tour season. Only qualified teams continue to earn points during this window.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payouts */}
                    <section className="masters-card border-t-4 border-t-[#FDDA0D]">
                        <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-6 flex items-center gap-2">
                            <span>🏆</span> The Prize Purse Distribution
                        </h2>
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                            The Gentleman's Gamble rewards both the season-long grind and the pressure of the postseason.
                            100% of the $20,000 pool is redistributed to the winners.
                        </p>

                        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-[#00573F] text-white">
                                    <tr>
                                        <th className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Category / Placement</th>
                                        <th className="py-4 px-6 font-bold uppercase text-[10px] tracking-widest text-right">Prize Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 italic">
                                    {/* The Postseason */}
                                    <tr className="bg-green-50/50">
                                        <td colSpan={2} className="py-3 px-6 text-[10px] font-black text-[#00573F] uppercase tracking-tighter">The Postseason (Playoff Bracket)</td>
                                    </tr>
                                    <tr className="bg-yellow-50/40 not-italic">
                                        <td className="py-4 px-6 font-bold text-[#1A1A1A]">Playoff Champion 🏆</td>
                                        <td className="py-4 px-6 font-serif font-bold text-[#00573F] text-right text-xl">$6,250</td>
                                    </tr>
                                    <tr className="not-italic">
                                        <td className="py-4 px-6 font-semibold text-gray-700">Playoff Runner-Up</td>
                                        <td className="py-4 px-6 font-mono font-bold text-gray-900 text-right">$3,000</td>
                                    </tr>
                                    <tr className="not-italic">
                                        <td className="py-2 px-6 text-sm text-gray-500">Semifinalists (2x)</td>
                                        <td className="py-2 px-6 font-mono font-bold text-gray-400 text-right text-sm">$500 ea. ($1,000)</td>
                                    </tr>

                                    {/* Regular Season */}
                                    <tr className="bg-blue-50/30">
                                        <td colSpan={2} className="py-3 px-6 text-[10px] font-black text-blue-800 uppercase tracking-tighter">Regular Season (Overall Earnings)</td>
                                    </tr>
                                    <tr className="not-italic">
                                        <td className="py-4 px-6 font-bold text-[#1A1A1A]">Overall 1st Place (Season Leader)</td>
                                        <td className="py-4 px-6 font-serif font-bold text-blue-900 text-right text-lg">$4,250</td>
                                    </tr>
                                    <tr className="not-italic">
                                        <td className="py-4 px-6 font-semibold text-gray-700">Overall 2nd Place</td>
                                        <td className="py-4 px-6 font-mono font-bold text-gray-900 text-right">$2,500</td>
                                    </tr>
                                    <tr className="not-italic text-sm">
                                        <td className="py-4 px-6 font-semibold text-gray-600">Overall 3rd Place</td>
                                        <td className="py-4 px-6 font-mono font-bold text-gray-800 text-right">$1,500</td>
                                    </tr>

                                    {/* Division Bonuses */}
                                    <tr className="bg-gray-50">
                                        <td colSpan={2} className="py-3 px-6 text-[10px] font-black text-gray-500 uppercase tracking-tighter">Merit Bonuses</td>
                                    </tr>
                                    <tr className="not-italic">
                                        <td className="py-4 px-6 font-semibold text-gray-700">Division Winners (4x)</td>
                                        <td className="py-4 px-6 font-mono font-bold text-gray-900 text-right text-sm">$250 ea. ($1,000)</td>
                                    </tr>

                                    {/* Admin */}
                                    <tr className="bg-gray-50/80 not-italic border-t border-gray-100">
                                        <td className="py-4 px-6 text-sm text-gray-700 font-bold flex items-center gap-2">
                                            <span>🛠️</span> Commissioner Fee (2.5% Site Fees)
                                        </td>
                                        <td className="py-4 px-6 font-mono font-black text-[#1A1A1A] text-right text-sm">$500</td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-[#00573F]/5 border-t-2 border-gray-200">
                                    <tr>
                                        <td className="py-5 px-6 font-black uppercase text-xs text-[#00573F]">Total Entry Pool (40 x $500)</td>
                                        <td className="py-5 px-6 font-serif font-black text-[#00573F] text-right text-2xl">$20,000</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <p className="mt-4 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                            * Prizes are cumulative. The Commissioner's fee covers high-performance hosting and individual team performance reporting.
                        </p>
                    </section>

                    {/* CTA */}
                    <div className="text-center pt-8">
                        <Link
                            href="/register"
                            className="inline-block px-10 py-5 bg-[#00573F] text-white font-bold text-xl rounded-full shadow-2xl hover:bg-[#003829] transition transform hover:-translate-y-1"
                        >
                            Start Your Team ⛳
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
