"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getTeamCount } from "@/app/actions";

export default function Header() {
    const { data: session } = useSession();
    const [count, setCount] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        getTeamCount().then(setCount);
    }, []);

    return (
        <header className="bg-[#00573F] border-b border-white/10 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link href="/" className="hover:opacity-90 transition flex items-center gap-3">
                        <span className="text-2xl md:text-3xl">⛳</span>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg md:text-xl font-serif font-bold text-white uppercase tracking-tighter">
                                The Gentleman's <span className="text-[#FDDA0D]">Gamble</span>
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-[0.2em] mt-0.5">
                                Fantasy Golf Weekly
                            </span>
                        </div>
                    </Link>
                    {count !== null && (
                        <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 font-bold tracking-wider">
                            {count}/40
                        </span>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-white p-2"
                >
                    {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    )}
                </button>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/schedule" className="text-gray-200 hover:text-white transition font-bold text-sm uppercase tracking-wide">Schedule</Link>
                    <Link href="/picks" className="text-gray-200 hover:text-white transition font-bold text-sm uppercase tracking-wide">Picks</Link>
                    <Link href="/rules" className="text-gray-200 hover:text-white transition font-bold text-sm uppercase tracking-wide">Rules</Link>

                    {session ? (
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <Link href="/dashboard" className="text-[#FDDA0D] font-bold text-sm uppercase tracking-wide">{session.user?.name || "Dashboard"}</Link>
                            <button onClick={() => signOut()} className="text-white/40 hover:text-white text-[10px] uppercase font-bold">Sign Out</button>
                        </div>
                    ) : (
                        <Link href="/login" className="px-5 py-2 bg-[#FDDA0D] text-[#00573F] font-bold rounded-full hover:bg-white transition text-sm">Sign In</Link>
                    )}
                </nav>
            </div>

            {/* Mobile Nav Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#004430] border-t border-white/10 px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <Link href="/schedule" onClick={() => setIsMenuOpen(false)} className="block text-white font-bold text-lg">Schedule</Link>
                    <Link href="/picks" onClick={() => setIsMenuOpen(false)} className="block text-white font-bold text-lg">Picks</Link>
                    <Link href="/rules" onClick={() => setIsMenuOpen(false)} className="block text-white font-bold text-lg">Rules</Link>
                    <div className="pt-4 border-t border-white/10">
                        {session ? (
                            <div className="space-y-4">
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-[#FDDA0D] font-bold text-lg">{session.user?.name || "Dashboard"}</Link>
                                <button onClick={() => signOut()} className="block text-white/40 font-bold uppercase text-xs">Sign Out</button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block text-center py-3 bg-[#FDDA0D] text-[#00573F] font-bold rounded-lg mt-2">Sign In</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
