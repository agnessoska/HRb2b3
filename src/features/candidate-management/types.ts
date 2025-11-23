export interface TActiveApplication {
  id: string
  status: string
  vacancies: {
    title: string
    organizations: {
      name: string
    }
  }
}

export type TDashboardProfile = {
  id: string;
  full_name: string;
  is_public: boolean;
  tests_completed: number;
} | null;

export type TDashboardTest = {
  id: string;
  code: string;
  name_ru: string;
  name_en: string;
  name_kk: string;
  description_ru: string;
  description_en: string;
  description_kk: string;
  completed_at: string | null;
  is_completed: boolean;
  status: 'expired' | 'expiring' | 'actual' | 'not_started';
};

export type TDashboardApplication = {
  id: string;
  status: string;
  vacancy_title: string;
  organization_name: string;
};

export type TDashboardMessage = {
  id: string;
  message_text: string;
  sender_type: 'hr' | 'candidate';
  hr_specialist_name: string | null;
};

export type TDashboardData = {
  profile: TDashboardProfile;
  tests: TDashboardTest[] | null;
  applications: TDashboardApplication[] | null;
  messages: TDashboardMessage[] | null;
  error?: string;
};
