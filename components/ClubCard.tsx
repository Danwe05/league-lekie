import { Club } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <Link href={`/clubs/${club.id}`} className="block group">
      <Card className="h-full transition-all duration-200 border-border hover:border-primary rounded-xl overflow-hidden shadow-none hover:-translate-y-1">
        <div className="h-24 bg-muted w-full relative">
          <div className="absolute -bottom-8 left-6 w-16 h-16 bg-card border-2 border-border rounded-lg flex items-center justify-center overflow-hidden">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading font-bold text-xl text-muted-foreground">
                {club.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <CardContent className="pt-12 pb-6 px-6">
          <h3 className="font-heading font-bold text-xl text-foreground group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{club.stadium || "Stade non défini"}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
