import { supabase } from '@/shared/lib/supabase';

export const searchCandidatesNotInFunnel = async (
  vacancyId: string,
  organizationId: string,
  query: string = '',
  pageParam: number = 0,
  pageSize: number = 20
) => {
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('vacancy_id', vacancyId);

  if (applicationsError) throw applicationsError;

  const candidateIdsInFunnel = applications.map(app => app.candidate_id);

  let rpcQuery = supabase.rpc('get_organization_candidates', {
    p_organization_id: organizationId,
  });

  if (query) {
    rpcQuery = rpcQuery.ilike('full_name', `%${query}%`);
  }

  if (candidateIdsInFunnel.length > 0) {
    rpcQuery = rpcQuery.not('id', 'in', `(${candidateIdsInFunnel.join(',')})`);
  }

  const { data, error } = await rpcQuery
    .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

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
