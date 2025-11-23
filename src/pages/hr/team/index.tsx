import { Users, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TeamMembersTable } from '@/features/team/ui/TeamMembersTable'
import { InviteMemberDialog } from '@/features/team/ui/InviteMemberDialog'
import { InvitationsTable } from '@/features/team/ui/InvitationsTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TeamPage = () => {
  const { t } = useTranslation(['team', 'common'])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <InviteMemberDialog />
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            {t('tabs.members', 'Участники')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Activity className="h-4 w-4" />
            {t('tabs.analytics', 'Аналитика')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-6">
          <TeamMembersTable />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{t('analytics.invitationsHistory', 'История приглашений')}</h3>
            <InvitationsTable />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TeamPage
