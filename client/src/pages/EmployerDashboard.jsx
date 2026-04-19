import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Field';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { updateApplicationStatus } from '../services/applicationsApi';
import { updateCompany } from '../services/companiesApi';
import { getEmployerJobsWithApplicants } from '../services/jobsApi';

const tabOptions = [
  { label: 'Jobs', value: 'jobs' },
  { label: 'Applicants', value: 'applicants' },
  { label: 'Company profile', value: 'company' },
  { label: 'Analytics', value: 'analytics' },
];

export default function EmployerDashboard() {
  const queryClient = useQueryClient();
  const { profileMeta } = useAuth();
  const [tab, setTab] = useState('jobs');
  const query = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: getEmployerJobsWithApplicants,
  });
  const [companyForm, setCompanyForm] = useState(profileMeta?.company || null);

  useEffect(() => {
    if (profileMeta?.company) {
      setCompanyForm(profileMeta.company);
    }
  }, [profileMeta?.company]);

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }) =>
      updateApplicationStatus(applicationId, { status }),
    onSuccess: () => {
      toast.success('Application status updated.');
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard'] });
    },
  });

  const companyMutation = useMutation({
    mutationFn: (payload) => updateCompany(profileMeta.company.slug, payload),
    onSuccess: () => {
      toast.success('Company profile updated.');
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard'] });
    },
  });

  const jobs = query.data?.jobs || [];
  const applicants = jobs.flatMap((job) =>
    job.applicants.map((applicant) => ({ ...applicant, job }))
  );

  const stats = useMemo(() => {
    const activeJobs = jobs.length;
    const totalApplicants = applicants.length;
    const interviewPipeline = applicants.filter(
      (application) => application.status === 'interview'
    ).length;
    const offersExtended = applicants.filter(
      (application) => application.status === 'offer'
    ).length;
    return { activeJobs, totalApplicants, interviewPipeline, offersExtended };
  }, [jobs, applicants]);

  const chartData = jobs.map((job) => ({
    name: job.title.split(' ').slice(0, 2).join(' '),
    views: job.viewCount,
    applicants: job.applicantCount,
  }));

  if (query.isLoading) {
    return <Skeleton className="h-[720px] rounded-md" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Active jobs', stats.activeJobs],
          ['Applicants this week', stats.totalApplicants],
          ['Interview pipeline', stats.interviewPipeline],
          ['Offers extended', stats.offersExtended],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-sm text-text-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-text-primary">
                {value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Tabs onChange={setTab} tabs={tabOptions} value={tab} />

      {tab === 'jobs' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/employer/jobs/new">Post a job</Link>
            </Button>
          </div>
          {jobs.map((job) => (
            <Card key={job._id}>
              <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {job.title}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    {job.location} · {job.workTerm} · {job.workMode}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    {job.applicantCount} applicants · {job.viewCount} views
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/jobs/${job._id}`}>View posting</Link>
                  </Button>
                  <Button size="sm" variant="ghost">
                    Close role
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === 'applicants' ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Applicants
            </h2>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted">
                <tr>
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Program</th>
                  <th className="pb-3">Applied for</th>
                  <th className="pb-3">Applied</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((application) => (
                  <tr
                    className="border-t border-border-subtle"
                    key={application._id}
                  >
                    <td className="py-3 text-text-primary">
                      {application.student?.name}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {application.profile?.education?.[0]?.program ||
                        'Student profile'}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {application.job.title}
                    </td>
                    <td className="py-3 text-text-secondary">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <select
                        className="rounded-sm border border-border-subtle bg-bg-elevated px-3 py-2"
                        onChange={(event) =>
                          statusMutation.mutate({
                            applicationId: application._id,
                            status: event.target.value,
                          })
                        }
                        value={application.status}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="in_review">In Review</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/employer/applicants/${application._id}`}>
                            View profile
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <a
                            href={`http://localhost:5001${application.resumeUrl}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Resume
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'company' ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Company profile
            </h2>
          </CardHeader>
          <CardBody className="grid gap-4">
            {!companyForm ? (
              <p className="text-sm text-text-muted">
                Company profile is loading.
              </p>
            ) : (
              <>
                <Input
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  value={companyForm?.name || ''}
                />
                <Input
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      headquarters: event.target.value,
                    }))
                  }
                  value={companyForm?.headquarters || ''}
                />
                <Textarea
                  onChange={(event) =>
                    setCompanyForm((current) => ({
                      ...current,
                      about: event.target.value,
                    }))
                  }
                  value={companyForm?.about || ''}
                />
                <Button
                  disabled={companyMutation.isPending}
                  onClick={() => companyMutation.mutate(companyForm)}
                >
                  Save company profile
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'analytics' ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-text-primary">
              Analytics
            </h2>
          </CardHeader>
          <CardBody className="h-96">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="views"
                  fill="var(--accent-primary)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="applicants"
                  fill="#22C55E"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
