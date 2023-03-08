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
    // Make fetch() work in a dev or prod enviro correctly
    const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL;

    // Load /public/example.json into object
    let db = await (await fetch(baseURL + "example.json")).json();

    // If single record, place into an array of one record
    if (!Array.isArray(db)) db = [db];

    // Unnest the data into records. See /src/lib/unNest.js
    let ElectionResults = unNest(db);

    // Initialize an empty winners dictionary
    let winners = {};

    // Loop through ElectionResults and set max(votes) as winner
    // for each instance of (state+county+party).
    for (const result of ElectionResults) {
        let countyParty = result.state + result.county + result.party;
        if (!winners[countyParty] || result.votes >= winners[countyParty]?.votes)
            winners[countyParty] = result;
    }

    // Destructure the hashMap into a linear array
    winners = Object.values(winners);

    // Return the winners as a JSON response
    return NextResponse.json(winners);
}
