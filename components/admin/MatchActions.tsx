'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createMatch, updateMatch, deleteMatch } from '@/lib/actions'
import { Club, Match } from '@/lib/types'
import { Edit, Trash, Plus, X } from 'lucide-react'

export function DeleteMatchButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost" size="icon-sm"
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer ce match ?'))
          startTransition(async () => { await deleteMatch(id) })
      }}
    >
      <Trash className="w-4 h-4" />
    </Button>
  )
}

export function MatchFormDialog({ match, clubs }: { match?: Match; clubs: Club[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await (match
      ? updateMatch(match.id, formData)
      : createMatch(formData))
    if (result?.error) { setError(result.error); return }
    setOpen(false)
    startTransition(() => {})
  }

  const clubOptions = clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)

  return (
    <>
      <Button
        variant={match ? 'ghost' : 'default'}
        size={match ? 'icon-sm' : 'default'}
        className={match ? 'h-8 w-8 text-primary hover:text-primary hover:bg-primary/10' : 'font-bold gap-2'}
        onClick={() => setOpen(true)}
      >
        {match ? <Edit className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> Programmer un match</>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <h3 className="font-heading font-bold text-xl">{match ? 'Modifier le match' : 'Nouveau match'}</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Équipe domicile *</label>
                  <select name="home_team_id" defaultValue={match?.homeTeamId} required
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">— Choisir —</option>
                    {clubOptions}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Équipe extérieur *</label>
                  <select name="away_team_id" defaultValue={match?.awayTeamId} required
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">— Choisir —</option>
                    {clubOptions}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Date & heure *</label>
                  <Input name="date" type="datetime-local" required
                    defaultValue={match?.date ? new Date(match.date).toISOString().slice(0, 16) : ''}
                    className="shadow-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Journée *</label>
                  <Input name="matchday" type="number" min="1" required defaultValue={match?.matchday ?? 1} className="shadow-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Score Dom.</label>
                  <Input name="home_score" type="number" min="0" defaultValue={match?.homeScore ?? ''} placeholder="—" className="shadow-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Score Ext.</label>
                  <Input name="away_score" type="number" min="0" defaultValue={match?.awayScore ?? ''} placeholder="—" className="shadow-none" />
                </div>
                {match && (
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Statut</label>
                    <select name="status" defaultValue={match.status}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" className="flex-1 font-bold" disabled={pending}>
                  {pending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
