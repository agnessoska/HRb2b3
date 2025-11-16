import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { getTests } from '@/features/testing-system/api/getTests';
import { TestCard } from '@/features/testing-system/ui/TestCard';
import { Skeleton } from '@/components/ui/skeleton';

const CandidateDashboardPage = () => {
  const { data: tests, isLoading, isError } = useQuery({
    queryKey: ['tests'],
    queryFn: getTests,
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Мои тесты</h1>
        
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-destructive">
            Произошла ошибка при загрузке тестов. Попробуйте обновить страницу.
          </div>
        )}

        {tests && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboardPage;
