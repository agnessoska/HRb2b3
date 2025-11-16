import type { Database } from '@/shared/types/database';

type ProfessionalCategory =
  Database['public']['Tables']['professional_categories']['Row'];
type Candidate = Database['public']['Tables']['candidates']['Row'] & {
  category: ProfessionalCategory | null;
};
export type Application =
  Database['public']['Tables']['applications']['Row'] & {
    candidate: Candidate;
  };
