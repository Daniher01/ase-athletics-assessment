-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE INDEX "players_team_idx" ON "players"("team");

-- CreateIndex
CREATE INDEX "players_nationality_idx" ON "players"("nationality");

-- CreateIndex
CREATE INDEX "players_age_idx" ON "players"("age");

-- CreateIndex
CREATE INDEX "players_market_value_idx" ON "players"("market_value");

-- CreateIndex
CREATE INDEX "players_position_team_idx" ON "players"("position", "team");

-- CreateIndex
CREATE INDEX "players_age_market_value_idx" ON "players"("age", "market_value");
