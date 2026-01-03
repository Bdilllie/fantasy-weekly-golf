import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ManualPaymentPage from "@/components/ManualPaymentPage";
import Header from "@/components/Header";
import Link from "next/link";

export default async function PaymentPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { team: true }
    });

    if (!user || !user.team) {
        redirect("/register");
    }

    if (user.team.isPaid) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <div className="masters-card text-center">
                        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-[#00573F] mb-2">Payment Received</h1>
                        <p className="text-gray-600 mb-6">
                            Your team <strong>{user.team.name}</strong> is all set for the 2026 season!
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 inline-block">
                            <p className="text-sm text-gray-600 mb-2">Payment Confirmed</p>
                            <p className="text-2xl font-bold text-green-600">$515.00</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Paid on {user.team.paidAt ? new Date(user.team.paidAt).toLocaleDateString() : "recently"}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="block px-8 py-3 bg-[#00573F] text-white font-bold rounded-full hover:bg-[#003829] transition"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/rules"
                                className="block px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition"
                            >
                                Review Rules
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <ManualPaymentPage
                    teamId={user.team.id}
                    teamName={user.team.name}
                    userName={user.name || "Unknown"}
                />

                <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                    <h3 className="font-bold text-gray-800 mb-4">What happens after payment?</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Notify Commissioner:</strong> Click the button above after paying on Venmo.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Manual Verification:</strong> The commissioner will verify your payment and activate your account.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span><strong>Start Playing:</strong> Once verified, you can access the full dashboard and make picks.</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
