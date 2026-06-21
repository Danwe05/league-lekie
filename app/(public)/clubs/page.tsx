import { getClubs } from "@/lib/api";
import { ClubCard } from "@/components/ClubCard";

export default async function ClubsPage() {
  const clubs = await getClubs();
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter mb-8 border-b-4 border-primary inline-block pb-2">
        Les Clubs
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  );
}
