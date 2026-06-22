import { getClubs } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ClubFormDialog, DeleteClubButton } from '@/components/admin/ClubActions'
import { Shield } from 'lucide-react'

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
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nom du club</TableHead>
              <TableHead>Stade</TableHead>
              <TableHead>Dirigeants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id}>
                <TableCell>
                  {club.logo ? (
                    <img src={club.logo} alt="Logo" className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-bold">{club.name}</TableCell>
                <TableCell>{club.stadium || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  {club.officials?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {club.officials.map((o: any, i) => {
                        const name = typeof o === 'string' ? o : o.name;
                        const photoUrl = typeof o !== 'string' ? o.photoUrl : undefined;
                        return (
                          <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                            {photoUrl && <img src={photoUrl} alt={name} className="w-4 h-4 rounded-full object-cover shrink-0" />}
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <ClubFormDialog club={club} />
                  <DeleteClubButton id={club.id} />
                </TableCell>
              </TableRow>
            ))}
            {clubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
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
