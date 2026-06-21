'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createActualite, updateActualite, deleteActualite } from '@/lib/actions'
import { Actualite } from '@/lib/types'
import { Edit, Trash, Plus, X } from 'lucide-react'

export function DeleteActualiteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="ghost" size="icon-sm"
      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      disabled={pending}
      onClick={() => {
        if (confirm('Supprimer cette actualité ?'))
          startTransition(async () => { await deleteActualite(id) })
      }}
    >
      <Trash className="w-4 h-4" />
    </Button>
  )
}

export function ActualiteFormDialog({ actualite }: { actualite?: Actualite }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await (actualite
      ? updateActualite(actualite.id, formData)
      : createActualite(formData))
    if (result?.error) { setError(result.error); return }
    setOpen(false)
    startTransition(() => {})
  }

  return (
    <>
      <Button
        variant={actualite ? 'ghost' : 'default'}
        size={actualite ? 'icon-sm' : 'default'}
        className={actualite ? 'h-8 w-8 text-primary hover:text-primary hover:bg-primary/10' : 'font-bold gap-2'}
        onClick={() => setOpen(true)}
      >
        {actualite ? <Edit className="w-4 h-4" /> : <><Plus className="w-4 h-4" /> Nouvelle actualité</>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <h3 className="font-heading font-bold text-xl">{actualite ? 'Modifier l\'actualité' : 'Nouvelle actualité'}</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold">Titre *</label>
                <Input name="title" defaultValue={actualite?.title} required className="shadow-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold">Contenu *</label>
                <textarea
                  name="content"
                  defaultValue={actualite?.content}
                  required
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold">Image (URL, optionnel)</label>
                <Input name="image_url" defaultValue={actualite?.imageUrl} placeholder="https://..." className="shadow-none" />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" className="flex-1 font-bold" disabled={pending}>
                  {pending ? 'Enregistrement…' : 'Publier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
