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

const ComparisonCard = ({ name, description, match, ideal, candidate }: { name: string, description: string, match: number, ideal: number, candidate: number }) => (
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
          <span className="text-muted-foreground">Идеал</span>
          <span className="font-medium">{ideal}%</span>
        </div>
        <div className="relative h-8 bg-secondary rounded-full">
          <div className="absolute top-0 bottom-0 w-1 bg-primary/30" style={{ left: `${ideal}%` }}><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">Идеал</div></div>
          <div className="absolute top-0 bottom-0 left-0 bg-primary rounded-full flex items-center justify-end pr-2" style={{ width: `${candidate}%` }}><span className="text-white text-sm font-medium">{candidate}%</span></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Кандидат</span>
          <span className="font-medium">{candidate}%</span>
        </div>
      </div>
      <div className="text-sm mt-2">
        {match >= 80 && <p className="text-emerald-600">✓ Отличное совпадение</p>}
        {match >= 60 && match < 80 && <p className="text-amber-600">~ Хорошее совпадение</p>}
        {match < 60 && <p className="text-blue-600">⚠ Умеренное совпадение</p>}
      </div>
    </div>
  </Card>
);

const BigFiveComparison = ({ details }: { details: Record<string, ScaleComparison> }) => {
  const scales = [
    { key: 'openness', name: 'Открытость опыту', description: 'Интерес к новому' },
    { key: 'conscientiousness', name: 'Добросовестность', description: 'Организованность' },
    { key: 'extraversion', name: 'Экстраверсия', description: 'Общительность' },
    { key: 'agreeableness', name: 'Доброжелательность', description: 'Эмпатия' },
    { key: 'neuroticism', name: 'Нейротизм', description: 'Эмоциональная стабильность' }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} /> : null)}</div>;
};

const MBTIComparison = ({ details }: { details: { ideal: string; candidate: string; match: number } }) => {
  const idealLetters = details.ideal.split('');
  const candidateLetters = details.candidate.split('');
  const dichotomies = [
    { name: 'Экстраверсия / Интроверсия' }, { name: 'Сенсорика / Интуиция' },
    { name: 'Мышление / Чувство' }, { name: 'Суждение / Восприятие' }
  ];
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-8"><div className="text-center"><p className="text-sm text-muted-foreground mb-2">Идеальный тип</p><p className="text-4xl font-bold">{details.ideal}</p></div><div className="text-center"><p className="text-sm text-muted-foreground mb-2">Тип кандидата</p><p className="text-4xl font-bold">{details.candidate}</p></div></div>
        <Separator className="my-4" />
        <div className="text-center"><p className="text-sm text-muted-foreground mb-2">Совпадение</p><p className="text-3xl font-bold text-primary">{details.match}%</p><p className="text-sm text-muted-foreground mt-2">Совпадает {idealLetters.filter((l, i) => l === candidateLetters[i]).length} из 4 букв</p></div>
      </Card>
      <div className="space-y-3">
        <h4 className="font-semibold">Детализация по дихотомиям</h4>
        {dichotomies.map((dich, index) => {
          const matches = idealLetters[index] === candidateLetters[index];
          return (
            <Card key={index} className="p-4"><div className="flex items-center justify-between"><div className="flex-1"><p className="font-medium">{dich.name}</p><div className="flex gap-4 mt-2"><div><span className="text-sm text-muted-foreground">Идеал: </span><span className="font-semibold">{idealLetters[index]}</span></div><div><span className="text-sm text-muted-foreground">Кандидат: </span><span className="font-semibold">{candidateLetters[index]}</span></div></div></div><div>{matches ? <Badge variant="success"><Check className="h-3 w-3 mr-1" />Совпадает</Badge> : <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Не совпадает</Badge>}</div></div></Card>
          )
        })}
      </div>
    </div>
  );
};

const DISCComparison = ({ details }: { details: Record<string, ScaleComparison> }) => {
  const scales = [
    { key: 'D', name: 'Доминирование', description: 'Напористость, ориентация на результат' },
    { key: 'I', name: 'Влияние', description: 'Общительность, оптимизм' },
    { key: 'S', name: 'Постоянство', description: 'Надежность, терпение' },
    { key: 'C', name: 'Соответствие', description: 'Точность, аналитичность' }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} /> : null)}</div>;
};
const EQComparison = ({ details }: { details: Record<string, ScaleComparison> }) => {
  const scales = [
    { key: 'self_awareness', name: 'Самосознание', description: 'Понимание своих эмоций' },
    { key: 'self_management', name: 'Самоуправление', description: 'Контроль импульсов' },
    { key: 'social_awareness', name: 'Социальная осведомленность', description: 'Эмпатия' },
    { key: 'relationship_management', name: 'Управление отношениями', description: 'Влияние' }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} /> : null)}</div>;
};
const SoftSkillsComparison = ({ details }: { details: Record<string, ScaleComparison> }) => {
  const scales = [
    { key: 'communication', name: 'Коммуникация', description: 'Ясность выражения мыслей' },
    { key: 'teamwork', name: 'Работа в команде', description: 'Коллаборация' },
    { key: 'critical_thinking', name: 'Критическое мышление', description: 'Анализ, принятие решений' },
    { key: 'adaptability', name: 'Адаптивность', description: 'Гибкость к изменениям' },
    { key: 'initiative', name: 'Инициативность', description: 'Проактивность' }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} /> : null)}</div>;
};
const MotivationComparison = ({ details }: { details: Record<string, ScaleComparison> }) => {
  const scales = [
    { key: 'achievement', name: 'Достижение', description: 'Стремление к успеху' },
    { key: 'power', name: 'Власть', description: 'Влияние, контроль' },
    { key: 'affiliation', name: 'Принадлежность', description: 'Социальные связи' },
    { key: 'autonomy', name: 'Автономность', description: 'Независимость' },
    { key: 'security', name: 'Безопасность', description: 'Стабильность' },
    { key: 'growth', name: 'Рост', description: 'Развитие, обучение' }
  ];
  return <div className="space-y-4">{scales.map(s => details[s.key] ? <ComparisonCard key={s.key} name={s.name} description={s.description} {...details[s.key]} /> : null)}</div>;
};
// #endregion

interface CompatibilityDetailsDialogProps {
  candidate: TalentMarketCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export const CompatibilityDetailsDialog = ({ candidate, isOpen, onClose }: CompatibilityDetailsDialogProps) => {
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
          <DialogTitle>Детализация совместимости: {scoredCandidate.full_name}</DialogTitle>
          <DialogDescription>Сравнение психометрических профилей кандидата и идеального профиля вакансии</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <Card className="p-4 text-center"><p className="text-sm text-muted-foreground mb-1">Профессиональная</p><p className="text-2xl font-bold">{scoredCandidate.professional_compatibility}%</p><p className="text-xs text-muted-foreground mt-1">Вес: 40%</p></Card>
          <Card className="p-4 text-center"><p className="text-sm text-muted-foreground mb-1">Личностная</p><p className="text-2xl font-bold">{scoredCandidate.personal_compatibility}%</p><p className="text-xs text-muted-foreground mt-1">Вес: 60%</p></Card>
          <Card className="p-4 text-center bg-primary/5"><p className="text-sm text-muted-foreground mb-1">Общая</p><p className="text-3xl font-bold text-primary">{scoredCandidate.overall_compatibility}%</p></Card>
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
              <TabsContent value="bigFive"><BigFiveComparison details={(scoredCandidate.compatibility_details as unknown as { bigFive: Record<string, ScaleComparison> }).bigFive} /></TabsContent>
              <TabsContent value="mbti"><MBTIComparison details={(scoredCandidate.compatibility_details as unknown as { mbti: { ideal: string; candidate: string; match: number } }).mbti} /></TabsContent>
              <TabsContent value="disc"><DISCComparison details={(scoredCandidate.compatibility_details as unknown as { disc: Record<string, ScaleComparison> }).disc} /></TabsContent>
              <TabsContent value="eq"><EQComparison details={(scoredCandidate.compatibility_details as unknown as { eq: Record<string, ScaleComparison> }).eq} /></TabsContent>
              <TabsContent value="softSkills"><SoftSkillsComparison details={(scoredCandidate.compatibility_details as unknown as { softSkills: Record<string, ScaleComparison> }).softSkills} /></TabsContent>
              <TabsContent value="motivation"><MotivationComparison details={(scoredCandidate.compatibility_details as unknown as { motivation: Record<string, ScaleComparison> }).motivation} /></TabsContent>
            </div>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
