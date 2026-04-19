import { useQuery } from '@tanstack/react-query';
import JobCard from '../components/JobCard';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { getSavedJobs } from '../services/jobsApi';

export default function SavedJobsPage() {
  const query = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: getSavedJobs,
  });

  if (query.isLoading) {
    return <Skeleton className="h-[520px] rounded-md" />;
  }

  const jobs = query.data?.jobs || [];

  if (!jobs.length) {
    return (
      <EmptyState
        description="Save jobs from search results to build your shortlist."
        title="No saved jobs yet"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Saved jobs</h1>
        <p className="mt-2 text-text-secondary">
          Your shortlist stays here, sorted by the newest jobs you bookmarked.
        </p>
      </div>
      {jobs.map((job) => (
        <JobCard job={job} key={job._id} />
      ))}
    </div>
  );
}
