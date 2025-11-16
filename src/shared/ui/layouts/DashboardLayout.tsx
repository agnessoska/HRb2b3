import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModeToggle } from '../ModeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Coins,
  User,
  Settings,
  Building2,
  LogOut,
  Briefcase
} from 'lucide-react';
import { useOrganization } from '@/shared/hooks/useOrganization';
import { useAuthStore } from '@/app/store/auth';
import { supabase } from '@/shared/lib/supabase';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { data: organization } = useOrganization();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  const isHR = location.pathname.startsWith('/hr');

  const navItems = isHR ? [
    { label: t('navigation.dashboard'), path: '/hr/dashboard', icon: LayoutDashboard },
    { label: t('navigation.talentMarket'), path: '/hr/talent-market', icon: Users },
    { label: t('navigation.chat'), path: '/hr/chat', icon: MessageSquare },
    { label: t('navigation.buyTokens'), path: '/hr/buy-tokens', icon: Coins },
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {organization?.brand_logo_url ? (
                <img
                  src={organization.brand_logo_url}
                  alt={organization.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Briefcase className="h-5 w-5" />
                </div>
              )}
              <span className="font-bold text-lg hidden sm:inline-block">
                {organization?.name || t('hrPlatform')}
              </span>
            </div>
            {isHR && (
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "gap-2",
                        isActive && "bg-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {isHR && organization && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-sm">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-medium">{organization.token_balance || 0}</span>
              </div>
            )}
            <LanguageSwitcher />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/hr/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  {t('userMenu.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/hr/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('userMenu.settings')}
                </DropdownMenuItem>
                {isHR && (
                  <DropdownMenuItem onClick={() => navigate('/hr/organization')} className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    {t('userMenu.organization')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('userMenu.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};
