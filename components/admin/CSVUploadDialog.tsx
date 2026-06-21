'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { FileUp, Info } from 'lucide-react'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export function CSVUploadDialog({ clubId }: { clubId?: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handleProcessCSV = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV.")
      return
    }

    startTransition(() => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as any[]
          
          if (rows.length === 0) {
            setError("Le fichier CSV est vide.")
            return
          }

          const missingFields = []
          if (!rows[0].name) missingFields.push("name")
          if (!rows[0].position) missingFields.push("position")
          if (!rows[0].number) missingFields.push("number")
          
          if (missingFields.length > 0) {
            setError(`Colonnes manquantes dans le CSV : ${missingFields.join(", ")}`)
            return
          }

          const supabase = createClient()
          
          // Map to Player objects
          const playersToInsert = rows.map(r => ({
            club_id: r.club_id || clubId || null,
            name: r.name,
            position: r.position,
            number: Number(r.number),
            season: r.season || '2024-2025'
          }))

          // Validate that all have club_id
          if (playersToInsert.some(p => !p.club_id)) {
            setError("L'UUID du club est manquant. Fournissez la colonne 'club_id' ou ouvrez l'import depuis la page d'un club spécifique.")
            return
          }

          const { error: insertError } = await supabase.from('players').insert(playersToInsert)
          
          if (insertError) {
            setError(insertError.message)
          } else {
            setSuccess(`${playersToInsert.length} joueurs insérés avec succès !`)
            setTimeout(() => {
              setOpen(false)
              setSuccess(null)
              router.refresh()
            }, 2000)
          }
        },
        error: (err) => {
          setError(`Erreur de lecture CSV: ${err.message}`)
        }
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
          <FileUp className="w-4 h-4" /> Import CSV
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" /> Importer des Joueurs
          </DialogTitle>
          <DialogDescription>
            Importez une liste de joueurs depuis un fichier CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg text-xs flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1 border-b border-border pb-1 inline-block">Format requis :</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li><code>name</code> : Nom du joueur</li>
                <li><code>position</code> : Gardien, Défenseur, Milieu, ou Attaquant</li>
                <li><code>number</code> : Numéro de maillot</li>
                {!clubId && <li><code>club_id</code> : ID unique (UUID) du club</li>}
                <li><code>season</code> : (Optionnel) Ex: 2024-2025</li>
              </ul>
            </div>
          </div>

          <div className="space-y-1.5 border border-border p-4 rounded-xl border-dashed">
            <Label htmlFor="csv_file" className="cursor-pointer">Fichier (.csv)</Label>
            <Input 
              id="csv_file" 
              type="file" 
              accept=".csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null)
                setError(null)
              }}
            />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded">{success}</p>}

          <Button onClick={handleProcessCSV} className="w-full font-bold" disabled={isPending || !file || !!success}>
            {isPending ? 'Importation en cours…' : 'Lancer l\'importation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
