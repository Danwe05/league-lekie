'use client'

import { useState, useEffect, useRef } from 'react'
import { searchPlayers } from '@/lib/search-actions'
import { Player } from '@/lib/types'
import { Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Handle click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true)
        const res = await searchPlayers(query)
        setResults(res)
        setIsSearching(false)
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const clear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm ml-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un joueur..."
          className="pl-9 pr-8 h-9 shadow-sm bg-background border-border rounded-full focus-visible:ring-1 focus-visible:ring-primary/50 transition-all placeholder:text-muted-foreground/70"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
        {query.length > 0 && (
          <button
            onClick={clear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-full sm:w-[350px] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <ul className="max-h-[350px] overflow-y-auto p-2 space-y-1">
            {results.map(player => (
              <li key={player.id}>
                <Link
                  href={`/joueurs/${player.id}`}
                  onClick={clear}
                  className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-muted border border-border group-hover:border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {player.photoUrl ? (
                       <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-xs font-bold text-muted-foreground">{player.name.substring(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                     <span className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">{player.name}</span>
                     <span className="text-xs text-muted-foreground truncate">{player.position}</span>
                  </div>
                  {player.goals ? (
                     <div className="shrink-0 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold font-heading">
                        {player.goals} buts
                     </div>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && results.length === 0 && query.trim().length > 1 && !isSearching && (
        <div className="absolute top-full right-0 mt-2 w-full sm:w-[350px] bg-card border border-border rounded-xl shadow-lg z-50 p-6 text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-muted-foreground text-sm">Aucun résultat pour "{query}"</p>
        </div>
      )}
    </div>
  )
}
