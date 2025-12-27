import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, name, teamName } = await request.json();

        if (!email || !password || !name || !teamName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 400 }
            );
        }

        // Check if team name exists
        const existingTeam = await prisma.team.findUnique({
            where: { name: teamName },
        });

        if (existingTeam) {
            return NextResponse.json(
                { error: "Team name already taken" },
                { status: 400 }
            );
        }

        // Check team count (max 40)
        const teamCount = await prisma.team.count();
        if (teamCount >= 40) {
            return NextResponse.json(
                { error: "League is full (40 teams max)" },
                { status: 400 }
            );
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                team: {
                    create: {
                        name: teamName,
                    },
                },
            },
            include: {
                team: true,
            },
        });

        return NextResponse.json({
            message: "Registration successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                team: user.team,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed" },
            { status: 500 }
        );
    }
}
