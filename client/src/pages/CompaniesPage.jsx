import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import { Card, CardBody } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Field';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import { firstInitialFromName } from '../lib/utils';
import { getCompanies } from '../services/companiesApi';

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = {
    q: searchParams.get('q') || '',
    industry: searchParams.get('industry') || '',
    location: searchParams.get('location') || '',
    size: searchParams.get('size') || '',
    page: Number(searchParams.get('page') || 1),
    limit: 12,
  };

  const query = useQuery({
    queryKey: ['companies', params],
    queryFn: () => getCompanies(params),
  });

  function update(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-text-primary">
          Explore companies
        </h1>
        <p className="text-text-secondary">
          Browse the employers actively hiring students across software, climate
          tech, design, operations, and more.
        </p>
      </div>

      <Card>
        <CardBody className="grid gap-3 md:grid-cols-4">
          <Input
            onChange={(event) => update('q', event.target.value)}
            placeholder="Search company"
            value={params.q}
          />
          <Input
            onChange={(event) => update('industry', event.target.value)}
            placeholder="Industry"
            value={params.industry}
          />
          <Input
            onChange={(event) => update('location', event.target.value)}
            placeholder="Location"
            value={params.location}
          />
          <Select
            onChange={(event) => update('size', event.target.value)}
            value={params.size}
          >
            <option value="">All sizes</option>
            <option value="11-50 employees">11-50 employees</option>
            <option value="51-200 employees">51-200 employees</option>
            <option value="201-500 employees">201-500 employees</option>
            <option value="501-1000 employees">501-1000 employees</option>
          </Select>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {query.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-md" />
            ))
          : (query.data?.companies || []).map((company) => (
              <Link key={company.slug} to={`/companies/${company.slug}`}>
                <Card className="h-full transition hover:border-accent-primary/50">
                  <CardBody className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-14 w-14 shrink-0 rounded-md after:rounded-md"
                        name={firstInitialFromName(company.name, 'C')}
                      />
                      <div>
                        <h2 className="font-semibold text-text-primary">
                          {company.name}
                        </h2>
                        <p className="text-sm text-text-muted">
                          {company.industry}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {company.about}
                    </p>
                    <div className="flex items-center justify-between text-sm text-text-muted">
                      <span>{company.headquarters}</span>
                      <span>{company.openRoleCount} open roles</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
      </div>

      <Pagination
        onPageChange={(page) => update('page', String(page))}
        page={params.page}
        totalPages={Math.max(
          1,
          Math.ceil((query.data?.total || 0) / (query.data?.pageSize || 12))
        )}
      />
    </div>
  );
}
