import { getMatches, getClubs, getAllPlayers } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MatchFormDialog, DeleteMatchButton } from '@/components/admin/MatchActions'
import { LiveButton } from '@/components/admin/LiveButton'
import { AddGoalDialog } from '@/components/admin/GoalActions'

const STATUS_STYLES: Record<string, string> = {
  FINISHED: 'bg-muted text-muted-foreground border-transparent',
  LIVE: 'text-green-800 bg-green-100 border-green-200',
  UPCOMING: 'text-primary bg-primary/10 border-primary/20',
}

const STATUS_LABELS: Record<string, string> = {
  FINISHED: 'Terminé',
  LIVE: 'En direct',
  UPCOMING: 'À venir',
}

export default async function AdminMatchesPage() {
  const [matches, clubs, players] = await Promise.all([
    getMatches(),
    getClubs(),
    getAllPlayers(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-1">Matchs</h1>
          <p className="text-muted-foreground text-sm">Gérez le calendrier, les scores et les buteurs.</p>
        </div>
        <MatchFormDialog clubs={clubs} />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>J.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Rencontre</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Live</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const home = clubs.find(c => c.id === match.homeTeamId)
              const away = clubs.find(c => c.id === match.awayTeamId)
              return (
                <TableRow key={match.id}>
                  <TableCell className="font-bold text-muted-foreground">J{match.matchday}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="font-bold">{home?.name ?? '?'}</span>
                    <span className="text-muted-foreground font-normal mx-2">vs</span>
                    <span className="font-bold">{away?.name ?? '?'}</span>
                  </TableCell>
                  <TableCell className="text-center font-bold font-heading text-lg">
                    {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_STYLES[match.status] ?? ''}>
                      {STATUS_LABELS[match.status] ?? match.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <LiveButton matchId={match.id} currentStatus={match.status} />
                  </TableCell>
                  <TableCell>
                    <AddGoalDialog match={match} players={players} clubs={clubs} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <MatchFormDialog match={match} clubs={clubs} />
                    <DeleteMatchButton id={match.id} />
                  </TableCell>
                </TableRow>
              )
            })}
            {matches.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Aucun match programmé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
