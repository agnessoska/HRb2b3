import { VacancyFunnel } from '@/features/vacancy-management/ui/funnel';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VacancyFunnelPage = () => {
  const { t } = useTranslation('vacancies');
  const { id } = useParams();

  if (!id) {
    return <div>{t('funnel.vacancyIdNotFound')}</div>;
  }

  return <VacancyFunnel vacancyId={id} />;
};

export default VacancyFunnelPage;
