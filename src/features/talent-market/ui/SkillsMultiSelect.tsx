import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface SkillsMultiSelectProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export const SkillsMultiSelect = ({ selectedSkills, onChange }: SkillsMultiSelectProps) => {
  const { t } = useTranslation('talent-market');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: skillSuggestions, isLoading } = useQuery({
    queryKey: ['skills-search', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return [];
      
      const { data } = await supabase
        .from('skills_dictionary')
        .select('canonical_name, name')
        .or(`name.ilike.%${debouncedSearch}%,canonical_name.ilike.%${debouncedSearch}%`)
        .limit(10);
      
      const uniqueSkills = new Map();
      data?.forEach(skill => {
        if (!uniqueSkills.has(skill.canonical_name)) {
          uniqueSkills.set(skill.canonical_name, skill.name);
        }
      });
      
      return Array.from(uniqueSkills.entries()).map(([canonical, display]) => ({
        canonical_name: canonical,
        display_name: display
      }));
    },
    enabled: debouncedSearch.length >= 2,
  });

  const handleAddSkill = (canonicalName: string) => {
    if (!selectedSkills.includes(canonicalName)) {
      onChange([...selectedSkills, canonicalName]);
    }
    setSearchQuery('');
  };

  const handleRemoveSkill = (canonicalName: string) => {
    onChange(selectedSkills.filter(s => s !== canonicalName));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedSkills.length === 0 ? (
            <span className="text-muted-foreground">{t('skillsSelect.placeholder')}</span>
          ) : (
            <span>{selectedSkills.length} {t('skillsSelect.selected')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={t('skillsSelect.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {selectedSkills.length > 0 && (
          <div className="p-2 border-b">
            <div className="flex flex-wrap gap-1">
              {selectedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-60 overflow-auto p-2">
          {isLoading && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('skillsSelect.searching')}
            </div>
          )}

          {!isLoading && debouncedSearch.length < 2 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('skillsSelect.minCharacters')}
            </div>
          )}

          {!isLoading && debouncedSearch.length >= 2 && skillSuggestions?.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('skillsSelect.noSkillsFound')}
            </div>
          )}

          {skillSuggestions?.map((skill) => (
            <button
              key={skill.canonical_name}
              onClick={() => handleAddSkill(skill.canonical_name)}
              disabled={selectedSkills.includes(skill.canonical_name)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md hover:bg-accent",
                selectedSkills.includes(skill.canonical_name) && "opacity-50 cursor-not-allowed"
              )}
            >
              {skill.display_name}
              {selectedSkills.includes(skill.canonical_name) && (
                <Check className="h-4 w-4 inline ml-2" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
