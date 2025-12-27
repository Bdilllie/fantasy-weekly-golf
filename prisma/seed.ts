import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TOURNAMENTS = [
    { id: "pga-2026-01", name: "Sony Open in Hawaii", dates: "Jan 15-18", purse: 8500000, type: "PGA TOUR", weekNum: 1, status: "upcoming" },
    { id: "pga-2026-02", name: "The American Express", dates: "Jan 22-25", purse: 8400000, type: "PGA TOUR", weekNum: 2, status: "upcoming" },
    { id: "pga-2026-03", name: "Farmers Insurance Open", dates: "Jan 28-31", purse: 9000000, type: "PGA TOUR", weekNum: 3, status: "upcoming" },
    { id: "pga-2026-04", name: "WM Phoenix Open", dates: "Feb 5-8", purse: 9000000, type: "PGA TOUR", weekNum: 4, status: "upcoming" },
    { id: "pga-2026-05", name: "AT&T Pebble Beach Pro-Am", dates: "Feb 12-15", purse: 20000000, type: "SIGNATURE", weekNum: 5, status: "upcoming" },
    { id: "pga-2026-06", name: "The Genesis Invitational", dates: "Feb 19-22", purse: 20000000, type: "SIGNATURE", weekNum: 6, status: "upcoming" },
    { id: "pga-2026-07", name: "Cognizant Classic in The Palm Beaches", dates: "Feb 26-Mar 1", purse: 9000000, type: "PGA TOUR", weekNum: 7, status: "upcoming" },
    { id: "pga-2026-08", name: "Arnold Palmer Invitational", dates: "Mar 5-8", purse: 20000000, type: "SIGNATURE", weekNum: 8, status: "upcoming" },
    { id: "pga-2026-09", name: "THE PLAYERS Championship", dates: "Mar 12-15", purse: 25000000, type: "PGA TOUR", weekNum: 9, status: "upcoming" },
    { id: "pga-2026-10", name: "Valspar Championship", dates: "Mar 19-22", purse: 8500000, type: "PGA TOUR", weekNum: 10, status: "upcoming" },
    { id: "pga-2026-11", name: "Texas Children's Houston Open", dates: "Mar 26-29", purse: 9500000, type: "PGA TOUR", weekNum: 11, status: "upcoming" },
    { id: "pga-2026-12", name: "Valero Texas Open", dates: "Apr 2-5", purse: 9500000, type: "PGA TOUR", weekNum: 12, status: "upcoming" },
    { id: "pga-2026-13", name: "The Masters Tournament", dates: "Apr 9-12", purse: 20000000, type: "MAJOR", weekNum: 13, status: "upcoming" },
    { id: "pga-2026-14", name: "RBC Heritage", dates: "Apr 16-19", purse: 20000000, type: "SIGNATURE", weekNum: 14, status: "upcoming" },
    { id: "pga-2026-15", name: "Zurich Classic of New Orleans", dates: "Apr 23-26", purse: 9000000, type: "PGA TOUR", weekNum: 15, status: "upcoming" },
    { id: "pga-2026-16", name: "Cadillac Championship", dates: "Apr 30-May 3", purse: 20000000, type: "SIGNATURE", weekNum: 16, status: "upcoming" },
    { id: "pga-2026-17", name: "Truist Championship", dates: "May 7-10", purse: 20000000, type: "SIGNATURE", weekNum: 17, status: "upcoming" },
    { id: "pga-2026-18", name: "PGA Championship", dates: "May 14-17", purse: 18500000, type: "MAJOR", weekNum: 18, status: "upcoming" },
    { id: "pga-2026-19", name: "THE CJ CUP Byron Nelson", dates: "May 21-24", purse: 9500000, type: "PGA TOUR", weekNum: 19, status: "upcoming" },
    { id: "pga-2026-20", name: "Charles Schwab Challenge", dates: "May 28-31", purse: 9100000, type: "PGA TOUR", weekNum: 20, status: "upcoming" },
    { id: "pga-2026-21", name: "The Memorial Tournament", dates: "Jun 4-7", purse: 20000000, type: "SIGNATURE", weekNum: 21, status: "upcoming" },
    { id: "pga-2026-22", name: "RBC Canadian Open", dates: "Jun 11-14", purse: 9500000, type: "PGA TOUR", weekNum: 22, status: "upcoming" },
    { id: "pga-2026-23", name: "U.S. Open", dates: "Jun 18-21", purse: 21500000, type: "MAJOR", weekNum: 23, status: "upcoming" },
    { id: "pga-2026-24", name: "Travelers Championship", dates: "Jun 25-28", purse: 20000000, type: "SIGNATURE", weekNum: 24, status: "upcoming" },
    { id: "pga-2026-25", name: "John Deere Classic", dates: "Jul 2-5", purse: 8000000, type: "PGA TOUR", weekNum: 25, status: "upcoming" },
    { id: "pga-2026-26", name: "Genesis Scottish Open", dates: "Jul 9-12", purse: 9000000, type: "PGA TOUR", weekNum: 26, status: "upcoming" },
    { id: "pga-2026-27", name: "The Open Championship", dates: "Jul 16-19", purse: 17000000, type: "MAJOR", weekNum: 27, status: "upcoming" },
    { id: "pga-2026-28", name: "3M Open", dates: "Jul 23-26", purse: 8500000, type: "PGA TOUR", weekNum: 28, status: "upcoming" },
    { id: "pga-2026-29", name: "Rocket Mortgage Classic", dates: "Jul 30-Aug 2", purse: 9200000, type: "PGA TOUR", weekNum: 29, status: "upcoming" },
    { id: "pga-2026-30", name: "Wyndham Championship", dates: "Aug 6-9", purse: 8500000, type: "PGA TOUR", weekNum: 30, status: "upcoming" },
    { id: "pga-2026-31", name: "FedEx St. Jude Championship", dates: "Aug 13-16", purse: 20000000, type: "FEDEX", weekNum: 31, status: "upcoming" },
    { id: "pga-2026-32", name: "BMW Championship", dates: "Aug 20-23", purse: 20000000, type: "FEDEX", weekNum: 32, status: "upcoming" },
    { id: "pga-2026-33", name: "TOUR Championship", dates: "Aug 27-30", purse: 25000000, type: "FEDEX", weekNum: 33, status: "upcoming" },
];

const GOLFERS = [
    "Scottie Scheffler", "Rory McIlroy", "Xander Schauffele", "Ludvig Aberg",
    "Wyndham Clark", "Collin Morikawa", "Viktor Hovland", "Patrick Cantlay",
    "Max Homa", "Jordan Spieth"
];

const DIVISIONS = ["Nicklaus", "Woods", "Hogan", "Jones"];

async function main() {
    console.log("Start seeding...");

    // 1. Create Tournaments
    for (const t of TOURNAMENTS) {
        await prisma.tournament.upsert({
            where: { id: t.id },
            update: {
                name: t.name,
                dates: t.dates,
                purse: t.purse,
                type: t.type
            },
            create: t,
        });
    }

    // 2. Create Sample Teams (if not exists)
    const password = await bcrypt.hash("password123", 10);

    // Create Main User
    const mainUserEmail = "bdillie@gmail.com";
    const mainUser = await prisma.user.upsert({
        where: { email: mainUserEmail },
        update: {},
        create: {
            email: mainUserEmail,
            name: "Brent Dillie",
            password,
            team: {
                create: {
                    name: "Fairway to Heaven",
                    division: "Nicklaus",
                    totalPoints: 1250000, // Pre-seeded points
                    isPaid: true,
                }
            }
        },
    });

    // Create 20 random teams
    for (let i = 1; i <= 20; i++) {
        const email = `player${i}@test.com`;
        const division = DIVISIONS[i % 4];
        const name = `Player ${i}`;
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: name,
                password,
                team: {
                    create: {
                        name: `${name}'s Team`,
                        division,
                        totalPoints: Math.floor(Math.random() * 2000000),
                    }
                }
            },
        });
    }

    // 3. Create Sample Picks
    const firstTournament = TOURNAMENTS[0];
    const teams = await prisma.team.findMany();

    for (const team of teams) {
        // Skip if pick exists
        const existingPick = await prisma.pick.findFirst({
            where: { teamId: team.id, tournamentId: firstTournament.id }
        });

        if (!existingPick) {
            const randomGolfer = GOLFERS[Math.floor(Math.random() * GOLFERS.length)];
            const earnings = Math.floor(Math.random() * 500000);

            await prisma.pick.create({
                data: {
                    teamId: team.id,
                    tournamentId: firstTournament.id,
                    golferName: randomGolfer,
                    earnings: earnings,
                    position: "T" + Math.floor(Math.random() * 50 + 1),
                    isWinner: false
                }
            });
        }
    }

    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
