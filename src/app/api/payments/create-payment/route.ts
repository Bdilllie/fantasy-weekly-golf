import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const LEAGUE_BUY_IN = 51500; // $515.00 in cents (includes Stripe fees)

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();

        if (!teamId) {
            return NextResponse.json({ error: "Team ID required" }, { status: 400 });
        }

        // Verify team exists and hasn't already paid
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { user: true }
        });

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        if (team.isPaid) {
            return NextResponse.json({ error: "Team has already paid" }, { status: 400 });
        }

        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: LEAGUE_BUY_IN,
            currency: "usd",
            metadata: {
                teamId: team.id,
                teamName: team.name,
                userEmail: team.user.email || "",
                type: "league_buyin"
            },
            description: `The Gentleman's Gamble 2026 - ${team.name}`,
        });

        // Create pending payment transaction
        await prisma.paymentTransaction.create({
            data: {
                teamId: team.id,
                amount: LEAGUE_BUY_IN,
                type: "BUY_IN",
                stripeId: paymentIntent.id,
                status: "pending"
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount: LEAGUE_BUY_IN
        });

    } catch (error) {
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}
