import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '@/components';
import { Button, Card, CardContent } from '@/components/ui';

import LendingDetailCard from '../components/LendingDetailCard';
import { useDeleteLending, useLendingDetail, useReturnLending } from '../queries/useLendingQueries';

export default function LendingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const lendingId = Number(id);
  const isValidId = Number.isFinite(lendingId);

  const { data: lending, isLoading, isError } = useLendingDetail(lendingId, isValidId);
  const deleteLending = useDeleteLending();
  const returnLending = useReturnLending();

  const handleDelete = async () => {
    if (!lending) {
      return;
    }
    const confirmed = window.confirm(`Delete lending #${lending.id}?`);
    if (!confirmed) {
      return;
    }
    await deleteLending.mutateAsync(lending.id);
    navigate('/lending');
  };

  const handleReturn = async () => {
    if (!lending || lending.status === 'returned') {
      return;
    }
    const confirmed = window.confirm(`Mark lending #${lending.id} as returned?`);
    if (!confirmed) {
      return;
    }
    await returnLending.mutateAsync({ id: lending.id });
  };

  if (!isValidId) {
    return (
      <Card>
        <CardContent>Invalid lending ID.</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>Loading lending details...</CardContent>
      </Card>
    );
  }

  if (isError || !lending) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <p className="text-sm text-error">Unable to load lending details.</p>
          <Button variant="outline" onClick={() => navigate('/lending')}>
            Back to Lending
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Lending Details" subtitle="View and manage a single lending transaction" />
      <LendingDetailCard
        lending={lending}
        onBack={() => navigate('/lending')}
        onEdit={() => navigate(`/lending/${lending.id}/edit`)}
        onDelete={handleDelete}
        onReturn={handleReturn}
        deleting={deleteLending.isPending}
        returning={returnLending.isPending}
      />
    </div>
  );
}

