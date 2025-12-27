"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-[#00573F] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-serif font-bold text-white mb-2">
                        Fantasy Golf
                    </h1>
                    <p className="text-[#FDDA0D] font-bold uppercase tracking-widest text-sm">Members Only</p>
                </div>

                {/* Card */}
                <div className="masters-card shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00573F] focus:border-transparent transition"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00573F] focus:border-transparent transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-[#00573F] text-white font-bold rounded-lg hover:bg-[#003829] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                        >
                            {loading ? "Authenticating..." : "Sign In to Dashboard"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-1 border-t border-gray-100"></div>
                        <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                        <div className="flex-1 border-t border-gray-100"></div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const result = await signIn("google", { callbackUrl: "/dashboard" });
                                if (result?.error) {
                                    setError("Google authentication is not configured. Please use Email/Password.");
                                }
                            } catch (e) {
                                setError("Connection failed. Check your configuration.");
                            }
                        }}
                        className="w-full py-4 px-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-gray-500 text-sm">
                        Don&apos;t have a team yet?{" "}
                        <Link href="/register" className="text-[#00573F] hover:underline font-bold">
                            Join the League
                        </Link>
                    </p>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                        Est. 2025 • $20k Prize Pool • 40 Teams
                    </p>
                </div>
            </div>
        </div>
    );
}
