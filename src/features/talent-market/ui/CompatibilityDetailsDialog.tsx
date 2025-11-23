import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { TalentMarketCandidate, ScoredCandidate } from "../types";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

// #region Comparison Components
interface ScaleComparison {
  ideal: number;
  candidate: number;
  match: number;
}

const getMatchColor = (match: number) => {
  if (match >= 80) return 'text-emerald-500';
  if (match >= 60) return 'text-amber-500';
  return 'text-blue-500';
};

const ComparisonCard = ({ name, description, match, ideal, candidate, t }: { name: string, description: string, match: number, ideal: number, candidate: number, t: (key: string, options?: object) => string }) => (
  <Card className="p-4">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={cn("text-2xl font-bold", getMatchColor(match))}>
          {Math.round(match)}%
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('detailsDialog.ideal')}</span>
          <span className="font-medium">{ideal}%</span>
        </div>
        <div className="relative h-8 bg-secondary rounded-full">
          <div className="absolute top-0 bottom-0 w-1 bg-primary/30" style={{ left: `${ideal}%` }}><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">{t('detailsDialog.ideal')}</div></div>
          <div className="absolute top-0 bottom-0 left-0 bg-primary rounded-full flex items-center justify-end pr-2" style={{ width: `${candidate}%` }}><span className="text-white text-sm font-medium">{candidate}%</span></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('detailsDialog.candidate')}</span>
          <span className="font-medium">{candidate}%</span>
        </div>
      </div>
      <div className="text-sm mt-2">
        {match >= 80 && <p className="text-emerald-600">✓ {t('detailsDialog.compatibility.excellent')}</p>}
        {match >= 60 && match < 80 && <p className="text-amber-600">~ {t('detailsDialog.compatibility.good')}</p>}
        {match < 60 && <p className="text-blue-600">⚠ {t('detailsDialog.compatibility.moderate')}</p>}
      </div>
    </div>
  </Card>
);

const BigFiveComparison = ({ details, t, tTests }: { details: Record<string, ScaleComparison>, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const scales = [
    { key: 'openness', name: tTests('psychometric.bigFive.openness.name'), description: tTests('psychometric.bigFive.openness.description') },
    { key: 'conscientiousness', name: tTests('psychometric.bigFive.conscientiousness.name'), description: tTests('psychometric.bigFive.conscientiousness.description') },
    { key: 'extraversion', name: tTests('psychometric.bigFive.extraversion.name'), description: tTests('psychometric.bigFive.extraversion.description') },
    { key: 'agreeableness', name: tTests('psychometric.bigFive.agreeableness.name'), description: tTests('psychometric.bigFive.agreeableness.description') },
    { key: 'neuroticism', name: tTests('psychometric.bigFive.neuroticism.name'), description: tTests('psychometric.bigFive.neuroticism.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};

const MBTIComparison = ({ details, t, tTests }: { details: { ideal: string; candidate: string; match: number }, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const idealLetters = details.ideal.split('');
  const candidateLetters = details.candidate.split('');
  const dichotomies = [
    { name: `${tTests('psychometric.mbti.dichotomies.E.name')} / ${tTests('psychometric.mbti.dichotomies.I.name')}` },
    { name: `${tTests('psychometric.mbti.dichotomies.S.name')} / ${tTests('psychometric.mbti.dichotomies.N.name')}` },
    { name: `${tTests('psychometric.mbti.dichotomies.T.name')} / ${tTests('psychometric.mbti.dichotomies.F.name')}` },
    { name: `${tTests('psychometric.mbti.dichotomies.J.name')} / ${tTests('psychometric.mbti.dichotomies.P.name')}` }
  ];
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-8"><div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.idealType')}</p><p className="text-4xl font-bold">{details.ideal}</p></div><div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.candidateType')}</p><p className="text-4xl font-bold">{details.candidate}</p></div></div>
        <Separator className="my-4" />
        <div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.match')}</p><p className="text-3xl font-bold text-primary">{details.match}%</p><p className="text-sm text-muted-foreground mt-2">{t('detailsDialog.mbti.matchesCount', { count: idealLetters.filter((l, i) => l === candidateLetters[i]).length })} {t('detailsDialog.outOf4Letters')}</p></div>
      </Card>
      <div className="space-y-3">
        <h4 className="font-semibold">{t('detailsDialog.mbti.dichotomiesBreakdown')}</h4>
        {dichotomies.map((dich, index) => {
          const matches = idealLetters[index] === candidateLetters[index];
          return (
            <Card key={index} className="p-4"><div className="flex items-center justify-between"><div className="flex-1"><p className="font-medium">{dich.name}</p><div className="flex gap-4 mt-2"><div><span className="text-sm text-muted-foreground">{t('detailsDialog.ideal')}: </span><span className="font-semibold">{idealLetters[index]}</span></div><div><span className="text-sm text-muted-foreground">{t('detailsDialog.candidate')}: </span><span className="font-semibold">{candidateLetters[index]}</span></div></div></div><div>{matches ? <Badge variant="success"><Check className="h-3 w-3 mr-1" />{t('detailsDialog.matches')}</Badge> : <Badge variant="secondary"><X className="h-3 w-3 mr-1" />{t('detailsDialog.doesNotMatch')}</Badge>}</div></div></Card>
          )
        })}
      </div>
    </div>
  );
};

const DISCComparison = ({ details, t, tTests }: { details: Record<string, ScaleComparison>, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const scales = [
    { key: 'D', name: tTests('psychometric.disc.D.name'), description: tTests('psychometric.disc.D.description') },
    { key: 'I', name: tTests('psychometric.disc.I.name'), description: tTests('psychometric.disc.I.description') },
    { key: 'S', name: tTests('psychometric.disc.S.name'), description: tTests('psychometric.disc.S.description') },
    { key: 'C', name: tTests('psychometric.disc.C.name'), description: tTests('psychometric.disc.C.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const EQComparison = ({ details, t, tTests }: { details: Record<string, ScaleComparison>, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const scales = [
    { key: 'self_awareness', name: tTests('psychometric.eq.selfAwareness.name'), description: tTests('psychometric.eq.selfAwareness.description') },
    { key: 'self_management', name: tTests('psychometric.eq.selfManagement.name'), description: tTests('psychometric.eq.selfManagement.description') },
    { key: 'social_awareness', name: tTests('psychometric.eq.socialAwareness.name'), description: tTests('psychometric.eq.socialAwareness.description') },
    { key: 'relationship_management', name: tTests('psychometric.eq.relationshipManagement.name'), description: tTests('psychometric.eq.relationshipManagement.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const SoftSkillsComparison = ({ details, t, tTests }: { details: Record<string, ScaleComparison>, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const scales = [
    { key: 'communication', name: tTests('psychometric.softSkills.communication.name'), description: tTests('psychometric.softSkills.communication.description') },
    { key: 'teamwork', name: tTests('psychometric.softSkills.teamwork.name'), description: tTests('psychometric.softSkills.teamwork.description') },
    { key: 'critical_thinking', name: tTests('psychometric.softSkills.criticalThinking.name'), description: tTests('psychometric.softSkills.criticalThinking.description') },
    { key: 'adaptability', name: tTests('psychometric.softSkills.adaptability.name'), description: tTests('psychometric.softSkills.adaptability.description') },
    { key: 'initiative', name: tTests('psychometric.softSkills.initiative.name'), description: tTests('psychometric.softSkills.initiative.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const MotivationComparison = ({ details, t, tTests }: { details: Record<string, ScaleComparison>, t: (key: string, options?: object) => string, tTests: (key: string) => string }) => {
  const scales = [
    { key: 'achievement', name: tTests('psychometric.motivation.achievement.name'), description: tTests('psychometric.motivation.achievement.description') },
    { key: 'power', name: tTests('psychometric.motivation.power.name'), description: tTests('psychometric.motivation.power.description') },
    { key: 'affiliation', name: tTests('psychometric.motivation.affiliation.name'), description: tTests('psychometric.motivation.affiliation.description') },
    { key: 'autonomy', name: tTests('psychometric.motivation.autonomy.name'), description: tTests('psychometric.motivation.autonomy.description') },
    { key: 'security', name: tTests('psychometric.motivation.security.name'), description: tTests('psychometric.motivation.security.description') },
    { key: 'growth', name: tTests('psychometric.motivation.growth.name'), description: tTests('psychometric.motivation.growth.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
// #endregion

interface CompatibilityDetailsDialogProps {
  candidate: TalentMarketCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export const CompatibilityDetailsDialog = ({ candidate, isOpen, onClose }: CompatibilityDetailsDialogProps) => {
  const { t } = useTranslation('talent-market');
  const { t: tTests } = useTranslation('tests');
  const [activeTab, setActiveTab] = useState('bigFive');

  if (!('professional_compatibility' in candidate)) return null;
  const scoredCandidate = candidate as ScoredCandidate;

  const tests = [
    { id: 'bigFive', name: 'Big Five', weight: 25 },
    { id: 'mbti', name: 'MBTI', weight: 10 },
    { id: 'disc', name: 'DISC', weight: 10 },
    { id: 'eq', name: 'EQ', weight: 20 },
    { id: 'softSkills', name: 'Soft Skills', weight: 20 },
    { id: 'motivation', name: 'Motivation', weight: 15 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('detailsDialog.title', { name: scoredCandidate.full_name })}</DialogTitle>
          <DialogDescription>{t('detailsDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <Card className="p-4 text-center"><p className="text-sm text-muted-foreground mb-1">{t('detailsDialog.professional')}</p><p className="text-2xl font-bold">{scoredCandidate.professional_compatibility}%</p><p className="text-xs text-muted-foreground mt-1">{t('detailsDialog.professionalWeight')}</p></Card>
          <Card className="p-4 text-center"><p className="text-sm text-muted-foreground mb-1">{t('detailsDialog.personal')}</p><p className="text-2xl font-bold">{scoredCandidate.personal_compatibility}%</p><p className="text-xs text-muted-foreground mt-1">{t('detailsDialog.personalWeight')}</p></Card>
          <Card className="p-4 text-center bg-primary/5"><p className="text-sm text-muted-foreground mb-1">{t('detailsDialog.overall')}</p><p className="text-3xl font-bold text-primary">{scoredCandidate.overall_compatibility}%</p></Card>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="hidden md:grid w-full grid-cols-6">
              {tests.map((test) => (<TabsTrigger key={test.id} value={test.id} className="text-xs">{test.name}<span className="ml-1 text-[10px] text-muted-foreground">({test.weight}%)</span></TabsTrigger>))}
            </TabsList>
            <div className="md:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tests.map((test) => (<SelectItem key={test.id} value={test.id}>{test.name} ({test.weight}%)</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-auto p-1">
              <TabsContent value="bigFive"><BigFiveComparison details={(scoredCandidate.compatibility_details as unknown as { bigFive: Record<string, ScaleComparison> }).bigFive} t={t} tTests={tTests} /></TabsContent>
              <TabsContent value="mbti"><MBTIComparison details={(scoredCandidate.compatibility_details as unknown as { mbti: { ideal: string; candidate: string; match: number } }).mbti} t={t} tTests={tTests} /></TabsContent>
              <TabsContent value="disc"><DISCComparison details={(scoredCandidate.compatibility_details as unknown as { disc: Record<string, ScaleComparison> }).disc} t={t} tTests={tTests} /></TabsContent>
              <TabsContent value="eq"><EQComparison details={(scoredCandidate.compatibility_details as unknown as { eq: Record<string, ScaleComparison> }).eq} t={t} tTests={tTests} /></TabsContent>
              <TabsContent value="softSkills"><SoftSkillsComparison details={(scoredCandidate.compatibility_details as unknown as { softSkills: Record<string, ScaleComparison> }).softSkills} t={t} tTests={tTests} /></TabsContent>
              <TabsContent value="motivation"><MotivationComparison details={(scoredCandidate.compatibility_details as unknown as { motivation: Record<string, ScaleComparison> }).motivation} t={t} tTests={tTests} /></TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('detailsDialog.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
