'use client'

import { useState, useTransition } from 'react'
import { createGoal, deleteGoal, createMatchEvent, deleteMatchEvent } from '@/lib/actions'
import { Match, Player, Club, MatchEventType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, Trash2, ShieldAlert, ArrowRightLeft, Handshake } from 'lucide-react'

const EVENT_TYPES: { type: MatchEventType | 'GOAL', label: string }[] = [
  { type: 'GOAL', label: '⚽ But' },
  { type: 'YELLOW_CARD', label: '🟨 Carton Jaune' },
  { type: 'RED_CARD', label: '🟥 Carton Rouge' },
  { type: 'SUB_IN', label: '⬆️ Entrée en jeu' },
  { type: 'SUB_OUT', label: '⬇️ Sortie' },
  { type: 'ASSIST', label: '🤝 Passe décisive' },
  { type: 'MOTM', label: '⭐ Homme du Match' },
]

export function AddGoalDialog({ match, players, clubs }: { match: Match, players: Player[], clubs: Club[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [eventType, setEventType] = useState<MatchEventType | 'GOAL'>('GOAL')
  const [playerId, setPlayerId] = useState('')
  const [clubId, setClubId] = useState('')

  const handlePlayerChange = (pid: string | null) => {
    if (!pid) return
    setPlayerId(pid)
    const p = players.find(pl => pl.id === pid)
    if (p) setClubId(p.clubId)
  }

  const playersByClub = clubs
    .filter(c => c.id === match.homeTeamId || c.id === match.awayTeamId)
    .map(club => ({ club, players: players.filter(p => p.clubId === club.id) }))
    .filter(g => g.players.length > 0)

  async function handleSubmit(formData: FormData) {
    formData.set('match_id', match.id)
    formData.set('player_id', playerId)
    formData.set('club_id', clubId)
    formData.set('season', match.season)
    formData.set('type', eventType)
    startTransition(async () => {
      const res = eventType === 'GOAL' ? await createGoal(formData) : await createMatchEvent(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setOpen(false)
        setError(null)
        setPlayerId('')
      }
    })
  }

  // Combine and sort events
  const allEvents = [
    ...(match.goals?.map(g => ({ ...g, isGoal: true })) || []),
    ...(match.events?.map(e => ({ ...e, isGoal: false })) || [])
  ].sort((a, b) => (a.minute || 0) - (b.minute || 0))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs gap-1.5 cursor-pointer">
          <Target className="w-3 h-3" /> Timeline
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg">Événements du match</DialogTitle>
        </DialogHeader>

        {allEvents.length > 0 && (
          <div className="space-y-2 mb-2 bg-muted/50 p-3 rounded-lg border border-border">
            <ul className="space-y-2">
              {allEvents.map((ev: any) => {
                const label = ev.isGoal ? '⚽ But' : EVENT_TYPES.find(t => t.type === ev.type)?.label;
                return (
                  <li key={ev.id} className="flex flex-row items-center justify-between text-sm p-1 hover:bg-background/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-bold min-w-[30px]">{ev.minute ? `${ev.minute}'` : ''}</span>
                      <span className="text-muted-foreground">{label} :</span>
                      <span className="font-bold text-primary">{ev.playerName}</span>
                    </div>
                    {ev.isGoal ? <DeleteGoalButton id={ev.id} /> : <DeleteMatchEventButton id={ev.id} />}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <form action={handleSubmit} className="space-y-4 pt-2 border-t border-border mt-2">
          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Ajouter</h4>
          
          <div className="space-y-1.5">
            <Label>Type d'événement</Label>
            <Select value={eventType} onValueChange={(v) => { if(v) setEventType(v as any) }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir le type…" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(t => (
                  <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Joueur concerné</Label>
            <Select value={playerId} onValueChange={handlePlayerChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un joueur…" />
              </SelectTrigger>
              <SelectContent>
                {playersByClub.map(({ club, players: gp }) => (
                  <SelectGroup key={club.id}>
                    <SelectLabel>{club.name}</SelectLabel>
                    {gp.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gminute">Minute (optionnel)</Label>
            <Input id="gminute" name="minute" type="number" min={1} max={120} placeholder="Ex: 45" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-bold" disabled={isPending || !playerId}>
            {isPending ? 'Enregistrement…' : 'Valider'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteGoalButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" disabled={isPending} onClick={() => startTransition(async () => { await deleteGoal(id) })}>
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}

export function DeleteMatchEventButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button size="sm" variant="ghost" className="text-destructive h-7 w-7 p-0" disabled={isPending} onClick={() => startTransition(async () => { await deleteMatchEvent(id) })}>
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
