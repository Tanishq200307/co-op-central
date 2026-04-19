import { useQuery } from '@tanstack/react-query';
import { Bookmark, CalendarRange, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ApplyDialog from '../components/ApplyDialog';
import JobCard from '../components/JobCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tag from '../components/ui/Tag';
import useLocalStorageState from '../hooks/useLocalStorageState';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyRange } from '../lib/utils';
import { getJobDetail } from '../services/jobsApi';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { user, profileMeta } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [didApply, setDidApply] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState(
    'coopcentral-recently-viewed',
    []
  );
  const query = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobDetail(jobId),
  });

  useEffect(() => {
    if (!query.data?.job) return;
    setRecentlyViewed((current) => {
      const next = [
        query.data.job,
        ...current.filter((entry) => entry._id !== query.data.job._id),
      ];
      return next.slice(0, 4);
    });
  }, [query.data?.job?._id]);

  const job = query.data?.job;
  const metaItems = useMemo(
    () =>
      job
        ? [
            ['Work mode', job.workMode],
            ['Employment type', job.employmentType],
            ['Duration', `${job.durationMonths} months`],
            ['Work term', job.workTerm],
            [
              'Start date',
              job.startDate
                ? format(new Date(job.startDate), 'MMM d, yyyy')
                : 'Flexible',
            ],
            [
              'Salary',
              formatCurrencyRange({
                min: job.salaryMin,
                max: job.salaryMax,
                currency: job.salaryCurrency,
                period: job.salaryPeriod,
              }),
            ],
          ]
        : [],
    [job]
  );

  if (query.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-[680px] rounded-md" />
        <Skeleton className="h-[360px] rounded-md" />
      </div>
    );
  }

  if (!job) return null;

  const currentApplicantCount = (job.applicantCount || 0) + (didApply ? 1 : 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <img
                  alt={job.company?.name}
                  className="h-16 w-16 rounded-md border border-border-subtle bg-bg-elevated object-cover"
                  src={job.company?.logoUrl}
                />
                <div>
                  <h1 className="text-3xl font-semibold text-text-primary">
                    {job.title}
                  </h1>
                  <p className="mt-2 text-text-secondary">
                    {job.company?.name} · {job.location}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {didApply ? (
                  <Button variant="secondary">Applied</Button>
                ) : (
                  <Button onClick={() => setApplyOpen(true)}>Apply</Button>
                )}
                <Button variant="secondary">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {metaItems.map(([label, value]) => (
                <Badge key={label} variant="outline">
                  {label}: {value}
                </Badge>
              ))}
            </div>

            <article className="prose prose-invert max-w-none whitespace-pre-line text-text-secondary">
              {job.description}
            </article>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-text-primary">
                Required skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-text-primary">
                Preferred skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsPreferred.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </section>

            {job.gpaRequirement ? (
              <Card className="border-accent-primary/20">
                <CardBody>
                  <p className="font-medium text-text-primary">
                    GPA requirement
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Students should be able to demonstrate a GPA of{' '}
                    {job.gpaRequirement.toFixed(1)} or higher.
                  </p>
                </CardBody>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary">
                  About the company
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    alt={job.company?.name}
                    className="h-14 w-14 rounded-md border border-border-subtle bg-bg-elevated object-cover"
                    src={job.company?.logoUrl}
                  />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {job.company?.name}
                    </p>
                    <p className="text-sm text-text-muted">
                      {job.company?.industry} · {job.company?.headcountRange}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  {job.company?.about}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(job.company?.specialties || []).map((specialty) => (
                    <Tag key={specialty}>{specialty}</Tag>
                  ))}
                </div>
                <Link
                  className="text-sm font-medium text-accent-primary"
                  to={`/companies/${job.company?.slug}`}
                >
                  View company profile
                </Link>
              </CardBody>
            </Card>
          </CardBody>
        </Card>

        <section className="space-y-4">
          <h2 className="section-title">Similar jobs</h2>
          <div className="space-y-4">
            {(query.data?.similarJobs || []).map((similarJob) => (
              <JobCard compact job={similarJob} key={similarJob._id} />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">Apply</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-text-secondary">
            {user?.role === 'student' ? (
              <>
                <p>
                  Apply with your existing resume or upload a fresh version for
                  this role.
                </p>
                {didApply ? (
                  <Button className="w-full" variant="secondary">
                    Applied
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setApplyOpen(true)}
                  >
                    Apply with resume
                  </Button>
                )}
              </>
            ) : user ? (
              <p>
                This role is viewable, but only student accounts can submit an
                application.
              </p>
            ) : (
              <div className="space-y-3">
                <p>
                  Create an account to save this job and apply in a few clicks.
                </p>
                <Button asChild className="w-full">
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              At a glance
            </h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-center justify-between">
              <span>Applicants</span>
              <span>{currentApplicantCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Views</span>
              <span>{job.viewCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Posted</span>
              <span>{format(new Date(job.postedAt), 'MMM d')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Deadline</span>
              <span>
                {job.expiresAt
                  ? format(new Date(job.expiresAt), 'MMM d')
                  : 'Open until filled'}
              </span>
            </div>
            <Button variant="secondary">
              <CalendarRange className="h-4 w-4" />
              Track application dates
            </Button>
            <Button variant="ghost">
              <Share2 className="h-4 w-4" />
              Share job
            </Button>
          </CardBody>
        </Card>
      </aside>

      <ApplyDialog
        defaultResumeName={
          profileMeta?.studentProfile?.defaultResumeOriginalName
        }
        job={job}
        onClose={() => setApplyOpen(false)}
        onApplied={() => setDidApply(true)}
        open={applyOpen}
      />
    </div>
  );
}
