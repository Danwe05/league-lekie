import { getClubs } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClubFormDialog, DeleteClubButton } from '@/components/admin/ClubActions'

export default async function AdminClubsPage() {
  const clubs = await getClubs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-1">Clubs</h1>
          <p className="text-muted-foreground text-sm">Gérez les clubs affiliés à la ligue.</p>
        </div>
        <ClubFormDialog />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nom du club</TableHead>
              <TableHead>Stade</TableHead>
              <TableHead>Dirigeants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell className="font-bold">{club.name}</TableCell>
                <TableCell>{club.stadium || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>{club.officials?.length ?? 0}</TableCell>
                <TableCell className="text-right space-x-2">
                  <ClubFormDialog club={club} />
                  <DeleteClubButton id={club.id} />
                </TableCell>
              </TableRow>
            ))}
            {clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Aucun club. Commencez par en ajouter un.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
