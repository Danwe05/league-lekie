'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function StandingsNav({ season }: { season?: string }) {
  const pathname = usePathname()
  
  const searchString = season ? `?season=${season}` : ''
  
  const links = [
    { name: 'Général', href: `/classement` },
    { name: 'Buteurs', href: `/classement/buteurs` },
    { name: 'Passeurs', href: `/classement/passeurs` },
    { name: 'Gardiens', href: `/classement/gardiens` },
  ]

  return (
    <div className="flex items-center gap-2 md:gap-4 flex-wrap bg-muted rounded-xl p-1 w-full sm:w-auto">
      {links.map(link => {
        const isActive = link.href === '/classement' 
          ? pathname === '/classement'
          : pathname.startsWith(link.href)
          
        return (
          <Link
            key={link.name}
            href={`${link.href}${searchString}`}
            className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all ${
              isActive 
                ? 'bg-background text-primary shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}
