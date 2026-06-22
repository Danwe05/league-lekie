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

      {/* Container for Teams and Score */}
      <div className="flex-1 flex items-center justify-between w-full">
        {/* Home */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-start md:justify-end gap-1.5 md:gap-4 md:text-right overflow-hidden">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden md:order-last">
            {homeTeam.logo ? (
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{homeTeam.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="font-heading font-bold text-xs md:text-xl text-center md:text-right leading-tight max-w-full md:max-w-none line-clamp-2 md:truncate">{homeTeam.name}</span>
        </div>

        {/* Score */}
        <div className="px-2 md:px-6 flex items-center justify-center min-w-[70px] md:min-w-[100px] shrink-0">
          {match.status === 'UPCOMING' ? (
            <span className="text-xs md:text-sm font-bold text-muted-foreground bg-muted/50 px-3 md:px-4 py-1 md:py-1.5 rounded-md">Vs</span>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-3 font-heading font-bold text-2xl md:text-3xl text-foreground">
              <span className="tabular-nums">{match.homeScore}</span>
              <span className="text-muted-foreground/30 text-lg md:text-xl">-</span>
              <span className="tabular-nums">{match.awayScore}</span>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-start gap-1.5 md:gap-4 md:text-left overflow-hidden">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
            {awayTeam.logo ? (
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">{awayTeam.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="font-heading font-bold text-xs md:text-xl text-center md:text-left leading-tight max-w-full md:max-w-none line-clamp-2 md:truncate">{awayTeam.name}</span>
        </div>
      </div>
      
      {/* Mobile Date */}
      <div className="w-full text-center mt-3 pt-3 border-t border-border/50 md:hidden">
        <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
      </div>
    </Link>
  );
}
