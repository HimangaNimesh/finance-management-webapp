'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  WalletCards, 
  ArrowRightLeft, 
  Landmark, 
  Tags, 
  Settings, 
  LogOut,
  Menu,
  X,
  PieChart
} from 'lucide-react'
import { signout } from '@/app/auth/actions'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Budget', href: '/budget', icon: WalletCards },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Accounts', href: '/accounts', icon: Landmark },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Stats', href: '/stats', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation({ userName }: { userName?: string }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-card shrink-0 relative z-30">
        <div className="flex items-center">
          <WalletCards className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg text-foreground tracking-tight">Finance App</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col min-h-screen ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center">
            <WalletCards className="h-8 w-8 text-primary" />
            <span className="ml-3 font-bold text-lg text-foreground tracking-tight md:block">Finance App</span>
          </div>
          <button 
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2.5 text-sm font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border">
            {userName && (
              <div className="px-2 mb-3 text-sm font-medium text-foreground truncate" title={userName}>
                {userName}
              </div>
            )}
            <button
              onClick={() => signout()}
              className="group flex w-full items-center px-2 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
