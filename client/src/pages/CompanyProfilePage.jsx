import { useQuery } from '@tanstack/react-query';
import { Globe, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { Card, CardBody } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tabs from '../components/ui/Tabs';
import Tag from '../components/ui/Tag';
import { getCompanyBySlug } from '../services/companiesApi';

export default function CompanyProfilePage() {
  const { slug } = useParams();
  const [tab, setTab] = useState('overview');
  const query = useQuery({
    queryKey: ['company', slug],
    queryFn: () => getCompanyBySlug(slug),
  });

  if (query.isLoading) {
    return <Skeleton className="h-[640px] rounded-md" />;
  }

  const company = query.data?.company;
  const jobs = query.data?.jobs || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                alt={company.name}
                className="h-20 w-20 rounded-2xl border border-border-subtle bg-bg-elevated object-cover"
                src={company.logoUrl}
              />
              <div>
                <h1 className="text-3xl font-semibold text-text-primary">
                  {company.name}
                </h1>
                <p className="mt-2 text-text-secondary">
                  {company.industry} · {company.headcountRange}
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {company.headquarters}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {company.website}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-text-muted">{jobs.length} active jobs</p>
          </div>
        </CardBody>
      </Card>

      <Tabs
        onChange={setTab}
        tabs={[
          { label: 'Overview', value: 'overview' },
          { label: 'Jobs', value: 'jobs' },
          { label: 'About', value: 'about' },
        ]}
        value={tab}
      />

      {tab === 'overview' ? (
        <Card>
          <CardBody className="space-y-5">
            <p className="text-text-secondary">{company.about}</p>
            <div className="flex flex-wrap gap-2">
              {company.specialties.map((specialty) => (
                <Tag key={specialty}>{specialty}</Tag>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {company.cultureTags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {tab === 'jobs' ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard job={{ ...job, company }} key={job._id} />
          ))}
        </div>
      ) : null}

      {tab === 'about' ? (
        <Card>
          <CardBody className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Founded</p>
              <p className="mt-1 text-sm text-text-secondary">
                {company.foundedYear}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Headquarters
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {company.headquarters}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-text-primary">About</p>
              <p className="mt-1 text-sm text-text-secondary">
                {company.about}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
