"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
    teamId: string;
    teamName: string;
    onSuccess: () => void;
}

function CheckoutForm({ teamId, teamName, onSuccess }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success?team=${teamId}`,
            },
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed");
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-4 bg-[#00573F] text-white font-bold text-lg rounded-lg hover:bg-[#003829] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
                {isProcessing ? "Processing..." : "Pay $515.00"}
            </button>

            <p className="text-xs text-gray-500 text-center">
                This includes a $15.00 processing fee. Secured by Stripe.
            </p>
        </form>
    );
}

export default function PaymentButton({ teamId, teamName }: { teamId: string; teamName: string }) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createPaymentIntent = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/payments/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId }),
            });

            const data = await response.json();

            if (response.ok) {
                setClientSecret(data.clientSecret);
            } else {
                alert(data.error || "Failed to initialize payment");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Payment initialization error:", error);
            alert("Failed to initialize payment");
            setIsLoading(false);
        }
    };

    if (clientSecret) {
        return (
            <div className="masters-card max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-2">Complete Your Payment</h2>
                <p className="text-gray-600 mb-6">Team: <strong>{teamName}</strong></p>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                        teamId={teamId}
                        teamName={teamName}
                        onSuccess={() => {
                            window.location.href = "/payment/success";
                        }}
                    />
                </Elements>
            </div>
        );
    }

    return (
        <div className="masters-card max-w-2xl mx-auto text-center">
            <div className="mb-6">
                <div className="inline-block p-4 bg-[#00573F]/5 rounded-full mb-4">
                    <svg className="w-16 h-16 text-[#00573F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#00573F] mb-2">Secure Your Spot</h2>
                <p className="text-gray-600 mb-4">Team: <strong>{teamName}</strong></p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">League Buy-in</span>
                    <span className="font-bold">$500.00</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Processing Fee</span>
                    <span className="text-sm">$15.00</span>
                </div>
                <div className="border-t-2 border-gray-300 my-3"></div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-[#00573F]">$515.00</span>
                </div>
            </div>

            <button
                onClick={createPaymentIntent}
                disabled={isLoading}
                className="w-full py-4 bg-[#00573F] text-white font-bold text-lg rounded-lg hover:bg-[#003829] disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
            >
                {isLoading ? "Loading..." : "Proceed to Payment"}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secured by Stripe • SSL Encrypted
            </div>
        </div>
    );
}
