import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CompatibilityDetailsDialog } from "./CompatibilityDetailsDialog";

import type { TalentMarketCandidate } from "../types";

interface TalentCardProps {
  candidate: TalentMarketCandidate;
  isAcquired: boolean;
  onAcquire: () => void;
}

export const TalentCard = ({ candidate, isAcquired, onAcquire }: TalentCardProps) => {
  const { t, i18n } = useTranslation('talent-market');
  const lang = i18n.language as 'ru' | 'kk' | 'en';
  const [showDetails, setShowDetails] = useState(false);

  const getTestsStatus = () => {
    if (candidate.tests_completed === 0) return { badge: 'default', label: t('card.noTests') };
    
    const daysPassed = differenceInDays(new Date(), new Date(candidate.tests_last_updated_at!));
    const monthsPassed = daysPassed / 30;
    
    if (monthsPassed < 1) return { badge: 'success', label: t('card.statusCurrent') };
    if (monthsPassed < 2) return { badge: 'warning', label: t('card.statusExpiring') };
    return { badge: 'destructive', label: t('card.statusExpired') };
  };

  const testsStatus = getTestsStatus();

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-blue-500';
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{candidate.full_name}</CardTitle>
              <CardDescription>{(candidate.category as { [key: string]: string })?.[`name_${lang}`]}</CardDescription>
            </div>
            <Badge variant={testsStatus.badge as "default" | "destructive" | "outline" | "secondary" | "success" | "warning"}>
              {candidate.tests_completed}/6
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-4">
          {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">{t('card.skills')}:</p>
              <div className="flex flex-wrap gap-1">
                {(candidate.skills as { canonical_skill: string }[]).slice(0, 5).map((skill) => (
                  <Badge key={skill.canonical_skill} variant="secondary" className="text-xs">
                    {skill.canonical_skill}
                  </Badge>
                ))}
                {candidate.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{(candidate.skills as { canonical_skill: string }[]).length - 5}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {'professional_compatibility' in candidate && candidate.professional_compatibility !== null && (
            <div className="space-y-3">
              <Separator />
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('card.profCompatibility')} (40%)</span>
                  <span className="font-medium">{candidate.professional_compatibility}%</span>
                </div>
                <Progress value={candidate.professional_compatibility} className="h-1.5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('card.persCompatibility')} (60%)</span>
                  <span className="font-medium">{candidate.personal_compatibility}%</span>
                </div>
                <Progress value={candidate.personal_compatibility} className="h-1.5" />
              </div>
              
              <Separator />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">{t('card.overallCompatibility')}</p>
                <p className={cn(
                  "text-4xl font-bold",
                  getCompatibilityColor(candidate.overall_compatibility || 0)
                )}>
                  {candidate.overall_compatibility}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            {t('card.details')}
          </Button>
          
          {!isAcquired ? (
            <Button className="flex-1" onClick={onAcquire}>
              {t('card.acquire')}
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" disabled>
              <Check className="h-4 w-4 mr-2" />
              {t('card.acquired')}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {showDetails && (
        <CompatibilityDetailsDialog
          candidate={candidate}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};
