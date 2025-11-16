import type { Database } from '@/shared/types/database';

type ProfessionalCategory =
  Database['public']['Tables']['professional_categories']['Row'];

type Candidate = Database['public']['Tables']['candidates']['Row'] & {
  category: ProfessionalCategory | null;
};

type HrSpecialist = Database['public']['Tables']['hr_specialists']['Row'];

export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'] & {
  candidate: Candidate;
  hr_specialist: HrSpecialist;
};

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
