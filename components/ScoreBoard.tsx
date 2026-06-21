import { cn } from "@/lib/utils";

interface ScoreBoardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  date: string;
  className?: string;
}

export function ScoreBoard({ homeTeam, awayTeam, homeScore, awayScore, status, date, className }: ScoreBoardProps) {
  // Format the date if upcoming
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));

  return (
    <div className={cn("bg-[#1A1A18] text-white p-4 rounded-lg border border-border/20 flex flex-col items-center justify-center relative overflow-hidden", className)}>
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="text-xs uppercase tracking-widest text-[#6B6660] font-medium mb-3">
        {status === "LIVE" ? <span className="text-[#1F4D3A] font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1F4D3A] animate-pulse"/> En direct</span> : 
         status === "FINISHED" ? "Terminé" : 
         formattedDate}
      </div>

      <div className="flex items-center justify-between w-full max-w-sm gap-4">
        {/* Home Team */}
        <div className="flex-1 text-right">
          <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight leading-none truncate block">
            {homeTeam}
          </span>
        </div>

        {/* Score Display (The "Stadium Board") */}
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-black/40 rounded border border-[#3A3A38]">
          <span className="font-heading font-bold text-3xl sm:text-4xl text-primary tabular-nums">
            {homeScore ?? "-"}
          </span>
          <span className="font-heading font-bold text-xl text-[#6B6660]">:</span>
          <span className="font-heading font-bold text-3xl sm:text-4xl text-primary tabular-nums">
            {awayScore ?? "-"}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-left">
          <span className="font-heading font-bold text-xl sm:text-2xl tracking-tight leading-none truncate block">
            {awayTeam}
          </span>
        </div>
      </div>
    </div>
  );
}
