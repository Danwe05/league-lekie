import Link from 'next/link'
import { LayoutDashboard, Users, Users2, CalendarDays, Newspaper, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { logout } from '@/lib/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email ?? 'Admin'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col md:flex sticky top-0 h-screen hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="font-heading font-bold text-2xl text-primary tracking-tight">
            LIGUE ADMIN
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <LayoutDashboard className="w-4 h-4" /> Vue d&apos;ensemble
          </Link>
          <Link href="/admin/clubs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <Users className="w-4 h-4" /> Gestion des Clubs
          </Link>
          <Link href="/admin/joueurs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <Users2 className="w-4 h-4" /> Joueurs
          </Link>
          <Link href="/admin/matchs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <CalendarDays className="w-4 h-4" /> Gestion des Matchs
          </Link>
          <Link href="/admin/actualites" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground">
            <Newspaper className="w-4 h-4" /> Actualités
          </Link>
        </nav>
        <div className="p-4 border-t border-border space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md">
            ← Site public
          </Link>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md">
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 md:px-8 sticky top-0 z-10 w-full">
          <h2 className="font-heading font-bold text-lg">Espace Administration</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {userInitial}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
