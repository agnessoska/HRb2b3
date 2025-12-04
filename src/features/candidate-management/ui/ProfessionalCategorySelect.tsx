import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";

interface ProfessionalCategorySelectProps {
  value?: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const ProfessionalCategorySelect = ({ value, onValueChange, disabled }: ProfessionalCategorySelectProps) => {
  const { i18n, t } = useTranslation('common');
  const lang = i18n.language as 'ru' | 'kk' | 'en';

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

  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={t('selectCategory', 'Выберите категорию')} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {categories?.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category[`name_${lang}`] || category.name_en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
