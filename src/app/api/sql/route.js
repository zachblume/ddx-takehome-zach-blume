// Force Next.js to render this dynamically instead of static compilation
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";

// Get the DB ORM
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Import our library
import unNest from "@/lib/unNest";
// import nest from "@/lib/nest";

export async function GET(request) {
    // Run the query
    const results = await prisma.$queryRaw`
        SELECT
            state,
            county,
            party,
            candidate,
            votes
        FROM (
            SELECT
                *, max(votes) OVER (PARTITION BY concat(state, county, party)) = votes as is_winner
            FROM "ElectionResults"
        ) AS temptable
        WHERE
            is_winner = true;
    `;

    // Return the winners as a JSON response
    return NextResponse.json(results);
}
