import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tabs from '../components/ui/Tabs';
import { getUniversityDashboard } from '../services/universitiesApi';

export default function UniversityDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useQuery({
    queryKey: ['university-dashboard'],
    queryFn: getUniversityDashboard,
  });

  const tabOptions = [
    { label: 'Overview', value: 'overview' },
    { label: 'Jobs targeting us', value: 'jobs' },
    { label: 'Students', value: 'students' },
    { label: 'Settings', value: 'settings' },
  ];

  const requestedTab = searchParams.get('tab') || 'overview';
  const tab = tabOptions.some((option) => option.value === requestedTab)
    ? requestedTab
    : 'overview';

  function handleTabChange(nextTab) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextTab === 'overview') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', nextTab);
    }

    setSearchParams(nextParams, { replace: true });
  }

  if (query.isLoading) {
    return <Skeleton className="h-[720px] rounded-md" />;
  }

  const { university, jobs, stats, students } = query.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">
              {university.name}
            </h1>
            <p className="mt-2 text-text-secondary">
              {university.domain} · {university.email}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-text-secondary">
            <p>
              {stats.studentsRegistered} students registered with this domain
            </p>
            <p>
              {stats.jobsTargetingUniversity} jobs targeting this university
            </p>
          </div>
        </CardBody>
      </Card>

      <Tabs onChange={handleTabChange} tabs={tabOptions} value={tab} />

      {tab === 'overview' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardBody>
              <p className="text-sm text-text-muted">Students</p>
              <p className="mt-2 text-3xl font-semibold text-text-primary">
                {stats.studentsRegistered}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-text-muted">Jobs targeting us</p>
              <p className="mt-2 text-3xl font-semibold text-text-primary">
                {stats.jobsTargetingUniversity}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-text-muted">Recent activity</p>
              <p className="mt-2 text-3xl font-semibold text-text-primary">
                {Math.max(1, Math.floor(stats.jobsTargetingUniversity / 2))}
              </p>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'jobs' ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>
      ) : null}

      {tab === 'students' ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Students
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {students.map((student) => (
              <div
                className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-elevated px-4 py-3"
                key={student._id}
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {student.name}
                  </p>
                  <p className="text-sm text-text-secondary">{student.email}</p>
                </div>
                <p className="text-sm text-text-muted">
                  {student.profile?.headline || 'Profile coming together'}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'settings' ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Settings
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-text-secondary">
              University settings are seeded for the demo and can be extended
              with editable metadata, logo updates, and admin management.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
