import { prisma } from "@/lib/prisma";

export default async function PaymentStatusTable() {
    const teams = await prisma.team.findMany({
        orderBy: [
            { isPaid: "desc" }, // Paid teams first
            { name: "asc" }
        ],
        include: {
            user: { select: { name: true } }
        }
    });

    return (
        <section className="masters-card">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#00573F] flex items-center gap-2">
                    <span>💳</span> Payment Status
                </h2>
                <span className="text-xs font-bold uppercase text-gray-400">
                    {teams.filter(t => t.isPaid).length} / {teams.length} Paid
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-[#00573F]/10 text-[#00573F]">
                            <th className="py-3 px-4 text-left font-serif font-bold">Team</th>
                            <th className="py-3 px-4 text-left font-serif font-bold">Division</th>
                            <th className="py-3 px-4 text-left font-serif font-bold">Owner</th>
                            <th className="py-3 px-4 text-center font-serif font-bold">Status</th>
                            <th className="py-3 px-4 text-center font-serif font-bold">Paid On</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {teams.map((team) => (
                            <tr key={team.id} className="hover:bg-gray-50 transition">
                                <td className="py-3 px-4 font-semibold text-gray-800">
                                    {team.name}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-block px-2 py-0.5 bg-[#00573F]/5 text-[#00573F] text-xs font-bold rounded uppercase">
                                        {team.division || "-"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                    {team.user?.name || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {team.isPaid ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-4 text-center text-gray-500 text-xs">
                                    {team.paidAt ? new Date(team.paidAt).toLocaleDateString() : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {teams.filter(t => !t.isPaid).length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ <strong>{teams.filter(t => !t.isPaid).length} team(s)</strong> have not yet completed payment. Teams must pay by the first tournament to participate.
                    </p>
                </div>
            )}
        </section>
    );
}
