import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModeToggle } from '../ModeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div>
            {/* TODO: Add Organization Logo and Name */}
            <span className="font-bold">{t('hrPlatform')}</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <LanguageSwitcher />
              <ModeToggle />
              {/* TODO: Add User Menu */}
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};
