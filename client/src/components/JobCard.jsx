import { Bookmark, Building2, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { saveJob, unsaveJob } from '../services/jobsApi';
import { cn, firstInitialFromName, formatCurrencyRange } from '../lib/utils';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { Card, CardBody } from './ui/Card';
import Tag from './ui/Tag';

export default function JobCard({ job, compact = false, className }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: () => (job.isSaved ? unsaveJob(job._id) : saveJob(job._id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast.success(
        job.isSaved ? 'Removed from saved jobs.' : 'Saved job for later.'
      );
    },
    onError: () => {
      toast.error('Could not update saved jobs right now.');
    },
  });

  const displayedSkills = job.skillsRequired?.slice(0, 3) || [];

  return (
    <Card
      className={cn(
        'group transition duration-150 hover:-translate-y-0.5 hover:border-accent-primary/50',
        className
      )}
    >
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar
            className="h-14 w-14 shrink-0 rounded-md after:rounded-md"
            name={firstInitialFromName(job.company?.name || 'Company', 'C')}
          />

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {job.isPromoted ? (
                <Badge variant="warning">Promoted</Badge>
              ) : null}
              {job.isEasyApply ? (
                <Badge variant="success">Easy Apply</Badge>
              ) : null}
            </div>

            <div>
              <Link
                className="text-lg font-semibold text-text-primary transition hover:text-accent-primary"
                to={`/jobs/${job._id}`}
              >
                {job.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.company?.name || 'Confidential company'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{job.workMode}</Badge>
              <Badge variant="outline">
                {job.employmentType.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{job.workTerm}</Badge>
            </div>

            <p
              className={cn(
                'text-sm text-text-secondary',
                compact ? 'line-clamp-2' : 'line-clamp-3'
              )}
            >
              {job.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
              {(job.skillsRequired?.length || 0) > displayedSkills.length ? (
                <Tag>
                  +{job.skillsRequired.length - displayedSkills.length} more
                </Tag>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <span>
                {formatCurrencyRange({
                  min: job.salaryMin,
                  max: job.salaryMax,
                  currency: job.salaryCurrency,
                  period: job.salaryPeriod,
                })}
              </span>
              <span title={new Date(job.postedAt).toLocaleString()}>
                {formatDistanceToNow(new Date(job.postedAt), {
                  addSuffix: true,
                })}
              </span>
              <span>{job.applicantCount || 0} applicants</span>
            </div>
          </div>
        </div>

        <button
          aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
          disabled={saveMutation.isPending}
          onClick={() => {
            if (!user || user.role !== 'student') {
              navigate('/login');
              return;
            }

            saveMutation.mutate();
          }}
          type="button"
        >
          <Bookmark
            className={cn(
              'h-5 w-5',
              job.isSaved ? 'fill-current text-accent-primary' : ''
            )}
          />
        </button>
      </CardBody>
    </Card>
  );
}
