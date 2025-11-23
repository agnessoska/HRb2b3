import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/shared/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { X, Check, Plus } from "lucide-react";
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
    setIsOpen(false);
  };

  const handleRemoveSkill = (canonicalName: string) => {
    onChange(selectedSkills.filter(s => s !== canonicalName));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
        {selectedSkills.map((skill) => (
          <Badge
            key={skill}
            variant="secondary"
            className="pl-3 pr-1.5 py-1 text-sm rounded-full bg-secondary/50 text-secondary-foreground border border-secondary hover:bg-secondary transition-colors flex items-center gap-1"
          >
            {skill}
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="ml-1 p-0.5 hover:bg-background/50 rounded-full text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('skillsSelect.placeholder')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-72" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={t('skillsSelect.searchPlaceholder')}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isLoading && <div className="py-6 text-center text-xs text-muted-foreground">{t('skillsSelect.searching')}</div>}
                
                {!isLoading && debouncedSearch.length < 2 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">{t('skillsSelect.minCharacters')}</div>
                )}

                {!isLoading && debouncedSearch.length >= 2 && skillSuggestions?.length === 0 && (
                  <CommandEmpty>{t('skillsSelect.noSkillsFound')}</CommandEmpty>
                )}

                <CommandGroup>
                  {skillSuggestions?.map((skill) => (
                    <CommandItem
                      key={skill.canonical_name}
                      value={skill.canonical_name}
                      onSelect={() => handleAddSkill(skill.canonical_name)}
                      disabled={selectedSkills.includes(skill.canonical_name)}
                      className={cn(
                        "cursor-pointer",
                        selectedSkills.includes(skill.canonical_name) && "opacity-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSkills.includes(skill.canonical_name) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {skill.display_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
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
