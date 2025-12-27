import { PrismaClient } from "@prisma/client";
import { TOP_200_GOLFERS } from "../src/data/golfers";

const prisma = new PrismaClient();

/**
 * Seeds the Golfer table with initial data
 * This should be run once after deploying to production
 */
async function seedGolfers() {
    console.log("🏌️ Seeding golfers...");

    try {
        // Create golfers from the static list with initial rankings
        const golferPromises = TOP_200_GOLFERS.map((name, index) =>
            prisma.golfer.upsert({
                where: { name },
                update: {
                    owgrRank: index + 1,
                    lastUpdated: new Date(),
                },
                create: {
                    name,
                    owgrRank: index + 1,
                    lastUpdated: new Date(),
                },
            })
        );

        await Promise.all(golferPromises);

        console.log(`✅ Successfully seeded ${TOP_200_GOLFERS.length} golfers`);
        console.log("💡 Tip: The OWGR sync will update these rankings every Tuesday");
    } catch (error) {
        console.error("❌ Error seeding golfers:", error);
        throw error;
    }
}

seedGolfers()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
