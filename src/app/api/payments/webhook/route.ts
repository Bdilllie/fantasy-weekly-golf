import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const teamId = paymentIntent.metadata.teamId;

                if (!teamId) {
                    console.error("No teamId in payment metadata");
                    break;
                }

                // Update team as paid
                await prisma.team.update({
                    where: { id: teamId },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        stripePaymentId: paymentIntent.id
                    }
                });

                // Update transaction status
                await prisma.paymentTransaction.updateMany({
                    where: { stripeId: paymentIntent.id },
                    data: { status: "succeeded" }
                });

                console.log(`✅ Payment succeeded for team: ${teamId}`);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Update transaction status to failed
                await prisma.paymentTransaction.updateMany({
                    where: { stripeId: paymentIntent.id },
                    data: { status: "failed" }
                });

                console.log(`❌ Payment failed: ${paymentIntent.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
