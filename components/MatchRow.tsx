import { Club, Match } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MatchRowProps {
  match: Match;
  homeTeam?: Club;
  awayTeam?: Club;
  isCompact?: boolean;
}

export function MatchRow({ match, homeTeam, awayTeam, isCompact = false }: MatchRowProps) {
  if (!homeTeam || !awayTeam) return null;

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(match.date));

  const statusMap = {
    UPCOMING: { label: "À venir", className: "bg-muted text-muted-foreground border-transparent hover:bg-muted", dot: null },
    LIVE: { label: "En direct", className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200", dot: true },
    FINISHED: { label: "Terminé", className: "bg-[#E8E4DC] text-[#6B6660] border-transparent hover:bg-[#E8E4DC]", dot: null }
  };

  const statusConfig = statusMap[match.status];

  return (
    <Link href={`/matchs/${match.id}`} className={cn("block flex flex-col md:flex-row items-center border border-border bg-card rounded-xl p-4 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer", isCompact && "p-3")}>
      <div className="flex flex-col items-center justify-center md:min-w-[100px] mb-4 md:mb-0 md:mr-6">
        <Badge variant="outline" className={cn("font-medium gap-1.5", statusConfig.className)}>
          {statusConfig.dot && (
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse inline-block" />
          )}
          {statusConfig.label}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground mt-2 md:mt-1 hidden md:block">
          {formattedDate}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-between w-full">
        {/* Home */}
        <div className="flex-1 flex items-center justify-end gap-3 text-right">
          <span className="font-heading font-bold text-lg md:text-xl truncate">{homeTeam.name}</span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
            {homeTeam.logo ? (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{homeTeam.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="px-4 flex items-center justify-center min-w-[80px]">
          {match.status === 'UPCOMING' ? (
             <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-md">Vs</span>
          ) : (
            <div className="flex items-center gap-2 font-heading font-bold text-2xl text-foreground">
              <span>{match.homeScore}</span>
              <span className="text-muted-foreground">-</span>
              <span>{match.awayScore}</span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center justify-start gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
            {awayTeam.logo ? (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{awayTeam.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="font-heading font-bold text-lg md:text-xl truncate">{awayTeam.name}</span>
        </div>
      </div>
      
      {/* Mobile Date */}
      <div className="w-full text-center mt-3 md:hidden">
        <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
      </div>
    </Link>
  );
}
