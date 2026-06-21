import { getAllPlayers, getClubs } from '@/lib/api'
import { createClient } from '@/lib/supabase-server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PlayerFormDialog, DeletePlayerButton } from '@/components/admin/PlayerActions'
import { SearchInput } from '@/components/admin/SearchInput'
import { Pagination } from '@/components/admin/Pagination'
import { UserSquare } from 'lucide-react'

const PAGE_SIZE = 15

const POSITION_STYLES: Record<string, string> = {
  Gardien: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Défenseur: 'bg-blue-100 text-blue-800 border-blue-200',
  Milieu: 'bg-purple-100 text-purple-800 border-purple-200',
  Attaquant: 'bg-red-100 text-red-800 border-red-200',
}

export default async function AdminJoueursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const supabase = await createClient()

  // Server-side filtered + paginated query
  let query = supabase
    .from('players')
    .select('*, clubs(name)', { count: 'exact' })
    .order('name')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (q) query = query.ilike('name', `%${q}%`)

  const { data, count, error } = await query
  if (error) console.error(error)

  const clubs = await getClubs()

  const players = (data ?? []).map(p => ({
    id: p.id as string,
    clubId: p.club_id as string,
    name: p.name as string,
    position: p.position as 'Gardien' | 'Défenseur' | 'Milieu' | 'Attaquant',
    number: p.number as number,
    photoUrl: p.photo_url as string | undefined,
    season: p.season as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clubName: (p.clubs as any)?.name ?? '',
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-1 flex items-center gap-2">
            <UserSquare className="w-7 h-7 text-primary" /> Joueurs
          </h1>
          <p className="text-muted-foreground text-sm">Effectifs de tous les clubs.</p>
        </div>
        <PlayerFormDialog clubs={clubs} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <SearchInput placeholder="Rechercher un joueur…" />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Joueur</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Saison</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell className="font-bold text-muted-foreground">{player.number}</TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{player.clubName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${POSITION_STYLES[player.position] ?? ''}`}>
                    {player.position}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{player.season}</TableCell>
                <TableCell className="text-right space-x-1">
                  <PlayerFormDialog player={player} clubs={clubs} />
                  <DeletePlayerButton id={player.id} />
                </TableCell>
              </TableRow>
            ))}
            {players.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  {q ? `Aucun joueur pour « ${q} ».` : 'Aucun joueur enregistré.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  )
}
