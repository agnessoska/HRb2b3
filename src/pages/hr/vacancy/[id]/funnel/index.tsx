import { VacancyFunnel } from '@/features/vacancy-management/ui/funnel';
import { useParams } from 'react-router-dom';

const VacancyFunnelPage = () => {
  const { id } = useParams();

  if (!id) {
    return <div>Vacancy ID not found</div>;
  }

  return <VacancyFunnel vacancyId={id} />;
};

export default VacancyFunnelPage;
