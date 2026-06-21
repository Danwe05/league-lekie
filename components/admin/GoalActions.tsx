'use client'

import { useState, useTransition } from 'react'
import { createGoal, deleteGoal } from '@/lib/actions'
import { Match, Player, Club } from '@/lib/types'
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
import { Target, Trash2 } from 'lucide-react'

interface GoalActionsProps {
  match: Match
  players: Player[]
  clubs: Club[]
}

export function AddGoalDialog({ match, players, clubs }: GoalActionsProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [clubId, setClubId] = useState('')

  const handlePlayerChange = (pid: string | null) => {
    if (!pid) return
    setPlayerId(pid)
    const p = players.find(pl => pl.id === pid)
    if (p) setClubId(p.clubId)
  }

  // Group players by club (only clubs playing in this match)
  const playersByClub = clubs
    .filter(c => c.id === match.homeTeamId || c.id === match.awayTeamId)
    .map(club => ({
      club,
      players: players.filter(p => p.clubId === club.id),
    }))
    .filter(g => g.players.length > 0)

  async function handleSubmit(formData: FormData) {
    formData.set('match_id', match.id)
    formData.set('player_id', playerId)
    formData.set('club_id', clubId)
    formData.set('season', match.season)
    startTransition(async () => {
      const res = await createGoal(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setOpen(false)
        setError(null)
        setPlayerId('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="font-bold text-xs gap-1.5" />
        }
      >
        <Target className="w-3 h-3" /> Buteurs
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-lg">Saisir un but</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Buteur</Label>
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
                {playersByClub.length === 0 && (
                  <SelectGroup>
                    <SelectItem value="_none" disabled>
                      Aucun joueur enregistré pour ce match
                    </SelectItem>
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gminute">Minute (optionnel)</Label>
            <Input id="gminute" name="minute" type="number" min={1} max={120} placeholder="Ex: 45" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-bold" disabled={isPending || !playerId}>
            {isPending ? 'Enregistrement…' : 'Valider le but'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteGoalButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive h-7 w-7 p-0"
      disabled={isPending}
      onClick={() => startTransition(async () => { await deleteGoal(id) })}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  )
}
