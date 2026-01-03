import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { teamName, userName } = await request.json();

        if (!teamName || !userName) {
            return NextResponse.json({ error: "Missing information" }, { status: 400 });
        }

        const adminUrl = process.env.SITE_URL ? `${process.env.SITE_URL}/commissioner` : "http://localhost:3000/commissioner";

        await resend.emails.send({
            from: 'Fantasy Golf <onboarding@resend.dev>', // Temporary until domain verification
            to: 'Bdillie@gmail.com',
            subject: `💰 Payment Notification: ${teamName}`,
            html: `
                <h1>New Payment Alert</h1>
                <p><strong>${userName}</strong> has marked their team <strong>${teamName}</strong> as paid via Venmo.</p>
                <p>Please check your Venmo transaction history to verify payment from @${userName} (or check notes).</p>
                <br/>
                <a href="${adminUrl}" style="background-color: #00573F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Go to Commissioner Dashboard
                </a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Click the button above to manually toggle their payment status to "Active".
                </p>
            `
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Notification error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
