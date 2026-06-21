import { getClubs, getMatches, getSeasons } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeStandings } from "@/components/RealtimeStandings";
import { SeasonSelector } from "@/components/SeasonSelector";
import Link from "next/link";

export default async function ClassementPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const { season } = await searchParams
  const [clubs, matches, seasons] = await Promise.all([
    getClubs(),
    getMatches(season),
    getSeasons(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter border-b-4 border-primary inline-block pb-2">
          Classement Général
        </h1>
        <div className="flex items-center gap-3">
          <SeasonSelector seasons={seasons} currentSeason={season} />
          <Link
            href={`/classement/buteurs${season ? `?season=${season}` : ''}`}
            className="text-sm font-bold text-primary hover:underline"
          >
            Classement buteurs →
          </Link>
        </div>
      </div>

      <Card className="border-border shadow-none rounded-xl overflow-hidden mt-4">
        <CardContent className="p-4 md:p-6">
          <RealtimeStandings initialMatches={matches} initialClubs={clubs} />
        </CardContent>
      </Card>
    </div>
  );
}
