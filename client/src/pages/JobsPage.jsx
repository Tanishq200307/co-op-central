import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import EmptyState from '../components/ui/EmptyState';
import { Card, CardBody } from '../components/ui/Card';
import { Checkbox, Input, Select } from '../components/ui/Field';
import Pagination from '../components/ui/Pagination';
import Skeleton from '../components/ui/Skeleton';
import useDebouncedValue from '../hooks/useDebouncedValue';
import useLocalStorageState from '../hooks/useLocalStorageState';
import { getJobSearch } from '../services/jobsApi';

function parseMulti(searchParams, key) {
  const value = searchParams.get(key);
  return value ? value.split(',').filter(Boolean) : [];
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentSearches, setRecentSearches] = useLocalStorageState(
    'coopcentral-recent-searches',
    []
  );
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const debouncedKeyword = useDebouncedValue(keyword, 300);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedKeyword) next.set('q', debouncedKeyword);
    else next.delete('q');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  }, [debouncedKeyword]);

  const queryParams = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      workMode: searchParams.get('workMode') || '',
      employmentType: searchParams.get('employmentType') || '',
      workTerm: searchParams.get('workTerm') || '',
      company: searchParams.get('company') || '',
      skills: searchParams.get('skills') || '',
      salaryMin: searchParams.get('salaryMin') || '',
      postedWithin: searchParams.get('postedWithin') || '',
      duration: searchParams.get('duration') || '',
      easyApply: searchParams.get('easyApply') || '',
      sort: searchParams.get('sort') || 'relevance',
      page: Number(searchParams.get('page') || 1),
      limit: 25,
    }),
    [searchParams]
  );

  const jobsQuery = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobSearch(queryParams),
  });

  useEffect(() => {
    if (queryParams.q && !recentSearches.includes(queryParams.q)) {
      setRecentSearches((current) => [queryParams.q, ...current].slice(0, 6));
    }
  }, [queryParams.q]);

  function updateSingle(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }

  function updateMulti(key, value) {
    const current = new Set(parseMulti(searchParams, key));
    if (current.has(value)) current.delete(value);
    else current.add(value);

    updateSingle(key, [...current].join(','));
  }

  const facets = jobsQuery.data?.facets || {};
  const totalPages = Math.max(
    1,
    Math.ceil((jobsQuery.data?.total || 0) / (jobsQuery.data?.pageSize || 25))
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-text-primary">
                Filters
              </h1>
              <button
                className="text-sm text-accent-primary"
                onClick={() => setSearchParams({ sort: 'relevance' })}
                type="button"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Keyword
              </label>
              <Input
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="React, analyst, UX"
                value={keyword}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Location
              </label>
              <Input
                onChange={(event) =>
                  updateSingle('location', event.target.value)
                }
                placeholder="Vancouver or Remote"
                value={queryParams.location}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Date posted
              </label>
              <Select
                onChange={(event) =>
                  updateSingle('postedWithin', event.target.value)
                }
                value={queryParams.postedWithin}
              >
                <option value="">Any time</option>
                <option value="1">Past 24h</option>
                <option value="7">Past week</option>
                <option value="30">Past month</option>
              </Select>
            </div>

            <FilterChecklist
              items={[
                {
                  value: 'remote',
                  label: 'Remote',
                  count:
                    facets.workMode?.find((entry) => entry._id === 'remote')
                      ?.count || 0,
                },
                {
                  value: 'hybrid',
                  label: 'Hybrid',
                  count:
                    facets.workMode?.find((entry) => entry._id === 'hybrid')
                      ?.count || 0,
                },
                {
                  value: 'onsite',
                  label: 'Onsite',
                  count:
                    facets.workMode?.find((entry) => entry._id === 'onsite')
                      ?.count || 0,
                },
              ]}
              onToggle={(value) => updateMulti('workMode', value)}
              selected={parseMulti(searchParams, 'workMode')}
              title="Work mode"
            />

            <FilterChecklist
              items={[
                {
                  value: 'coop',
                  label: 'Co-op',
                  count:
                    facets.employmentType?.find((entry) => entry._id === 'coop')
                      ?.count || 0,
                },
                {
                  value: 'internship',
                  label: 'Internship',
                  count:
                    facets.employmentType?.find(
                      (entry) => entry._id === 'internship'
                    )?.count || 0,
                },
              ]}
              onToggle={(value) => updateMulti('employmentType', value)}
              selected={parseMulti(searchParams, 'employmentType')}
              title="Experience level"
            />

            <FilterChecklist
              items={[
                'Summer 2026',
                'Fall 2026',
                'Winter 2026',
                'Spring 2026',
              ].map((value) => ({ value, label: value, count: 0 }))}
              onToggle={(value) => updateMulti('workTerm', value)}
              selected={parseMulti(searchParams, 'workTerm')}
              title="Work term"
            />

            <FilterChecklist
              items={['4', '8', '12'].map((value) => ({
                value,
                label: `${value} months`,
                count: 0,
              }))}
              onToggle={(value) => updateMulti('duration', value)}
              selected={parseMulti(searchParams, 'duration')}
              title="Duration"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Salary minimum
              </label>
              <Input
                min="0"
                onChange={(event) =>
                  updateSingle('salaryMin', event.target.value)
                }
                type="number"
                value={queryParams.salaryMin}
              />
            </div>

            <FilterChecklist
              items={(facets.topSkills || []).map((entry) => ({
                value: entry._id,
                label: entry._id,
                count: entry.count,
              }))}
              onToggle={(value) => updateMulti('skills', value)}
              selected={parseMulti(searchParams, 'skills')}
              title="Skills"
            />

            <label className="flex items-center gap-3 text-sm text-text-secondary">
              <Checkbox
                checked={queryParams.easyApply === 'true'}
                onChange={(event) =>
                  updateSingle('easyApply', event.target.checked ? 'true' : '')
                }
              />
              Easy Apply only
            </label>
          </CardBody>
        </Card>
      </aside>

      <section className="space-y-4">
        <Card>
          <CardBody className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-text-muted">Search results</p>
              <h1 className="text-2xl font-semibold text-text-primary">
                {jobsQuery.data?.total || 0} jobs
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-text-muted" />
              <Select
                className="min-w-52"
                onChange={(event) => updateSingle('sort', event.target.value)}
                value={queryParams.sort}
              >
                <option value="relevance">Relevance</option>
                <option value="date">Most recent</option>
                <option value="salary">Salary high to low</option>
              </Select>
            </div>
          </CardBody>
        </Card>

        {jobsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-md" />
            ))}
          </div>
        ) : jobsQuery.data?.jobs?.length ? (
          <div className="space-y-4">
            {jobsQuery.data.jobs.map((job) => (
              <JobCard job={job} key={job._id} />
            ))}
          </div>
        ) : (
          <EmptyState
            description="Try widening the date range, changing keywords, or clearing a few filters."
            icon={SlidersHorizontal}
            title="No jobs matched this search"
          />
        )}

        <Pagination
          onPageChange={(page) => updateSingle('page', String(page))}
          page={queryParams.page}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}

function FilterChecklist({ title, items, selected, onToggle }) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <label
            className="flex items-center justify-between gap-3 text-sm text-text-secondary"
            key={item.value}
          >
            <span className="flex items-center gap-3">
              <Checkbox
                checked={selected.includes(item.value)}
                onChange={() => onToggle(item.value)}
              />
              {item.label}
            </span>
            <span className="text-text-muted">{item.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
