"use client";

import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus("success");
                setEmail("");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <footer className="bg-[#153e32] border-t border-[#1a472a] mt-20 text-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">⛳</span>
                            <div className="flex flex-col leading-none">
                                <h3 className="text-white font-serif font-bold text-xl uppercase tracking-tighter">
                                    The Gentleman's <span className="text-[#FDDA0D]">Gamble</span>
                                </h3>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                                    Fantasy Golf Weekly
                                </span>
                            </div>
                        </div>
                        <p className="text-white/70 text-sm max-w-sm">
                            The premier fantasy golf league. Pick winners, earn points, become a legend.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 font-serif">Subscribe to Weekly Roundup</h4>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#FDDA0D] flex-1 min-w-0"
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="bg-[#FDDA0D] hover:bg-[#e6c300] text-[#00573F] font-bold px-6 py-3 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                            >
                                {status === "loading" ? "..." : status === "success" ? "Joined!" : "Subscribe"}
                            </button>
                        </form>
                        {status === "error" && (
                            <p className="text-red-300 text-xs mt-2">Something went wrong. Try again.</p>
                        )}
                        {status === "success" && (
                            <p className="text-[#FDDA0D] text-xs mt-2 font-bold">Thanks for subscribing!</p>
                        )}
                    </div>
                </div>
                <div className="border-t border-white/10 mt-10 pt-8 text-center text-white/40 text-xs">
                    © 2026 The Gentleman's Gamble. Betting odds via The Odds API.
                </div>
            </div>
        </footer>
    );
}
