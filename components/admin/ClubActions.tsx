'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClub, updateClub, deleteClub } from '@/lib/actions'
import { Club } from '@/lib/types'
import { Edit, Trash, Plus, X, Upload, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

// ─── Delete Button ─────────────────────────────────────────────────────

export function DeleteClubButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer ce club ? Cette action est irréversible.'))
          startTransition(async () => { await deleteClub(id) })
      }}
    >
      <Trash className="w-4 h-4" />
    </Button>
  )
}

// ─── Dirigeants Editor ────────────────────────────────────────────────

function OfficialsEditor({
  officials,
  onChange,
  clubId,
}: {
  officials: any[]
  onChange: (list: any[]) => void
  clubId?: string
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `officials/${clubId || Date.now()}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  function add() {
    const trimmed = name.trim()
    if (!trimmed) return
    onChange([...officials, { name: trimmed, role: role.trim(), photoUrl }])
    setName('')
    setRole('')
    setPhotoUrl('')
  }

  function remove(idx: number) {
    onChange(officials.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4 border border-border p-4 rounded-xl bg-muted/10">
      <label className="text-sm font-bold text-foreground">Dirigeants du club</label>

      {/* Current list */}
      {officials.length > 0 && (
        <ul className="space-y-2">
          {officials.map((o, idx) => {
            const oName = typeof o === 'string' ? o : o.name;
            const oRole = typeof o === 'string' ? null : o.role;
            const oPhotoUrl = typeof o === 'string' ? null : o.photoUrl;
            return (
              <li
                key={idx}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border text-sm shadow-sm"
              >
                {oPhotoUrl ? (
                  <img src={oPhotoUrl} alt={oName} className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">{oName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                   <span className="font-semibold truncate">{oName}</span>
                   {oRole && <span className="text-xs text-muted-foreground truncate">{oRole}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-2"
                  aria-label="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Add row */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom (Ex: Jean Etoa)"
            className="shadow-none text-sm"
          />
          <Input
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Rôle (Ex: Président)"
            className="shadow-none text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center flex-1">
             {photoUrl && (
                <img src={photoUrl} alt="Preview" className="w-9 h-9 object-cover rounded-full border border-border shrink-0" />
             )}
             <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 text-xs font-bold rounded-md border border-border border-dashed hover:bg-muted transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
               <Upload className="w-3.5 h-3.5" />
               {uploading ? 'Upload…' : 'Ajouter une photo'}
               <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
             </label>
          </div>
          
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={add}
            disabled={!name.trim() || uploading}
            className="shrink-0 gap-1"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter Dirigeant
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Create / Edit Dialog ──────────────────────────────────────────────

export function ClubFormDialog({ club }: { club?: Club }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [logoUrl, setLogoUrl] = useState(club?.logo ?? '')
  const [uploading, setUploading] = useState(false)
  const [officials, setOfficials] = useState<any[]>(club?.officials ?? [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `clubs/${club?.id ?? Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })
    if (uploadError) {
      setError(`Upload échoué: ${uploadError.message}`)
    } else {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (logoUrl) formData.set('logo', logoUrl)
    // Serialize officials as JSON
    formData.set('officials', JSON.stringify(officials))
    const result = await (club
      ? updateClub(club.id, formData)
      : createClub(formData))
    if (result?.error) { setError(result.error); return }
    setOpen(false)
    startTransition(() => { /* triggers revalidation */ })
  }

  function handleOpen() {
    // Reset state to club's current values every time dialog opens
    setOfficials(club?.officials ?? [])
    setLogoUrl(club?.logo ?? '')
    setError(null)
    setOpen(true)
  }

  return (
    <>
      <Button
        variant={club ? 'ghost' : 'default'}
        size={club ? 'icon-sm' : 'default'}
        className={club ? 'h-8 w-8 text-primary hover:text-primary hover:bg-primary/10' : 'font-bold gap-2'}
        onClick={handleOpen}
      >
        {club ? <Edit className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> Ajouter un club</>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-heading font-bold text-xl">{club ? 'Modifier le club' : 'Nouveau club'}</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold">Nom du club *</label>
                <Input name="name" defaultValue={club?.name} required className="shadow-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold">Stade</label>
                <Input name="stadium" defaultValue={club?.stadium} className="shadow-none" />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-bold">Logo du club</label>
                <div className="flex gap-3 items-center">
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded border border-border bg-muted" />
                  )}
                  <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 text-sm font-bold rounded-md border border-border hover:bg-muted transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Upload…' : 'Choisir un fichier'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Ou saisissez une URL directe :</p>
                <Input
                  name="logo"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="/logos/club.png ou https://..."
                  className="shadow-none text-sm"
                />
              </div>

              {/* Dirigeants */}
              <OfficialsEditor officials={officials} onChange={setOfficials} clubId={club?.id} />

              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" className="flex-1 font-bold" disabled={pending || uploading}>
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
