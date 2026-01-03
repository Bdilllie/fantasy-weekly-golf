import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import PaymentStatusTable from "@/components/PaymentStatusTable";

// Sample tournament data (will be fetched from API later)
const CURRENT_TOURNAMENT = {
  name: "Sony Open in Hawaii",
  week: 1,
  dates: "Jan 15-18, 2026",
  location: "Honolulu, HI",
  firstTeeTime: "12:45 PM EST",
  status: "upcoming",
};

const REMAINING_TOURNAMENTS = [
  { week: 1, name: "Sony Open in Hawaii", dates: "Jan 15-18", type: "PGA TOUR" },
  { week: 2, name: "The American Express", dates: "Jan 22-25", type: "PGA TOUR" },
  { week: 3, name: "Farmers Insurance Open", dates: "Jan 29-Feb 1", type: "PGA TOUR" },
  { week: 4, name: "WM Phoenix Open", dates: "Feb 5-8", type: "PGA TOUR" },
  { week: 5, name: "AT&T Pebble Beach Pro-Am", dates: "Feb 12-15", type: "SIGNATURE" },
];

async function getStandings() {
  const teams = await prisma.team.findMany({
    orderBy: { totalPoints: "desc" },
    include: {
      user: {
        select: { name: true },
      },
    },
  });
  return teams as any;
}

async function getDivisionStandings() {
  const divisions = ["Nicklaus", "Woods", "Hogan", "Jones"];
  const result: Record<string, Array<{
    id: string;
    name: string;
    totalPoints: number;
    clinchedPlayoffs: boolean;
    clinchedDivision: boolean;
    user: { name: string | null } | null
  }>> = {};

  for (const div of divisions) {
    const teams = await prisma.team.findMany({
      where: { division: div },
      orderBy: { totalPoints: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });
    result[div] = teams as any;
  }

  return result;
}

async function getCurrentTournament() {
  const tournament = await prisma.tournament.findFirst({
    where: { status: { in: ["active", "upcoming"] } },
    orderBy: { weekNum: "asc" },
  });
  return tournament;
}

async function getUpcomingTournaments() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: "upcoming" },
    orderBy: { weekNum: "asc" },
    take: 5,
  });
  return tournaments;
}

async function getTeamCount() {
  return await prisma.team.count();
}

export default async function HomePage() {
  const [standings, divisionStandings, teamCount] = await Promise.all([
    getStandings(),
    getDivisionStandings(),
    getTeamCount()
  ]);
  const currentTournament = await getCurrentTournament();
  const upcomingTournaments = await getUpcomingTournaments();

  const displayTournaments = upcomingTournaments.length > 0
    ? upcomingTournaments.map((t: any) => ({ week: t.weekNum, name: t.name, dates: t.dates, type: t.type }))
    : REMAINING_TOURNAMENTS;

  const getBoost = (type?: string | null) => {
    if (!type) return null;
    const t = type.toUpperCase();
    if (t === "MAJOR") return { label: "2X BOOST", color: "bg-[#00573F] text-white" };
    if (t === "SIGNATURE" || t === "FEDEX") return { label: "1.5X BOOST", color: "bg-[#FDDA0D] text-[#00573F]" };
    return null;
  };

  const boost = currentTournament ? getBoost(currentTournament.type) : null;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Week Banner */}
        <section className="masters-card bg-gradient-to-r from-[#FDDA0D]/20 to-transparent border border-[#FDDA0D]/50 mb-8 p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
          {boost && (
            <div className={`absolute top-0 right-0 px-4 py-1 font-bold text-xs uppercase tracking-widest ${boost.color} rounded-bl-lg shadow-sm animate-pulse`}>
              {boost.label} Event
            </div>
          )}
          <div>
            <p className="text-[#00573F] font-bold text-sm uppercase tracking-widest mb-1">
              Week {currentTournament?.weekNum || 0} • {currentTournament?.status === "active" ? "In Progress" : "Upcoming"}
            </p>
            <h2 className="text-3xl font-serif font-bold text-[#1A1A1A] flex items-center gap-3">
              {currentTournament?.name || "No Upcoming Tournament"}
              {boost && <span className="text-xl">🚀</span>}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-500 font-medium mt-1">
              <span>PGA TOUR Schedule</span>
              <span className="hidden sm:inline">•</span>
              <span>{currentTournament?.dates || "-"}</span>
            </div>
            {boost && (
              <p className="text-[#00573F] text-xs font-bold mt-2 uppercase tracking-tighter">
                🔥 This is a {currentTournament?.type} event! All points are multiplied by {boost.label.split(' ')[0]}.
              </p>
            )}
          </div>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-[#00573F] text-white font-bold rounded-full shadow hover:bg-[#003829] transition transform hover:-translate-y-1 z-10"
          >
            Make Your Pick
          </Link>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-8">
            <section className="masters-card">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#00573F] flex items-center gap-2">
                  <span>🏆</span> Current Leaderboard
                </h2>
                <span className="text-xs font-bold uppercase text-gray-400">Live Updates</span>
              </div>

              {standings.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-400 text-lg">No teams registered yet</p>
                  <Link
                    href="/register"
                    className="inline-block mt-4 px-6 py-2 bg-[#00573F] text-white font-bold rounded-lg hover:bg-[#003829] transition"
                  >
                    Join the League
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm md:text-base">
                    <thead>
                      <tr className="border-b-2 border-[#00573F]/10 text-[#00573F]">
                        <th className="py-2 px-4 text-left font-serif font-bold w-16">Pos</th>
                        <th className="py-2 px-4 text-left font-serif font-bold">Team</th>
                        <th className="py-2 px-4 text-left font-serif font-bold">Division</th>
                        <th className="py-2 px-4 text-right font-serif font-bold">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {standings.slice(0, 15).map((team: any, index: number) => (
                        <tr key={team.id} className="hover:bg-gray-50 transition">
                          <td className="py-2.5 px-4 font-bold text-gray-400">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-gray-800">
                            <span className="flex items-center gap-1">
                              {team.name}
                              {team.clinchedDivision && <span className="text-blue-600 font-black text-[10px]" title="Clinched Division">Y</span>}
                              {team.clinchedPlayoffs && !team.clinchedDivision && <span className="text-green-600 font-black text-[10px]" title="Clinched Playoffs">X</span>}
                            </span>
                            <div className="text-xs text-gray-400 font-normal uppercase tracking-wider mt-0.5">{team.user?.name}</div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-block px-2 py-0.5 bg-[#00573F]/5 text-[#00573F] text-xs font-bold rounded uppercase">
                              {team.division || "-"}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-[#00573F]">
                            ${team.totalPoints.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-6 text-center">
                <Link href="/standings" className="text-[#00573F] font-bold text-sm hover:underline hover:text-[#003829]">
                  View Full Standings →
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Remaining Tournaments */}
            <section className="masters-card bg-[#F5F5F5]">
              <h3 className="text-lg font-serif font-bold text-[#1A1A1A] mb-4">Upcoming Schedule</h3>
              <div className="space-y-3">
                {displayTournaments.map((t: any) => {
                  const tBoost = getBoost(t.type);
                  return (
                    <div
                      key={t.week}
                      className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-0.5">
                          <p className="text-[#1A1A1A] text-sm font-bold">{t.name}</p>
                          {tBoost && (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${tBoost.color} border border-current/10 whitespace-nowrap`}>
                              {t.type} {tBoost.label.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <p className="text-[#00573F] text-xs font-medium">{t.dates}</p>
                      </div>
                      <span className="text-gray-400 text-xs font-mono ml-4">Wk {t.week}</span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/schedule"
                className="block text-center text-[#00573F] font-bold text-sm mt-6 hover:underline"
              >
                Full 2026 Schedule →
              </Link>
            </section>
            {/* Prize Pool */}
            <section className="masters-card bg-[#00573F] text-center text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition">
                <span className="text-6xl font-serif font-bold italic">$</span>
              </div>
              <div className="relative z-10">
                <p className="text-[#FDDA0D] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  {teamCount >= 40 ? 'Official Prize Pool' : 'Estimated Prize Pool'}
                </p>
                <div className="mb-4">
                  <p className="text-4xl font-serif font-bold text-white leading-none">
                    ${(teamCount * 500).toLocaleString()}
                  </p>
                  <p className="text-[#FDDA0D] text-[10px] font-bold mt-1 opacity-80 italic">
                    Based on {teamCount} entrants
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-[180px] mx-auto mb-4">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-[#FDDA0D] shadow-[0_0_10px_#FDDA0D] transition-all duration-1000"
                      style={{ width: `${Math.min((teamCount / 40) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1.5 px-0.5">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">{teamCount} / 40</span>
                    <span className="text-[8px] font-black text-[#FDDA0D] uppercase tracking-tighter">
                      {teamCount >= 40 ? 'LEAGUE FULL' : `${40 - teamCount} SPOTS LEFT`}
                    </span>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="inline-block w-full py-2.5 bg-[#FDDA0D] text-[#00573F] text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors shadow-lg"
                >
                  {teamCount >= 40 ? 'Join Waitlist' : 'Reserve My Spot'}
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* Division Standings Section */}
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-[#FDDA0D] rounded-full"></div>
            <h2 className="text-3xl font-serif font-bold text-white uppercase tracking-tight">Division Standings</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Nicklaus", "Woods", "Hogan", "Jones"].map((div) => (
              <div key={div} className="masters-card p-0 overflow-hidden border-t-4 border-t-[#00573F] bg-white">
                <div className="bg-[#00573F] p-3 text-center">
                  <h3 className="text-white font-bold uppercase tracking-[0.2em] text-[10px]">{div} Division</h3>
                </div>
                <div className="p-1">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100 uppercase text-[9px] font-bold">
                        <th className="py-2 px-2 text-left">Team</th>
                        <th className="py-2 px-2 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Show actual teams plus placeholders to always show 10 rows */}
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const team = (divisionStandings[div] || [])[idx];
                        if (team) {
                          return (
                            <tr key={team.id} className={`border-b border-gray-50 last:border-0 ${idx < 2 ? 'bg-green-50/50' : ''}`}>
                              <td className="py-2 px-2 font-bold text-gray-800 flex items-center gap-1">
                                <span className="truncate max-w-[120px]">{team.name}</span>
                                {team.clinchedDivision && <span className="text-blue-600 font-black text-[10px]" title="Clinched Division">Y</span>}
                                {team.clinchedPlayoffs && !team.clinchedDivision && <span className="text-green-600 font-black text-[10px]" title="Clinched Playoffs">X</span>}
                              </td>
                              <td className="py-2 px-2 text-right font-bold text-[#00573F]">
                                ${(team.totalPoints / 1000000).toFixed(1)}M
                              </td>
                            </tr>
                          );
                        }
                        return (
                          <tr key={`placeholder-${div}-${idx}`} className="border-b border-gray-50 last:border-0 opacity-20">
                            <td className="py-2 px-2 font-medium text-gray-400 italic">
                              Open Slot {idx + 1}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-gray-300">
                              $0.0M
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-2 bg-gray-50 text-[9px] text-gray-400 italic text-center">
                    Top 2 teams advance to Playoffs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Playoff Picture Section */}
        <section className="mt-12 mb-12">
          <div className="masters-card border-l-8 border-[#FDDA0D] bg-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#00573F] flex items-center gap-3">
                <span>⛳</span> The Playoff Picture
              </h2>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><span className="text-green-600">X</span> Clinched Playoffs</span>
                <span className="flex items-center gap-1"><span className="text-blue-600">Y</span> Clinched Division</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-[#00573F] uppercase text-[10px] font-black">
                      <th className="py-3 px-4 text-left">Seed</th>
                      <th className="py-3 px-4 text-left">Team</th>
                      <th className="py-3 px-4 text-left">Div</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {/* Calculate top 8 seeds: top 2 from each division, then sorted by points */}
                    {(() => {
                      const allPlayoffTeams = Object.values(divisionStandings)
                        .flatMap(teams => teams.slice(0, 2))
                        .sort((a, b) => b.totalPoints - a.totalPoints);

                      return allPlayoffTeams.map((team, idx) => (
                        <tr key={team.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4 font-bold text-gray-400">#{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">
                            {team.name}
                            {team.clinchedDivision && <span className="ml-1 text-blue-600">Y</span>}
                            {team.clinchedPlayoffs && !team.clinchedDivision && <span className="ml-1 text-green-600">X</span>}
                          </td>
                          <td className="py-3 px-4 uppercase text-[10px] font-bold text-gray-500">{(team as any).division}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#00573F]">${team.totalPoints.toLocaleString()}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-[#00573F] font-bold uppercase text-xs tracking-widest mb-4">Postseason Rules</h4>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>
                    <span className="font-bold text-gray-800">Qualification:</span> The top two teams from each of the four divisions qualify for the postseason (8 teams total).
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Seeding:</span> Teams are seeded 1-8 based on their total season earnings. The divisions ensure that even if you aren't leading the overall league, you can secure a spot by winning your division.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">The Tournament:</span> The playoffs take place during the final three weeks of the FedEx Cup season. Only the 8 qualified teams continue to earn points during this period to determine the champion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Status Table */}
        <section className="mt-12 mb-12">
          <PaymentStatusTable />
        </section>
      </main>
    </div>
  );
}
