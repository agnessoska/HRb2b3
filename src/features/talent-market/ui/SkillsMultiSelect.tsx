import { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

type Skill = {
  canonical_name: string;
  name: string;
  category: string;
};

interface SkillsMultiSelectProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export const SkillsMultiSelect = ({ selectedSkills, onChange }: SkillsMultiSelectProps) => {
  const { t, i18n } = useTranslation(['talent-market', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Получаем текущий язык интерфейса
  const currentLanguage = i18n.language as 'ru' | 'en' | 'kk';

  // Оптимизированный запрос с сохранением предыдущих данных
  const { data: skillSuggestions = [], isLoading, isFetching } = useQuery({
    queryKey: ['skills-search', debouncedSearch, currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_skills', {
        search_query: debouncedSearch,
        result_limit: 40,
        user_language: currentLanguage, // Передаем язык в RPC
      });
      if (error) throw error;
      return (data as Skill[]) || [];
    },
    staleTime: 60000, // Кешируем на 1 минуту
    gcTime: 300000, // Храним в кеше 5 минут
    placeholderData: (previousData) => previousData, // КЛЮЧЕВОЕ: сохраняем старые данные пока загружаются новые
  });

  // Вычисляем состояние отображения
  const displayState = useMemo(() => {
    // Первая загрузка (нет данных вообще)
    if (isLoading && skillSuggestions.length === 0) return 'loading';
    
    // Есть поисковый запрос, но ничего не найдено
    if (skillSuggestions.length === 0 && debouncedSearch.trim()) return 'empty_search';
    
    // Нет поискового запроса и нет данных (не должно произойти с нашей RPC)
    if (skillSuggestions.length === 0) return 'empty';
    
    // Всё ОК - показываем данные
    return 'success';
  }, [isLoading, skillSuggestions.length, debouncedSearch]);

  const handleToggleSkill = (canonicalName: string) => {
    onChange(
      selectedSkills.includes(canonicalName)
        ? selectedSkills.filter(s => s !== canonicalName)
        : [...selectedSkills, canonicalName]
    );
  };

  const renderContent = () => {
    switch (displayState) {
      case 'loading':
        return (
          <div className="flex flex-wrap gap-2 p-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        );

      case 'empty_search':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('skillsSelect.noSkillsFound')}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              "{debouncedSearch}"
            </p>
          </div>
        );

      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('skillsSelect.noSkillsFound')}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-wrap gap-2 p-3 relative">
            {/* Индикатор фоновой загрузки */}
            {isFetching && (
              <div className="absolute top-1 right-1">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
            
            {skillSuggestions.map((skill) => {
              const isSelected = selectedSkills.includes(skill.canonical_name);
              return (
                <Badge
                  key={skill.canonical_name}
                  onClick={() => handleToggleSkill(skill.canonical_name)}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`
                    cursor-pointer transition-all duration-200 text-xs py-1.5 px-3
                    hover:scale-105 active:scale-95
                    ${isSelected ? 'shadow-sm' : 'hover:bg-accent'}
                  `}
                >
                  {skill.name}
                </Badge>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Триггер для добавления навыков - всегда с placeholder */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal h-10"
          >
            <span className="text-muted-foreground">
              {t('skillsSelect.placeholder')}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
        >
          <div className="flex flex-col h-[300px] md:h-[400px]">
            {/* Search Input */}
            <div className="p-3 border-b bg-muted/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('skillsSelect.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Skills Content */}
            <ScrollArea className="flex-1">
              {renderContent()}
            </ScrollArea>

            {/* Footer */}
            {selectedSkills.length > 0 && (
              <div className="p-3 border-t bg-muted/30 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {t('skillsSelect.selected', { count: selectedSkills.length })}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onChange([])} 
                  className="text-xs h-8 hover:text-destructive"
                >
                  {t('common:clearAll')}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Список выбранных навыков под кнопкой */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/30">
          {selectedSkills.map(skill => (
            <Badge
              key={skill}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => handleToggleSkill(skill)}
            >
              {skill}
              <X className="h-3 w-3 ml-1.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
