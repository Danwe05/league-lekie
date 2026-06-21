'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClub, updateClub, deleteClub } from '@/lib/actions'
import { Club } from '@/lib/types'
import { Edit, Trash, Plus, X, Upload } from 'lucide-react'
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

// ─── Create / Edit Dialog ──────────────────────────────────────────────

export function ClubFormDialog({ club }: { club?: Club }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [logoUrl, setLogoUrl] = useState(club?.logo ?? '')
  const [uploading, setUploading] = useState(false)

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
    // Override logo with the uploaded URL if present
    if (logoUrl) formData.set('logo', logoUrl)
    const result = await (club
      ? updateClub(club.id, formData)
      : createClub(formData))
    if (result?.error) { setError(result.error); return }
    setOpen(false)
    startTransition(() => { /* triggers revalidation */ })
  }

  return (
    <>
      <Button
        variant={club ? 'ghost' : 'default'}
        size={club ? 'icon-sm' : 'default'}
        className={club ? 'h-8 w-8 text-primary hover:text-primary hover:bg-primary/10' : 'font-bold gap-2'}
        onClick={() => setOpen(true)}
      >
        {club ? <Edit className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> Ajouter un club</>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-heading font-bold text-xl">{club ? 'Modifier le club' : 'Nouveau club'}</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
