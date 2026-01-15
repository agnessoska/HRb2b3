import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";
import type { TalentMarketCandidate, ScoredCandidate } from "../types";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import { HelpCircle } from "@/shared/ui/HelpCircle";
import type { TFunction } from 'i18next';
import { useQuery } from "@tanstack/react-query";
import { getVacancySkills } from "@/features/vacancy-management/api/getVacancySkills";

// #region Comparison Components
interface ScaleComparison {
  ideal: number;
  candidate: number;
  match: number;
}

interface CompatibilityDetails {
  bigFive?: Record<string, ScaleComparison>;
  mbti?: { ideal: string; candidate: string; match: number };
  disc?: Record<string, ScaleComparison>;
  eq?: Record<string, ScaleComparison>;
  softSkills?: Record<string, ScaleComparison>;
  motivation?: Record<string, ScaleComparison>;
}

const getMatchColor = (match: number) => {
  if (match >= 80) return 'text-emerald-500';
  if (match >= 60) return 'text-amber-500';
  return 'text-blue-500';
};

const DataNotAvailable = ({ t }: { t: TFunction<"talent-market"> }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-muted/30 rounded-xl border border-dashed text-muted-foreground">
    <div className="p-3 bg-muted rounded-full">
      <X className="h-6 w-6" />
    </div>
    <div className="space-y-1">
      <p className="font-medium">{t('detailsDialog.dataNotAvailable')}</p>
      <p className="text-sm">{t('detailsDialog.dataNotAvailableDesc')}</p>
    </div>
  </div>
);

const ComparisonCard = ({ name, description, match, ideal, candidate, t }: { name: string, description: string, match: number, ideal: number, candidate: number, t: TFunction<"talent-market"> }) => (
  <Card className="p-4 border-border/50">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-semibold truncate">{name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        </div>
        <div className={cn("text-2xl font-bold shrink-0", getMatchColor(match))}>
          {Math.round(match)}%
        </div>
      </div>
      <div className="space-y-6 pt-4">
        <div className="relative h-10 bg-secondary/50 rounded-full border shadow-inner">
          {/* Candidate bar */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-primary rounded-full flex items-center justify-end pr-3 transition-all duration-700 ease-out z-0"
            style={{ width: `${candidate}%` }}
          >
            {candidate > 15 && <span className="text-white text-[10px] font-black">{candidate}%</span>}
          </div>
          
          {/* Ideal indicator line - moved to z-20 to be above everything */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-orange-500 z-20 shadow-[0_0_8px_rgba(249,115,22,0.6)] rounded-full"
            style={{ left: `calc(${ideal}% - 3px)` }}
          >
            <div
              className={cn(
                "absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border-2 border-orange-500 shadow-md whitespace-nowrap z-30",
                ideal < 15 && "translate-x-0 -left-1",
                ideal > 85 && "translate-x-[-100%] -left-1"
              )}
            >
              {t('detailsDialog.ideal')} {ideal}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <span className="text-orange-600">{t('detailsDialog.ideal')}: {ideal}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-primary">{t('detailsDialog.candidate')}: {candidate}%</span>
          </div>
        </div>
      </div>
      <div className="text-sm mt-2 font-medium">
        {match >= 80 && <p className="text-emerald-600 dark:text-emerald-500">✓ {t('detailsDialog.compatibility.excellent')}</p>}
        {match >= 60 && match < 80 && <p className="text-amber-600 dark:text-amber-500">~ {t('detailsDialog.compatibility.good')}</p>}
        {match < 60 && <p className="text-blue-600 dark:text-blue-500">⚠ {t('detailsDialog.compatibility.moderate')}</p>}
      </div>
    </div>
  </Card>
);

const BigFiveComparison = ({ details, t, tTests }: { details?: Record<string, ScaleComparison>, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details) return <DataNotAvailable t={t} />;
  const scales = [
    { key: 'openness', name: tTests('psychometric.bigFive.openness.name'), description: tTests('psychometric.bigFive.openness.description') },
    { key: 'conscientiousness', name: tTests('psychometric.bigFive.conscientiousness.name'), description: tTests('psychometric.bigFive.conscientiousness.description') },
    { key: 'extraversion', name: tTests('psychometric.bigFive.extraversion.name'), description: tTests('psychometric.bigFive.extraversion.description') },
    { key: 'agreeableness', name: tTests('psychometric.bigFive.agreeableness.name'), description: tTests('psychometric.bigFive.agreeableness.description') },
    { key: 'neuroticism', name: tTests('psychometric.bigFive.neuroticism.name'), description: tTests('psychometric.bigFive.neuroticism.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};

const MBTIComparison = ({ details, t, tTests }: { details?: { ideal: string; candidate: string; match: number }, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details || !details.ideal || !details.candidate) return <DataNotAvailable t={t} />;
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
      <Card className="p-6 border-border/50">
        <div className="grid grid-cols-2 gap-8"><div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.idealType')}</p><p className="text-4xl font-bold">{details.ideal}</p></div><div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.candidateType')}</p><p className="text-4xl font-bold">{details.candidate}</p></div></div>
        <Separator className="my-4" />
        <div className="text-center"><p className="text-sm text-muted-foreground mb-2">{t('detailsDialog.mbti.match')}</p><p className="text-3xl font-bold text-primary">{details.match}%</p><p className="text-sm text-muted-foreground mt-2">{t('detailsDialog.mbti.matchesCount', { count: idealLetters.filter((l, i) => l === candidateLetters[i]).length })} {t('detailsDialog.outOf4Letters')}</p></div>
      </Card>
      <div className="space-y-3">
        <h4 className="font-semibold">{t('detailsDialog.mbti.dichotomiesBreakdown')}</h4>
        {dichotomies.map((dich, index) => {
          const matches = idealLetters[index] === candidateLetters[index];
          return (
            <Card key={index} className="p-4 border-border/50"><div className="flex items-center justify-between"><div className="flex-1"><p className="font-medium">{dich.name}</p><div className="flex gap-4 mt-2"><div><span className="text-sm text-muted-foreground">{t('detailsDialog.ideal')}: </span><span className="font-semibold">{idealLetters[index]}</span></div><div><span className="text-sm text-muted-foreground">{t('detailsDialog.candidate')}: </span><span className="font-semibold">{candidateLetters[index]}</span></div></div></div><div>{matches ? <Badge variant="success"><Check className="h-3 w-3 mr-1" />{t('detailsDialog.matches')}</Badge> : <Badge variant="secondary"><X className="h-3 w-3 mr-1" />{t('detailsDialog.doesNotMatch')}</Badge>}</div></div></Card>
          )
        })}
      </div>
    </div>
  );
};

const DISCComparison = ({ details, t, tTests }: { details?: Record<string, ScaleComparison>, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details) return <DataNotAvailable t={t} />;
  const scales = [
    { key: 'D', name: tTests('psychometric.disc.D.name'), description: tTests('psychometric.disc.D.description') },
    { key: 'I', name: tTests('psychometric.disc.I.name'), description: tTests('psychometric.disc.I.description') },
    { key: 'S', name: tTests('psychometric.disc.S.name'), description: tTests('psychometric.disc.S.description') },
    { key: 'C', name: tTests('psychometric.disc.C.name'), description: tTests('psychometric.disc.C.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const EQComparison = ({ details, t, tTests }: { details?: Record<string, ScaleComparison>, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details) return <DataNotAvailable t={t} />;
  const scales = [
    { key: 'self_awareness', name: tTests('psychometric.eq.selfAwareness.name'), description: tTests('psychometric.eq.selfAwareness.description') },
    { key: 'self_management', name: tTests('psychometric.eq.selfManagement.name'), description: tTests('psychometric.eq.selfManagement.description') },
    { key: 'social_awareness', name: tTests('psychometric.eq.socialAwareness.name'), description: tTests('psychometric.eq.socialAwareness.description') },
    { key: 'relationship_management', name: tTests('psychometric.eq.relationshipManagement.name'), description: tTests('psychometric.eq.relationshipManagement.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const SoftSkillsComparison = ({ details, t, tTests }: { details?: Record<string, ScaleComparison>, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details) return <DataNotAvailable t={t} />;
  const scales = [
    { key: 'communication', name: tTests('psychometric.softSkills.communication.name'), description: tTests('psychometric.softSkills.communication.description') },
    { key: 'teamwork', name: tTests('psychometric.softSkills.teamwork.name'), description: tTests('psychometric.softSkills.teamwork.description') },
    { key: 'critical_thinking', name: tTests('psychometric.softSkills.criticalThinking.name'), description: tTests('psychometric.softSkills.criticalThinking.description') },
    { key: 'adaptability', name: tTests('psychometric.softSkills.adaptability.name'), description: tTests('psychometric.softSkills.adaptability.description') },
    { key: 'initiative', name: tTests('psychometric.softSkills.initiative.name'), description: tTests('psychometric.softSkills.initiative.description') }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} t={t} /> : null)}</div>;
};
const MotivationComparison = ({ details, t, tTests }: { details?: Record<string, ScaleComparison>, t: TFunction<"talent-market">, tTests: TFunction<"tests"> }) => {
  if (!details) return <DataNotAvailable t={t} />;
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

interface SkillData {
  name: string;
  canonical_name?: string;
  canonical_skill?: string;
  is_required?: boolean;
}

const ProfessionalComparison = ({
  candidateSkills,
  vacancySkills,
  t
}: {
  candidateSkills: SkillData[],
  vacancySkills: SkillData[],
  t: TFunction<"talent-market">
}) => {
  const matched = vacancySkills.filter(vs =>
    candidateSkills.some(cs => cs.canonical_name === vs.canonical_skill)
  );
  
  const missing = vacancySkills.filter(vs =>
    !candidateSkills.some(cs => cs.canonical_name === vs.canonical_skill)
  );

  const additional = candidateSkills.filter(cs =>
    !vacancySkills.some(vs => vs.canonical_skill === cs.canonical_name)
  );

  if (vacancySkills.length === 0) {
    return (
      <div className="space-y-8">
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-100">{t('detailsDialog.noVacancyRequirementsTitle')}</p>
            <p className="text-sm text-amber-800 dark:text-amber-200/80">{t('detailsDialog.noVacancyRequirementsDesc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
            {t('detailsDialog.candidateSkills')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidateSkills.map((s, idx) => (
              <Badge key={s.canonical_name || idx} variant="secondary" className="py-1 px-3 rounded-lg text-sm bg-secondary hover:bg-secondary transition-colors">
                {s.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Совпадения */}
      {matched.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2 uppercase text-[10px] tracking-widest">
            <div className="p-1 bg-emerald-500/10 rounded-full"><Check className="h-3 w-3" /></div>
            {t('detailsDialog.matchedSkills')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched.map((s, idx) => (
              <Badge key={s.canonical_skill || idx} variant="success" className="py-1.5 px-3 rounded-lg text-sm transition-transform hover:scale-105">
                {s.name} {s.is_required && <span className="ml-1 text-[10px] opacity-70">(*)</span>}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-bold text-muted-foreground flex items-center gap-2 uppercase text-[10px] tracking-widest opacity-60">
            <div className="p-1 bg-muted rounded-full"><X className="h-3 w-3" /></div>
            {t('detailsDialog.matchedSkills')}
          </h4>
          <p className="text-sm text-muted-foreground italic px-1">{t('detailsDialog.noMatchedSkills')}</p>
        </div>
      )}

      {/* Не хватает */}
      {missing.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-bold text-rose-600 dark:text-rose-500 flex items-center gap-2 uppercase text-[10px] tracking-widest">
            <div className="p-1 bg-rose-500/10 rounded-full"><X className="h-3 w-3" /></div>
            {t('detailsDialog.missingSkills')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {missing.map((s, idx) => (
              <Badge key={s.canonical_skill || idx} variant="destructive" className="py-1.5 px-3 rounded-lg text-sm">
                {s.name} {s.is_required && <span className="ml-1 text-[10px] opacity-70">(*)</span>}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* Дополнительно */}
      <div className="space-y-4 pt-6 border-t border-dashed">
        <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest opacity-80">
          {t('detailsDialog.additionalSkills')}
        </h4>
        <div className="flex flex-wrap gap-2 opacity-80">
          {additional.map((s, idx) => (
            <Badge key={s.canonical_name || idx} variant="secondary" className="py-1 px-3 rounded-lg text-sm bg-secondary hover:bg-secondary transition-colors">
              {s.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CompatibilityDetailsDialogProps {
  candidate: TalentMarketCandidate;
  vacancyId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CompatibilityDetailsDialog = ({ candidate, vacancyId, isOpen, onClose }: CompatibilityDetailsDialogProps) => {
  const { t, i18n } = useTranslation('talent-market');
  const { t: tTests } = useTranslation('tests');
  const [activeTab, setActiveTab] = useState('bigFive');
  const [mode, setMode] = useState<'personal' | 'professional'>('personal');

  const { data: vacancySkills } = useQuery({
    queryKey: ['vacancy-skills', vacancyId, i18n.language],
    queryFn: () => vacancyId ? getVacancySkills(vacancyId, i18n.language as 'ru' | 'en' | 'kk') : Promise.resolve([]),
    enabled: !!vacancyId && isOpen && mode === 'professional',
    staleTime: 0, // Принудительно запрашиваем свежие данные при открытии
  });

  if (!candidate || !('professional_compatibility' in candidate)) return null;
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
      <DialogContent className="max-w-4xl h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold">{t('detailsDialog.title', { name: scoredCandidate.full_name })}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{t('detailsDialog.description')}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-border/50 mb-8">
            <Card
              className={cn(
                "p-5 text-center cursor-pointer transition-all border-2 relative overflow-hidden rounded-2xl",
                mode === 'professional'
                  ? "border-primary bg-primary/5 dark:bg-primary/10 ring-4 ring-primary/10 scale-[1.02] shadow-xl shadow-primary/5"
                  : "bg-muted/5 border-transparent hover:bg-muted/10 hover:border-border/50"
              )}
              onClick={() => setMode('professional')}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{t('detailsDialog.professional')}</p>
                <HelpCircle topicId="match_score_professional" iconClassName="h-3.5 w-3.5 opacity-60" />
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter">{scoredCandidate.professional_compatibility}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-2">{t('detailsDialog.professionalWeight')}</p>
            </Card>
  
            <Card
              className={cn(
                "p-5 text-center cursor-pointer transition-all border-2 relative overflow-hidden rounded-2xl",
                mode === 'personal'
                  ? "border-primary bg-primary/5 dark:bg-primary/10 ring-4 ring-primary/10 scale-[1.02] shadow-xl shadow-primary/5"
                  : "bg-muted/5 border-transparent hover:bg-muted/10 hover:border-border/50"
              )}
              onClick={() => setMode('personal')}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{t('detailsDialog.personal')}</p>
                <HelpCircle topicId="match_score_personal" iconClassName="h-3.5 w-3.5 opacity-60" />
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter">{scoredCandidate.personal_compatibility}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mt-2">{t('detailsDialog.personalWeight')}</p>
            </Card>
  
            <Card className="p-5 text-center bg-primary border-2 border-primary shadow-xl shadow-primary/20 relative overflow-hidden rounded-2xl">
              <div className="flex items-center justify-center gap-1.5 mb-2 relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">{t('detailsDialog.overall')}</p>
                <HelpCircle topicId="match_score_detailed" iconClassName="h-3.5 w-3.5 text-primary-foreground/60" />
              </div>
              <p className="text-4xl font-black text-primary-foreground relative z-10 tracking-tighter">{scoredCandidate.overall_compatibility}%</p>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-black/10 rounded-full blur-xl" />
            </Card>
          </div>
  
          <div className="py-4 min-h-[400px]">
            {mode === 'professional' ? (
              <ProfessionalComparison
                candidateSkills={scoredCandidate.skills as unknown as SkillData[]}
                vacancySkills={vacancySkills as unknown as SkillData[] || []}
                t={t}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden md:grid w-full grid-cols-6 h-14 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                  {tests.map((test) => (
                    <TabsTrigger
                      key={test.id}
                      value={test.id}
                      className="text-[10px] uppercase font-bold tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                    >
                      {test.name}
                      <div className="text-[8px] opacity-50 mt-0.5">{test.weight}%</div>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="md:hidden mb-4">
                  <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">{tests.map((test) => (<SelectItem key={test.id} value={test.id} className="rounded-lg">{test.name} ({test.weight}%)</SelectItem>))}</SelectContent>
                  </Select>
                </div>

                <div className="mt-6">
                  <TabsContent value="bigFive">
                    <BigFiveComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.bigFive}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                  <TabsContent value="mbti">
                    <MBTIComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.mbti}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                  <TabsContent value="disc">
                    <DISCComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.disc}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                  <TabsContent value="eq">
                    <EQComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.eq}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                  <TabsContent value="softSkills">
                    <SoftSkillsComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.softSkills}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                  <TabsContent value="motivation">
                    <MotivationComparison
                      details={(scoredCandidate.compatibility_details as unknown as CompatibilityDetails)?.motivation}
                      t={t}
                      tTests={tTests}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>

        <DialogFooter className="p-8 bg-muted/20 border-t border-border/50 backdrop-blur-md">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-10 h-12 font-bold border-border/50 hover:bg-background transition-colors">{t('detailsDialog.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
