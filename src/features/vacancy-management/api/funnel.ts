import { supabase } from '@/shared/lib/supabase';

export const searchCandidatesNotInFunnel = async (
  vacancyId: string,
  organizationId: string,
  query: string
) => {
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('vacancy_id', vacancyId);

  if (applicationsError) throw applicationsError;

  const candidateIdsInFunnel = applications.map(app => app.candidate_id);

  const { data, error } = await supabase
    .from('candidates')
    .select('id, full_name')
    .ilike('full_name', `%${query}%`)
    .eq('invited_by_organization_id', organizationId)
    .not('id', 'in', `(${candidateIdsInFunnel.join(',')})`)
    .limit(10);

  if (error) throw error;
  return data;
};

export const addCandidateToFunnel = async (
  vacancyId: string,
  candidateId: string,
  hrId: string,
  organizationId: string
) => {
  const { data, error } = await supabase.from('applications').insert({
    vacancy_id: vacancyId,
    candidate_id: candidateId,
    added_by_hr_id: hrId,
    organization_id: organizationId,
    status: 'invited',
  });

  if (error) throw error;
  return data;
};
