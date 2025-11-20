import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { SkillsMultiSelect } from "./SkillsMultiSelect";
import { Button } from "@/components/ui/button";

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
    <Card className="p-6">
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8">
          <X className="mr-2 h-4 w-4" />
          {t('filters.reset')}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>{t('filters.vacancy')}</Label>
          <Select
            value={filters.vacancyId || ''}
            onValueChange={(value) => handleFilterChange('vacancyId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.vacancyPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {vacancies?.map((vacancy) => (
                <SelectItem key={vacancy.id} value={vacancy.id}>
                  {vacancy.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t('filters.category')}</Label>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.categoryPlaceholder')}</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category[`name_${lang}`]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t('filters.skills')}</Label>
          <SkillsMultiSelect
            selectedSkills={filters.skills}
            onChange={(skills) => handleFilterChange('skills', skills)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('filters.minTests')}: {filters.minTestsCompleted}/6</Label>
          <Slider
            value={[filters.minTestsCompleted]}
            onValueChange={([value]) => handleFilterChange('minTestsCompleted', value)}
            min={0}
            max={6}
            step={1}
            className="pt-2"
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t('filters.sortBy')}</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: 'compatibility' | 'date' | 'tests') => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compatibility">{t('filters.sortByCompatibility')}</SelectItem>
              <SelectItem value="date">{t('filters.sortByDate')}</SelectItem>
              <SelectItem value="tests">{t('filters.sortByTests')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!filters.vacancyId && (
        <Alert className="mt-4" variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('noVacancyAlert.title')}</AlertTitle>
          <AlertDescription>
            {t('noVacancyAlert.description')}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};
