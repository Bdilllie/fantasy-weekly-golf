"use client";

import { useState } from "react";
import { submitPick } from "@/app/actions";

interface PickFormProps {
    tournamentId: string;
    usedGolfers: string[];
    golfers: string[];
    multiplier?: number;
}

export default function PickForm({ tournamentId, usedGolfers, golfers, multiplier = 1 }: PickFormProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(formData: FormData) {
        setStatus("loading");
        setMessage("");

        const result = await submitPick(formData);

        if (result?.error) {
            setStatus("error");
            setMessage(result.error);
        } else {
            setStatus("success");
            setMessage("Pick locked in! Good luck.");
        }
    }

    // Wrap form action to intercept
    const formAction = async (formData: FormData) => {
        await handleSubmit(formData);
    };

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="tournamentId" value={tournamentId} />

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-[#1A1A1A] font-bold">Select Golfer</label>
                    {multiplier > 1 && (
                        <div className="bg-[#FDDA0D] text-[#00573F] text-[10px] px-2 py-0.5 rounded-full font-bold animate-bounce mt-[-10px]">
                            {multiplier}X POINTS THIS WEEK! 🚀
                        </div>
                    )}
                </div>
                <div className="relative">
                    <select
                        name="golferName"
                        className="w-full p-4 bg-white border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-[#00573F] focus:border-[#00573F] outline-none shadow-sm text-gray-900 appearance-none cursor-pointer pr-12"
                        required
                    >
                        <option value="">-- Choose a Golfer --</option>
                        {golfers.map(golfer => {
                            const isUsed = usedGolfers.includes(golfer);
                            return (
                                <option key={golfer} value={golfer} disabled={isUsed} className={isUsed ? "text-gray-300 bg-gray-50" : "text-gray-900 font-medium"}>
                                    {golfer} {isUsed ? "(Used)" : ""}
                                </option>
                            )
                        })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#00573F] z-10">
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>ℹ️</span> You cannot reuse golfers unless they won when you picked them.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-bold ${status === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full py-4 bg-[#00573F] text-white text-xl font-bold rounded-lg shadow-lg hover:bg-[#003829] transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
            >
                {status === "loading" ? "Locking in..." : status === "success" ? "Locked!" : "Lock In Pick 🔒"}
            </button>
        </form>
    );
}
