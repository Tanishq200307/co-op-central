import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import {
  getMyApplications,
  withdrawApplication,
} from '../services/applicationsApi';

const columns = [
  'submitted',
  'in_review',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['applications'],
    queryFn: getMyApplications,
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      toast.success('Application withdrawn.');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  if (query.isLoading) {
    return <Skeleton className="h-[520px] rounded-md" />;
  }

  const applications = query.data?.applications || [];
  const grouped = Object.fromEntries(
    columns.map((status) => [
      status,
      applications.filter((application) => application.status === status),
    ])
  );

  if (!applications.length) {
    return (
      <EmptyState
        actionLabel="Browse jobs"
        description="You have not applied to anything yet. Browse jobs and start building your pipeline."
        onAction={() => {
          window.location.href = '/jobs';
        }}
        title="No applications yet"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">
          Applications tracker
        </h1>
        <p className="mt-2 text-text-secondary">
          Track every application from submission through interview, offer, or
          final decision.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-6">
        {columns.map((status) => (
          <Card key={status}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-text-primary">
                  {status.replace('_', ' ')}
                </h2>
                <span className="text-xs text-text-muted">
                  {grouped[status].length}
                </span>
              </div>
              <div className="space-y-3">
                {grouped[status].map((application) => (
                  <div
                    className="rounded-md border border-border-subtle bg-bg-elevated p-3"
                    key={application._id}
                  >
                    <Link
                      className="font-medium text-text-primary"
                      to={`/jobs/${application.job?._id}`}
                    >
                      {application.job?.title}
                    </Link>
                    <p className="mt-1 text-sm text-text-secondary">
                      {application.job?.company?.name}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      Applied{' '}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {status !== 'withdrawn' &&
                    status !== 'offer' &&
                    status !== 'rejected' ? (
                      <Button
                        className="mt-3 w-full"
                        onClick={() => withdrawMutation.mutate(application._id)}
                        size="sm"
                        variant="ghost"
                      >
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
