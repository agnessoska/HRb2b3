import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/shared/hooks/useAuth'
import { supabase } from '@/shared/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Settings, LogOut } from 'lucide-react'
import { useHrProfile } from '@/shared/hooks/useHrProfile'
import { useQuery } from '@tanstack/react-query'

export function UserMenu() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { data: hrProfile } = useHrProfile()

  // Fetch candidate profile manually since we don't have a shared hook for it yet in shared/hooks
  // Or better, let's create a small local query if role is candidate
  const { data: candidateProfile } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: async () => {
      if (!user || role !== 'candidate') return null
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single()
      return data
    },
    enabled: !!user && role === 'candidate'
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/auth/login')
  }

  if (!user) return null

  const initials = user.email?.substring(0, 2).toUpperCase() || 'U'
  const profileLink = role === 'hr' ? '/hr/profile' : '/candidate/profile'
  
  const avatarUrl = role === 'hr'
    ? (hrProfile?.avatar_url || user.user_metadata?.avatar_url)
    : (candidateProfile?.avatar_url || user.user_metadata?.avatar_url)

  const fullName = role === 'hr'
    ? (hrProfile?.full_name || user.user_metadata?.full_name || 'User')
    : (candidateProfile?.full_name || user.user_metadata?.full_name || 'User')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={user.email || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(profileLink)}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(profileLink)}> {/* Assuming settings are in profile for now */}
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}