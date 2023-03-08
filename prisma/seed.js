import fs from "fs";
import unNest from "../src/lib/unNest";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    console.log("Hello, world! from prisma/seed.ts!");

    // Load the example.json, specifying encoding gets you string instead of buffer
    let db = JSON.parse(fs.readFileSync("public/example.json", "utf8"));

    // If there's only one record in the example, place a single into a array of rows
    if (!Array.isArray(db)) db = [db];

    // Unnest the data into records and seed it into db
    await prisma.ElectionResults.createMany({ data: unNest(db) });
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
