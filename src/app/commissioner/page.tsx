import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import { revalidatePath } from "next/cache";

async function togglePayment(teamId: string, status: boolean) {
    "use server";
    await prisma.team.update({
        where: { id: teamId },
        data: { isPaid: status }
    });
    revalidatePath("/commissioner");
    revalidatePath("/dashboard");
}

export default async function CommissionerPage() {
    const session = await auth();

    // Only allow Brent Dillie (or authorized emails)
    const isAdmin = session?.user?.email === "brent@fantasygolf.com" || session?.user?.email === "brentdillie@gmail.com";

    if (!isAdmin) {
        redirect("/");
    }

    const teams = await prisma.team.findMany({
        include: {
            user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    const paidCount = teams.filter(t => t.isPaid).length;
    const totalCollected = paidCount * 500;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-5xl mx-auto px-4 py-12">
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-[#00573F]">Commissioner Dashboard</h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage league entries and verified payments.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Collected</p>
                            <p className="text-2xl font-serif font-bold text-[#00573F]">${totalCollected.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Paid Teams</p>
                            <p className="text-2xl font-serif font-bold text-[#00573F]">{paidCount} / 40</p>
                        </div>
                    </div>
                </div>

                <div className="masters-card p-0 overflow-hidden shadow-xl border-0">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1A1A1A] text-white">
                            <tr className="text-left font-bold uppercase text-[10px] tracking-widest">
                                <th className="px-6 py-4">Team & Owner</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-[#1A1A1A] text-base">{team.name}</div>
                                        <div className="text-gray-400 text-xs font-medium">{team.user.name} • {team.user.email}</div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {team.isPaid ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Verified Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                Payment Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <form action={async () => {
                                            "use server";
                                            await togglePayment(team.id, !team.isPaid);
                                        }}>
                                            <button
                                                type="submit"
                                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition shadow-sm ${team.isPaid
                                                        ? "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                        : "bg-[#00573F] text-white hover:bg-[#003829] hover:shadow-md"
                                                    }`}
                                            >
                                                {team.isPaid ? "Mark Unpaid" : "Confirm Payment"}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {teams.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-20 text-center text-gray-400 italic">
                                        No teams have registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 bg-[#00573F]/5 border border-[#00573F]/10 rounded-xl p-6">
                    <h4 className="text-[#00573F] font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span>💡</span> Commissioner Log
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                        When you receive a Venmo notification from a player, simply find their team above and click <strong>"Confirm Payment"</strong>.
                        This instantly unlocks their ability to enter weekly picks and adds a verified badge to their team profile.
                        Players will see your Venmo details (@Bdillie) on their dashboard until they are marked as paid.
                    </p>
                </div>
            </main>
        </div>
    );
}
