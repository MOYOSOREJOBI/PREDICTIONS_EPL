import fixturesData from "@/artifacts/fixtures.json";
import { evTable, predictMatch } from "@/lib/model";

export type FixtureRow = {
  id: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  odds: { home?: number | null; draw?: number | null; away?: number | null };
  source?: string;
};

export type EnrichedFixture = FixtureRow & {
  prediction: ReturnType<typeof predictMatch>;
  recommendation: ReturnType<typeof evTable> | null;
};

function isUpcoming(kickoffIso: string, now = new Date()): boolean {
  const kickoffDate = new Date(kickoffIso);
  return !Number.isNaN(kickoffDate.getTime()) && kickoffDate.getTime() >= now.getTime();
}

function toEnrichedFixture(fixture: FixtureRow): EnrichedFixture {
  const prediction = predictMatch(fixture.homeTeam, fixture.awayTeam, fixture.odds);
  const odds = fixture.odds;
  const recommendation =
    odds?.home && odds?.draw && odds?.away
      ? evTable(prediction.probs, { home: odds.home, draw: odds.draw, away: odds.away })
      : null;

  return { ...fixture, prediction, recommendation };
}

export function getFixtures(options?: {
  team?: string;
  from?: string;
  to?: string;
  includePast?: boolean;
  sort?: "kickoff" | "ev" | "edge";
}): EnrichedFixture[] {
  const opts = options ?? {};
  const teamNeedle = opts.team?.trim().toLowerCase();
  const includePast = opts.includePast ?? false;
  const sort = opts.sort ?? "kickoff";

  let rows = (fixturesData.fixtures as FixtureRow[])
    .filter((fixture) => includePast || isUpcoming(fixture.kickoff))
    .map(toEnrichedFixture);

  if (teamNeedle) {
    rows = rows.filter((fixture) => {
      const home = fixture.homeTeam.toLowerCase();
      const away = fixture.awayTeam.toLowerCase();
      return home.includes(teamNeedle) || away.includes(teamNeedle);
    });
  }

  if (opts.from) {
    const fromDate = new Date(opts.from);
    if (!Number.isNaN(fromDate.getTime())) {
      rows = rows.filter((fixture) => new Date(fixture.kickoff).getTime() >= fromDate.getTime());
    }
  }

  if (opts.to) {
    const toDate = new Date(opts.to);
    if (!Number.isNaN(toDate.getTime())) {
      rows = rows.filter((fixture) => new Date(fixture.kickoff).getTime() <= toDate.getTime());
    }
  }

  rows.sort((a, b) => {
    if (sort === "ev") {
      return (b.recommendation?.ev.H ?? -Infinity) - (a.recommendation?.ev.H ?? -Infinity);
    }
    if (sort === "edge") {
      return (b.recommendation?.edge.H ?? -Infinity) - (a.recommendation?.edge.H ?? -Infinity);
    }
    return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
  });

  return rows;
}

export function getFixtureById(id: string): EnrichedFixture | null {
  const fixture = (fixturesData.fixtures as FixtureRow[]).find((row) => row.id === id);
  return fixture ? toEnrichedFixture(fixture) : null;
}
