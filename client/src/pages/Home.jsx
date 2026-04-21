import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Search,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tag from '../components/ui/Tag';
import { firstInitialFromName } from '../lib/utils';
import { getCompanies } from '../services/companiesApi';
import { getJobSearch } from '../services/jobsApi';
import { getHomeStats } from '../services/statsApi';

const popularSearches = [
  'Software Engineer',
  'Data Analyst',
  'UX Designer',
  'Remote',
  'Vancouver',
];

export default function Home() {
  const navigate = useNavigate();
  const jobsQuery = useQuery({
    queryKey: ['home-jobs'],
    queryFn: () => getJobSearch({ limit: 8, sort: 'relevance' }),
  });
  const companiesQuery = useQuery({
    queryKey: ['home-companies'],
    queryFn: () => getCompanies({ limit: 12 }),
  });
  const statsQuery = useQuery({
    queryKey: ['home-stats'],
    queryFn: getHomeStats,
  });

  const featuredJobs = (jobsQuery.data?.jobs || []).slice(0, 8);
  const stats = {
    jobs: statsQuery.data?.openJobs || 0,
    companies: statsQuery.data?.hiringCompanies || 0,
    universities: statsQuery.data?.universityPartners || 0,
    students: statsQuery.data?.students || 0,
  };

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <Badge>
            Co-op discovery, built for Canadian campuses
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
              Find your next co-op. In one place.
            </h1>
            <p className="max-w-2xl text-lg text-text-secondary">
              Discover work-integrated opportunities from real employers,
              matched to your school access and interests, all in one polished
              job search experience.
            </p>
          </div>

          <form
            className="grid gap-3 rounded-md border border-border-subtle bg-bg-surface p-3 shadow-card md:grid-cols-[1fr_240px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const q = formData.get('q');
              const location = formData.get('location');
              navigate(
                `/jobs?q=${encodeURIComponent(q || '')}&location=${encodeURIComponent(location || '')}`
              );
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="w-full rounded-sm border border-border-subtle bg-bg-elevated py-3 pl-10 pr-4"
                defaultValue=""
                name="q"
                placeholder="Job title, company, or skill"
              />
            </div>
            <input
              className="w-full rounded-sm border border-border-subtle bg-bg-elevated px-4 py-3"
              defaultValue=""
              name="location"
              placeholder="City or Remote"
            />
            <Button className="w-full">Search</Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-text-muted">Popular searches:</span>
            {popularSearches.map((search) => (
              <Tag key={search}>
                <Link to={`/jobs?q=${encodeURIComponent(search)}`}>
                  {search}
                </Link>
              </Tag>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardBody className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
                Live market snapshot
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {stats.jobs}
                  </p>
                  <p className="text-sm text-text-muted">Open co-ops</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {stats.companies}
                  </p>
                  <p className="text-sm text-text-muted">Hiring companies</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-text-primary">
                    {stats.universities}
                  </p>
                  <p className="text-sm text-text-muted">University partners</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  'Students',
                  'Search with saved jobs, recommendations, and a real application tracker.',
                ],
                [
                  'Employers',
                  'Post once, target the right campuses, and manage the full applicant pipeline.',
                ],
                [
                  'Universities',
                  'Track jobs aimed at your students and see platform activity in one dashboard.',
                ],
              ].map(([title, copy]) => (
                <div key={title}>
                  <p className="text-sm font-semibold text-text-primary">
                    {title}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">{copy}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-32 rounded-md" key={index} />
            ))
          : [
              [BriefcaseBusiness, stats.jobs, 'Open co-ops'],
              [Building2, stats.companies, 'Hiring companies'],
              [GraduationCap, stats.universities, 'University partners'],
              [Users, stats.students, 'Active students'],
            ].map(([Icon, value, label]) => (
              <Card key={label}>
                <CardBody className="flex items-start gap-4">
                  <div className="rounded-md bg-accent-primary/10 p-3 text-accent-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-text-primary">
                      {value}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">{label}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Featured Jobs</h2>
          <Link className="text-sm font-medium text-accent-primary" to="/jobs">
            View all jobs
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {jobsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-64 rounded-md" />
              ))
            : featuredJobs.map((job) => <JobCard compact job={job} key={job._id} />)}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="section-title">Top Companies Hiring</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {companiesQuery.isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-44 rounded-md" />
              ))
            : (companiesQuery.data?.companies || [])
                .slice(0, 12)
                .map((company) => (
                  <Link key={company.slug} to={`/companies/${company.slug}`}>
                    <Card className="h-full transition hover:border-accent-primary/40">
                      <CardBody className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="h-12 w-12 shrink-0 rounded-md after:rounded-md"
                            name={firstInitialFromName(company.name, 'C')}
                          />
                          <div>
                            <p className="font-semibold text-text-primary">
                              {company.name}
                            </p>
                            <p className="text-sm text-text-muted">
                              {company.industry}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {company.headquarters}
                        </p>
                        <p className="text-sm text-text-muted">
                          {company.openRoleCount} open roles
                        </p>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Engineering', 'React, backend, infra, and platform roles', 'React'],
          [
            'Data',
            'Analytics, BI, data science, and ML openings',
            'Data Analyst',
          ],
          ['Design', 'UX and UI roles across product teams', 'UX Designer'],
          [
            'Product',
            'PM, research, and operations partner roles',
            'Product Manager',
          ],
          ['Marketing', 'Growth, content, and lifecycle teams', 'Marketing'],
          ['Ops', 'Business operations and enablement tracks', 'Operations'],
          ['Finance', 'Financial analysis and reporting roles', 'Finance'],
          [
            'Sustainability',
            'Climate and cleantech opportunities',
            'Sustainability',
          ],
        ].map(([title, description, query]) => (
          <Link key={title} to={`/jobs?q=${encodeURIComponent(query)}`}>
            <Card className="h-full transition hover:border-accent-primary/40">
              <CardBody>
                <p className="font-semibold text-text-primary">{title}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {description}
                </p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [
            GraduationCap,
            'Students',
            'Build a profile, save jobs, and track every application stage in one place.',
          ],
          [
            BriefcaseBusiness,
            'Employers',
            'Target public, all-university, or selected-campus audiences without changing the core job flow.',
          ],
          [
            Building2,
            'Universities',
            'Monitor campus-relevant roles and student activity through a shared platform.',
          ],
        ].map(([Icon, title, description]) => (
          <Card key={title}>
            <CardBody className="space-y-4">
              <Icon className="h-8 w-8 text-accent-primary" />
              <div>
                <p className="font-semibold text-text-primary">{title}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {description}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>
    </div>
  );
}
