import { Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { ModeToggle } from '../ModeToggle'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            {/* TODO: Add White-label logo and name */}
            <span className="font-bold">HR Platform</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <LanguageSwitcher />
            <ModeToggle />
            {/* TODO: Add User Menu */}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      {/* TODO: Add Footer */}
    </div>
  )
}
