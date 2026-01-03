"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ManualPaymentPage({ teamId, teamName, userName }: { teamId: string, teamName: string, userName: string }) {
    const [notifying, setNotifying] = useState(false);
    const [notified, setNotified] = useState(false);
    const router = useRouter();

    const handleNotify = async () => {
        setNotifying(true);
        try {
            const res = await fetch("/api/payments/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName, userName }),
            });

            if (res.ok) {
                setNotified(true);
            } else {
                alert("Failed to notify commissioner. Please try again.");
            }
        } catch {
            alert("Error sending notification.");
        } finally {
            setNotifying(false);
        }
    };

    if (notified) {
        return (
            <div className="masters-card text-center py-12">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-6 animate-bounce">
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#00573F] mb-4">Notification Sent!</h2>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    The commissioner has been alerted. Your specific access will be unlocked once payment is verified.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-sm mx-auto border border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold text-[#00573F] flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Pending Verification
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="masters-card text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-[#00573F] mb-2">Secure Your Spot</h2>
                <p className="text-gray-600 mb-8 font-medium">Team: {teamName}</p>

                <div className="bg-[#008CFF]/5 border border-[#008CFF]/20 rounded-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.97c.1 1.05.82 1.93 2.61 1.93 1.12 0 1.8-.6 1.8-1.55 0-.96-2.58-1.31-3.66-2.06C8.86 12.06 7.79 10.74 8.24 9.1c.42-1.55 1.71-2.63 3.42-2.94V4.18h2.67v1.93c1.33.25 2.52.98 3.1 2.37h-2.06c-.36-.93-1.07-1.41-2.27-1.41-1.12 0-1.78.69-1.78 1.55 0 1.09 2.55 1.34 3.79 2.21 1.75 1.25 2.19 2.94 1.79 4.38-.49 1.75-1.92 2.72-3.49 2.88z" />
                        </svg>
                    </div>

                    <p className="font-bold text-[#008CFF] uppercase tracking-widest text-xs mb-2">Pay via Venmo</p>
                    <p className="text-4xl font-black text-gray-900 mb-1">$500.00</p>
                    <p className="text-gray-500 text-sm mb-6">Entry Fee</p>

                    <div className="bg-white p-4 rounded-xl shadow-sm inline-block w-full max-w-xs mx-auto mb-4">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Send to</p>
                        <p className="text-2xl font-bold text-[#008CFF] mb-1">@BDillie</p>
                        <p className="text-xs text-gray-500">Last 4 digits: <strong>2134</strong></p>
                    </div>

                    <div className="text-left bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                        <p className="font-bold mb-1">📝 Internal Note:</p>
                        <p>Please include your <strong>Name</strong> or <strong>Team Name</strong> in the Venmo payment description.</p>
                    </div>
                </div>

                <button
                    onClick={handleNotify}
                    disabled={notifying}
                    className="w-full py-4 bg-[#00573F] text-white font-bold text-lg rounded-xl hover:bg-[#003829] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
                >
                    {notifying ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Notifying Commissioner...
                        </>
                    ) : (
                        <>
                            <span>🔔</span> Notify Commissioner I've Paid
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
