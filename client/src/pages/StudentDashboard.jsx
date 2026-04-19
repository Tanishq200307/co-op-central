import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tag from '../components/ui/Tag';
import useLocalStorageState from '../hooks/useLocalStorageState';
import { useAuth } from '../context/AuthContext';
import { getMyApplications } from '../services/applicationsApi';
import { getRecommendedJobs } from '../services/jobsApi';

function getCompletionScore(profile) {
  const checkpoints = [
    Boolean(profile?.headline),
    Boolean(profile?.about),
    Boolean(profile?.skills?.length),
    Boolean(profile?.education?.length),
    Boolean(profile?.projects?.length),
    Boolean(
      profile?.links?.linkedin ||
      profile?.links?.github ||
      profile?.links?.portfolio
    ),
  ];

  return Math.round(
    (checkpoints.filter(Boolean).length / checkpoints.length) * 100
  );
}

export default function StudentDashboard() {
  const { user, profileMeta } = useAuth();
  const [recentSearches] = useLocalStorageState(
    'coopcentral-recent-searches',
    []
  );
  const [recentlyViewed] = useLocalStorageState(
    'coopcentral-recently-viewed',
    []
  );
  const recommendedQuery = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: getRecommendedJobs,
  });
  const applicationsQuery = useQuery({
    queryKey: ['applications'],
    queryFn: getMyApplications,
  });

  const profile = profileMeta?.studentProfile;
  const completionScore = getCompletionScore(profile);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                alt={user.name}
                className="h-16 w-16 rounded-full border border-border-subtle bg-bg-elevated object-cover"
                src={profile?.avatarUrl}
              />
              <div>
                <p className="font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-muted">{profile?.headline}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Profile completion</span>
                <span className="font-medium text-text-primary">
                  {completionScore}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-accent-primary"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Button asChild variant="secondary">
                <Link to="/profile">Edit profile</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/applications">View applications</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/saved">Saved jobs</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </aside>

      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
              Welcome back
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-text-primary">
                Recommended for you
              </h1>
              <p className="mt-2 text-text-secondary">
                Personalized from your profile, saved work preferences, and
                school access.
              </p>
            </div>
          </CardBody>
        </Card>

        <section className="space-y-4">
          {recommendedQuery.isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-md" />
              ))
            : recommendedQuery.data?.jobs?.map((job) => (
                <JobCard compact job={job} key={job._id} />
              ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Recent searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.length ? (
                  recentSearches.map((search) => (
                    <Tag key={search}>
                      <Link to={`/jobs?q=${encodeURIComponent(search)}`}>
                        {search}
                      </Link>
                    </Tag>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">
                    Your recent searches will appear here.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">
                Application activity
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {['submitted', 'in_review', 'interview'].map((status) => (
                  <div
                    className="rounded-md border border-border-subtle bg-bg-elevated p-4"
                    key={status}
                  >
                    <p className="text-sm uppercase tracking-[0.14em] text-text-muted">
                      {status.replace('_', ' ')}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text-primary">
                      {
                        (applicationsQuery.data?.applications || []).filter(
                          (application) => application.status === status
                        ).length
                      }
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Recently viewed
          </h2>
          <div className="space-y-4">
            {recentlyViewed.length ? (
              recentlyViewed.map((job) => (
                <JobCard compact job={job} key={job._id} />
              ))
            ) : (
              <Card>
                <CardBody>
                  <p className="text-sm text-text-muted">
                    Open a few job details and they will show up here for quick
                    return visits.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
