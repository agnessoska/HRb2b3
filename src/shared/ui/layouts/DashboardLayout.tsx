import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '../ModeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { UserMenu } from '../UserMenu';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/app/store/auth';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/shared/lib/supabase';
import { TokenBalance } from '../TokenBalance';
import { useUnreadMessagesCount } from '@/features/chat/hooks/useUnreadMessagesCount';
import { useHrProfile } from '@/shared/hooks/useHrProfile';
import { useQuery } from '@tanstack/react-query';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation('common');
  const { data: organization } = useOrganization();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const role = user?.user_metadata?.role;
  const [isOpen, setIsOpen] = React.useState(false);
  const { count: unreadCount } = useUnreadMessagesCount();
  const { data: hrProfile } = useHrProfile();

  const { data: candidateProfile } = useQuery({
    queryKey: ['candidateProfile', user?.id],
    queryFn: async () => {
      if (!user || role !== 'candidate') return null;
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user && role === 'candidate'
  });

  const avatarUrl = role === 'hr'
    ? (hrProfile?.avatar_url || user?.user_metadata?.avatar_url)
    : (candidateProfile?.avatar_url || user?.user_metadata?.avatar_url);

  const fullName = role === 'hr'
    ? (hrProfile?.full_name || user?.user_metadata?.full_name || 'User')
    : (candidateProfile?.full_name || user?.user_metadata?.full_name || 'User');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const hrLinks = [
    { href: '/hr/dashboard', label: t('nav.dashboard', 'Дашборд') },
    { href: '/hr/talent-market', label: t('nav.talentMarket', 'Рынок талантов') },
    { href: '/hr/chat', label: t('nav.chat', 'Чат') },
    { href: '/hr/ai-assistant', label: t('nav.aiAssistant', 'AI Ассистент') },
    { href: '/hr/billing', label: t('nav.billing', 'Биллинг') },
    { href: '/hr/team', label: t('nav.team', 'Команда') },
  ];

  const candidateLinks = [
    { href: '/candidate/dashboard', label: t('nav.dashboard', 'Дашборд') },
    { href: '/candidate/chat', label: t('nav.chat', 'Чат') },
    { href: '/candidate/profile', label: t('profile', 'Профиль') },
  ];

  const links = role === 'hr' ? hrLinks : role === 'candidate' ? candidateLinks : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 mr-4">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader className="mb-6">
                  <div className="flex items-center gap-2">
                    {organization?.brand_logo_url ? (
                      <Avatar className="h-8 w-8 rounded-sm">
                        <AvatarImage src={organization.brand_logo_url} alt={organization.name || 'Logo'} />
                        <AvatarFallback className="rounded-sm">{organization.name?.substring(0, 2).toUpperCase() || 'HR'}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <span className="text-lg font-black italic tracking-tighter select-none">L</span>
                      </div>
                    )}
                    <SheetTitle className="font-bold">{organization?.name || t('hrPlatform')}</SheetTitle>
                  </div>
                </SheetHeader>
                
                <nav className="flex flex-col space-y-3 flex-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        location.pathname.startsWith(link.href)
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <span>{link.label}</span>
                      {link.href.includes('chat') && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 rounded-full h-5 min-w-[1.25rem] flex items-center justify-center px-1 animate-pulse">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>

                <div className="border-t pt-6 space-y-4">
                  {role === 'hr' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('balance', 'Баланс')}</span>
                      <TokenBalance />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('settings')}</span>
                    <div className="flex items-center gap-2">
                      <LanguageSwitcher />
                      <ModeToggle />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                     <div className="flex items-center gap-3">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                          <AvatarFallback>{fullName.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{fullName}</span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">{user?.email}</span>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" onClick={handleSignOut}>
                       <LogOut className="h-4 w-4" />
                     </Button>
                  </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {organization?.brand_logo_url ? (
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarImage src={organization.brand_logo_url} alt={organization.name || 'Logo'} />
                  <AvatarFallback className="rounded-sm">{organization.name?.substring(0, 2).toUpperCase() || 'HR'}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <span className="text-lg font-black italic tracking-tighter select-none">L</span>
                </div>
              )}
              <span className="font-bold hidden md:inline-block">{organization?.name || t('hrPlatform')}</span>
            </Link>
          </div>
          
          {/* Center Section: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 flex items-center gap-1.5",
                  location.pathname.startsWith(link.href) ? "text-foreground font-bold" : "text-foreground/60"
                )}
              >
                <span>{link.label}</span>
                {link.href.includes('chat') && unreadCount > 0 && (
                  <Badge variant="destructive" className="rounded-full h-4 min-w-[1rem] flex items-center justify-center px-1 text-[9px] animate-pulse border-none">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end space-x-4 ml-auto">
            {role === 'hr' && <TokenBalance className="hidden sm:flex mr-2" />}
            <nav className="flex items-center space-x-1">
              <LanguageSwitcher />
              <ModeToggle />
              <div className="ml-2">
                <UserMenu />
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  );
};
