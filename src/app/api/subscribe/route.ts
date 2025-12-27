import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // Check if already user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: "Already subscribed as user" });
        }

        // Upsert subscriber
        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {},
            create: { email },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
