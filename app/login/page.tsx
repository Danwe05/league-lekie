'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { login } from '@/lib/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-none rounded-xl border-border bg-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="font-heading font-bold text-3xl uppercase tracking-tighter text-primary">
            Ligue Admin
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Espace d&apos;administration protégé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-foreground">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@liguelekie.cm"
                className="bg-muted/50 border-input shadow-none"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label htmlFor="password" className="text-sm font-bold text-foreground">Mot de passe</label>
              <Input
                id="password"
                name="password"
                type="password"
                className="bg-muted/50 border-input shadow-none"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error === 'Invalid login credentials'
                  ? 'Email ou mot de passe incorrect.'
                  : error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full font-bold mt-4"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </Button>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Retourner sur le{' '}
                <Link href="/" className="text-foreground font-bold hover:text-primary transition-colors">
                  Site Public
                </Link>.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
