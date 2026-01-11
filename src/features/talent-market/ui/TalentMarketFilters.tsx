import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/lib/supabase";
import { AlertCircle, X, Search, Briefcase, Tag, SlidersHorizontal } from "lucide-react";
import { SkillsMultiSelect } from "./SkillsMultiSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HelpCircle } from "@/shared/ui/HelpCircle";

export interface MarketFilters {
  vacancyId: string | null;
  categoryId: string | null;
  skills: string[];
  minTestsCompleted: number;
  sortBy: 'compatibility' | 'date' | 'tests';
}

interface TalentMarketFiltersProps {
  onFilterChange: (filters: MarketFilters) => void;
}

export const TalentMarketFilters = ({ onFilterChange }: TalentMarketFiltersProps) => {
  const { t, i18n } = useTranslation('talent-market');
  const lang = i18n.language as 'ru' | 'kk' | 'en';
  const [filters, setFilters] = useState<MarketFilters>({
    vacancyId: null,
    categoryId: null,
    skills: [],
    minTestsCompleted: 0,
    sortBy: 'compatibility'
  });

  const { data: vacancies } = useQuery({
    queryKey: ['vacancies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vacancies')
        .select('id, title')
        .eq('status', 'active')
        .not('ideal_profile', 'is', null)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_categories')
        .select('id, name_ru, name_kk, name_en')
        .order('sort_order');
      return data;
    }
  });

  const handleFilterChange = (key: keyof MarketFilters, value: string | string[] | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: MarketFilters = {
      vacancyId: null,
      categoryId: null,
      skills: [],
      minTestsCompleted: 0,
      sortBy: 'compatibility'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card className="p-6 border shadow-md bg-card/50 backdrop-blur-sm rounded-2xl space-y-6">
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 ml-0.5 opacity-80">
              <Briefcase className="w-3 h-3" />
              {t('filters.vacancy')}
            </Label>
            <HelpCircle topicId="market_filter_vacancy" iconClassName="h-3.5 w-3.5 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <Select
            value={filters.vacancyId || ''}
            onValueChange={(value) => handleFilterChange('vacancyId', value)}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background border-muted-foreground/20 focus:ring-primary/20 transition-all text-sm">
              <SelectValue placeholder={t('filters.vacancyPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-primary/10 shadow-xl">
              {vacancies?.map((vacancy) => (
                <SelectItem key={vacancy.id} value={vacancy.id} className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">
                  {vacancy.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 ml-0.5 opacity-80">
              <Tag className="w-3 h-3" />
              {t('filters.category')}
            </Label>
            <HelpCircle topicId="market_filter_category" iconClassName="h-3.5 w-3.5 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? null : value)}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background border-muted-foreground/20 focus:ring-primary/20 transition-all text-sm">
              <SelectValue placeholder={t('filters.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-primary/10 shadow-xl">
              <SelectItem value="all" className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">{t('filters.categoryPlaceholder')}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id} className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">
                  {category[`name_${lang}`]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 ml-0.5 opacity-80">
              <Search className="w-3 h-3" />
              {t('filters.skills')}
            </Label>
            <HelpCircle topicId="market_filter_skills" iconClassName="h-3.5 w-3.5 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <SkillsMultiSelect
            selectedSkills={filters.skills}
            onChange={(skills) => handleFilterChange('skills', skills)}
          />
        </div>

        {/* Row 2 */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 ml-0.5 opacity-80">
            <SlidersHorizontal className="w-3 h-3" />
            {t('filters.minTests')}: {filters.minTestsCompleted}/6
          </Label>
          <div className="px-1 h-10 flex items-center">
            <Slider
              value={[filters.minTestsCompleted]}
              onValueChange={([value]) => handleFilterChange('minTestsCompleted', value)}
              min={0}
              max={6}
              step={1}
              className={cn(
                "w-full [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md",
                filters.minTestsCompleted > 0 ? "text-primary" : "text-muted"
              )}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1.5 ml-0.5 opacity-80">
            <SlidersHorizontal className="w-3 h-3 rotate-90" />
            {t('filters.sortBy')}
          </Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: 'compatibility' | 'date' | 'tests') => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background border-muted-foreground/20 focus:ring-primary/20 transition-all text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-primary/10 shadow-xl">
              <SelectItem value="compatibility" className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">{t('filters.sortByCompatibility')}</SelectItem>
              <SelectItem value="date" className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">{t('filters.sortByDate')}</SelectItem>
              <SelectItem value="tests" className="py-2.5 rounded-md focus:bg-primary/5 cursor-pointer text-sm">{t('filters.sortByTests')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end pb-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleResetFilters} 
            className="h-10 w-full rounded-lg hover:bg-destructive/5 hover:text-destructive transition-all group font-medium text-xs text-muted-foreground border border-dashed border-muted-foreground/20 hover:border-destructive/30"
          >
            <X className="mr-1.5 h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
            {t('filters.reset')}
          </Button>
        </div>
      </div>
      
      {!filters.vacancyId && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-500">
          <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-primary">{t('noVacancyAlert.title')}</p>
            <p className="text-[11px] text-primary/80 leading-relaxed">
              {t('noVacancyAlert.description')}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
