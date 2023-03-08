-- CreateTable
CREATE TABLE "ElectionResults" (
    "resultId" SERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "candidate" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,

    CONSTRAINT "ElectionResults_pkey" PRIMARY KEY ("resultId")
);
