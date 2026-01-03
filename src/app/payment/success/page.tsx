import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Header";
import Link from "next/link";

export default async function PaymentSuccessPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="masters-card text-center">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-4 animate-bounce">
                        <svg className="w-20 h-20 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl font-serif font-bold text-[#00573F] mb-3">Payment Successful!</h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Welcome to The Gentleman's Gamble 2026
                    </p>

                    <div className="bg-[#00573F]/5 border border-[#00573F]/20 rounded-xl p-6 mb-8 max-w-md mx-auto">
                        <p className="text-sm text-gray-600 mb-2">Payment Confirmed</p>
                        <p className="text-3xl font-bold text-[#00573F]">$515.00</p>
                        <p className="text-xs text-gray-500 mt-3">
                            Your $500 entry fee is now secured in escrow. The $15 processing fee has been paid.
                        </p>
                    </div>

                    <div className="space-y-4 max-w-xl mx-auto text-left mb-8">
                        <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                            <span className="text-2xl">⛳</span>
                            <div>
                                <p className="font-bold text-gray-800">Your Account is Active</p>
                                <p className="text-sm text-gray-600">You can now make picks for upcoming tournaments.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                            <span className="text-2xl">📧</span>
                            <div>
                                <p className="font-bold text-gray-800">Weekly Emails</p>
                                <p className="text-sm text-gray-600">You'll receive pick reminders and scorecards every week.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="font-bold text-gray-800">Prize Pool</p>
                                <p className="text-sm text-gray-600">Your $500 is now part of the $20,000 prize pool.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="block px-8 py-4 bg-[#00573F] text-white font-bold text-lg rounded-full hover:bg-[#003829] transition shadow-lg"
                        >
                            Go to Dashboard →
                        </Link>
                        <Link
                            href="/rules"
                            className="block px-8 py-3 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition"
                        >
                            Review League Rules
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
