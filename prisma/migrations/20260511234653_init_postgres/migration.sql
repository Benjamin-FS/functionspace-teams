-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT,
    "inviteCode" TEXT NOT NULL,
    "sigilId" TEXT NOT NULL DEFAULT 'eye',
    "tag" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "teamId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("teamId","username")
);

-- CreateTable
CREATE TABLE "TradeTag" (
    "positionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "marketId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "collateral" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeTag_pkey" PRIMARY KEY ("positionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");

-- CreateIndex
CREATE INDEX "TeamMembership_username_idx" ON "TeamMembership"("username");

-- CreateIndex
CREATE INDEX "TradeTag_teamId_marketId_idx" ON "TradeTag"("teamId", "marketId");

-- CreateIndex
CREATE INDEX "TradeTag_username_idx" ON "TradeTag"("username");

-- CreateIndex
CREATE INDEX "TradeTag_teamId_createdAt_idx" ON "TradeTag"("teamId", "createdAt");

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeTag" ADD CONSTRAINT "TradeTag_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
