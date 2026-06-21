import { getActualites } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActualiteFormDialog, DeleteActualiteButton } from '@/components/admin/ActualiteActions'

export default async function AdminActualitesPage() {
  const actualites = await getActualites()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl mb-1">Actualités</h1>
          <p className="text-muted-foreground text-sm">Gérez les annonces et communiqués officiels.</p>
        </div>
        <ActualiteFormDialog />
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-32">Date</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actualites.map((actu) => (
              <TableRow key={actu.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(actu.date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <p className="font-bold line-clamp-1">{actu.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{actu.content}</p>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <ActualiteFormDialog actualite={actu} />
                  <DeleteActualiteButton id={actu.id} />
                </TableCell>
              </TableRow>
            ))}
            {actualites.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  Aucune actualité. Publiez votre premier communiqué.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
