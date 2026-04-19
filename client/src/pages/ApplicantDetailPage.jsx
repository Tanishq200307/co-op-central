import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Tag from '../components/ui/Tag';
import { getEmployerJobsWithApplicants } from '../services/jobsApi';

export default function ApplicantDetailPage() {
  const { applicationId } = useParams();
  const query = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: getEmployerJobsWithApplicants,
  });

  if (query.isLoading) {
    return <Skeleton className="h-[720px] rounded-md" />;
  }

  const application = query.data?.jobs
    .flatMap((job) =>
      job.applicants.map((applicant) => ({ ...applicant, job }))
    )
    .find((entry) => entry._id === applicationId);

  if (!application) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-text-primary">
            {application.student?.name}
          </h1>
          <p className="mt-2 text-text-secondary">
            {application.profile?.headline}
          </p>
        </CardHeader>
        <CardBody className="space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-text-primary">About</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {application.profile?.about}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(application.profile?.skills || []).map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-text-primary">
              Projects
            </h2>
            <div className="mt-3 space-y-3">
              {(application.profile?.projects || []).map((project) => (
                <div
                  className="rounded-md border border-border-subtle bg-bg-elevated p-4"
                  key={project.name}
                >
                  <p className="font-medium text-text-primary">
                    {project.name}
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              Application details
            </h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-text-secondary">
            <p>
              <span className="font-medium text-text-primary">Role:</span>{' '}
              {application.job.title}
            </p>
            <p>
              <span className="font-medium text-text-primary">Status:</span>{' '}
              {application.status}
            </p>
            <a
              className="text-accent-primary"
              href={`http://localhost:5001${application.resumeUrl}`}
              rel="noreferrer"
              target="_blank"
            >
              View resume
            </a>
            {application.coverLetter ? <p>{application.coverLetter}</p> : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              Status history
            </h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-text-secondary">
            {(application.statusHistory || []).map((entry, index) => (
              <div key={`${entry.status}-${index}`}>
                <p className="font-medium text-text-primary">
                  {entry.status.replace('_', ' ')}
                </p>
                <p>{new Date(entry.changedAt).toLocaleDateString()}</p>
                <p>{entry.note}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
