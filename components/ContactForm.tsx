'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { sendContactEmail } from '@/lib/contact-action'
import { CheckCircle } from 'lucide-react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg(null)
    const formData = new FormData(e.currentTarget)
    const result = await sendContactEmail(formData)
    if (result?.error) {
      setErrorMsg(result.error)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="p-4 bg-[#1F4D3A]/10 rounded-full">
          <CheckCircle className="w-10 h-10 text-[#1F4D3A]" />
        </div>
        <h3 className="font-heading font-bold text-2xl">Message envoyé !</h3>
        <p className="text-muted-foreground max-w-sm">
          Merci pour votre message. La ligue vous répondra dans les meilleurs délais.
        </p>
        <Button variant="outline" className="mt-4 font-bold" onClick={() => setStatus('idle')}>
          Envoyer un autre message
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-6 flex flex-col" onSubmit={handleSubmit} aria-label="Formulaire de contact">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstname" className="text-sm font-bold text-foreground">Prénom *</label>
          <Input id="firstname" name="firstname" placeholder="Ex: Jean" className="bg-card shadow-none rounded-lg" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastname" className="text-sm font-bold text-foreground">Nom</label>
          <Input id="lastname" name="lastname" placeholder="Ex: Mbia" className="bg-card shadow-none rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-bold text-foreground">Email *</label>
        <Input id="email" name="email" type="email" placeholder="jean@example.com" className="bg-card shadow-none rounded-lg" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-bold text-foreground">Sujet *</label>
        <Input id="subject" name="subject" placeholder="Sujet de votre message" className="bg-card shadow-none rounded-lg" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-bold text-foreground">Message *</label>
        <Textarea id="message" name="message" placeholder="Votre message..." className="min-h-[150px] bg-card shadow-none rounded-lg resize-y" required />
      </div>

      {status === 'error' && errorMsg && (
        <p className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-md">{errorMsg}</p>
      )}

      <Button
        type="submit"
        className="w-full sm:w-auto font-bold px-8 self-start"
        size="lg"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Envoi en cours…' : 'Envoyer le message'}
      </Button>
    </form>
  )
}
