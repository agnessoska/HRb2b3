import { supabase } from '@/shared/lib/supabase';

export const checkCandidateRelation = async (
  candidateId: string,
  organizationId: string
): Promise<boolean> => {
  console.log('Checking relation:', { candidateId, organizationId });

  // 1. Check if invited directly
  const { data: invitedData, error: invitedError } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', candidateId)
    .eq('invited_by_organization_id', organizationId)
    .maybeSingle();

  if (invitedError) {
    console.error('Error checking invited_by:', invitedError);
    // Don't throw, try next method
  }
  
  if (invitedData) {
    console.log('Relation found: invited directly');
    return true;
  }

  // 2. Check if added to applications
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('organization_id', organizationId)
    .limit(1)
    .maybeSingle();

  if (appError) {
    console.error('Error checking applications:', appError);
    throw appError;
  }
  
  if (appData) {
    console.log('Relation found: application exists');
    return true;
  }

  console.log('No relation found');
  return false;
};