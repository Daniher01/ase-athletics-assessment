-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "team" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "preferred_foot" TEXT NOT NULL,
    "jersey_number" INTEGER,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER,
    "clean_sheets" INTEGER,
    "goals_conceded" INTEGER,
    "shots_on_target" INTEGER,
    "total_shots" INTEGER,
    "pass_accuracy" DOUBLE PRECISION,
    "dribbles_completed" INTEGER,
    "tackles_won" INTEGER,
    "aerial_duels_won" INTEGER,
    "salary" INTEGER,
    "contract_end" TEXT,
    "market_value" INTEGER,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_attributes" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL DEFAULT 50,
    "shooting" INTEGER NOT NULL DEFAULT 50,
    "passing" INTEGER NOT NULL DEFAULT 50,
    "dribbling" INTEGER NOT NULL DEFAULT 50,
    "defending" INTEGER NOT NULL DEFAULT 50,
    "physical" INTEGER NOT NULL DEFAULT 50,
    "finishing" INTEGER DEFAULT 50,
    "crossing" INTEGER DEFAULT 50,
    "longShots" INTEGER DEFAULT 50,
    "positioning" INTEGER DEFAULT 50,
    "diving" INTEGER,
    "handling" INTEGER,
    "kicking" INTEGER,
    "reflexes" INTEGER,

    CONSTRAINT "player_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scout_reports" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "scout_id" INTEGER NOT NULL,
    "match_date" TIMESTAMP(3) NOT NULL,
    "competition" TEXT,
    "opponent" TEXT,
    "overall_rating" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendation" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scout_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "player_attributes_player_id_key" ON "player_attributes"("player_id");

-- AddForeignKey
ALTER TABLE "player_attributes" ADD CONSTRAINT "player_attributes_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_reports" ADD CONSTRAINT "scout_reports_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scout_reports" ADD CONSTRAINT "scout_reports_scout_id_fkey" FOREIGN KEY ("scout_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
