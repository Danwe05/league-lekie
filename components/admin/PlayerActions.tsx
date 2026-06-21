'use client'

import { useState, useTransition } from 'react'
import { createPlayer, updatePlayer, deletePlayer } from '@/lib/actions'
import { Player, Club } from '@/lib/types'
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
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Plus, Trash2 } from 'lucide-react'

const POSITIONS = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'] as const
type Position = typeof POSITIONS[number]

interface PlayerFormDialogProps {
  player?: Player & { clubName?: string }
  clubs: Club[]
}

export function PlayerFormDialog({ player, clubs }: PlayerFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [clubId, setClubId] = useState(player?.clubId ?? '')
  const [position, setPosition] = useState<Position>(player?.position ?? 'Milieu')

  const isEdit = !!player

  async function handleSubmit(formData: FormData) {
    formData.set('club_id', clubId)
    formData.set('position', position)
    startTransition(async () => {
      const res = isEdit
        ? await updatePlayer(player.id, formData)
        : await createPlayer(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setOpen(false)
        setError(null)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button size="sm" variant="ghost" />
          ) : (
            <Button size="sm" className="font-bold" />
          )
        }
      >
        {isEdit ? <Pencil className="w-4 h-4" /> : <><Plus className="w-4 h-4 mr-1" /> Ajouter un joueur</>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-xl">
            {isEdit ? 'Modifier le joueur' : 'Nouveau joueur'}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-2">
          {/* Club */}
          <div className="space-y-1.5">
            <Label>Club</Label>
            <Select value={clubId} onValueChange={(v) => { if (v !== null) setClubId(v) }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un club…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clubs.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="pname">Nom complet</Label>
            <Input id="pname" name="name" defaultValue={player?.name} required placeholder="Ex: Jean Dupont" />
          </div>

          {/* Number */}
          <div className="space-y-1.5">
            <Label htmlFor="pnumber">Numéro</Label>
            <Input id="pnumber" name="number" type="number" min={1} max={99} defaultValue={player?.number} required />
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label>Poste</Label>
            <Select value={position} onValueChange={(v) => { if (v !== null) setPosition(v as Position) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Poste</SelectLabel>
                  {POSITIONS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Photo URL ou Fichier */}
          <div className="space-y-1.5 pt-2">
            <Label>Photo du joueur (optionnel)</Label>
            {player?.photoUrl && (
              <div className="flex items-center gap-4 mb-2 p-2 border border-border rounded-lg bg-muted/50">
                <img src={player.photoUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
                <span className="text-xs text-muted-foreground truncate">Photo actuelle</span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              <Input id="pphoto_file" name="photo_file" type="file" accept="image/*" className="text-xs file:bg-primary file:text-primary-foreground file:border-0 file:mr-2 file:px-2 file:py-1 file:rounded cursor-pointer" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Ou par URL :</span>
                <Input id="pphoto" name="photo_url" defaultValue={player?.photoUrl ?? ''} placeholder="https://…" className="h-8 text-xs" />
              </div>
            </div>
          </div>

          {/* Season */}
          <div className="space-y-1.5">
            <Label htmlFor="pseason">Saison</Label>
            <Input id="pseason" name="season" defaultValue={player?.season ?? '2024-2025'} required />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-bold" disabled={isPending}>
            {isPending ? 'Enregistrement…' : isEdit ? 'Sauvegarder' : 'Créer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeletePlayerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deletePlayer(id)
        })
      }
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
