import { BookOpen, BriefcaseBusiness, GraduationCap, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
          Support
        </p>
        <h1 className="text-3xl font-semibold text-text-primary">Help</h1>
        <p className="text-text-secondary">
          Quick guidance for students, employers, and university teams using
          CoopCentral.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            GraduationCap,
            'Students',
            'Browse opportunities, save the right roles, and track every step of your applications.',
          ],
          [
            BriefcaseBusiness,
            'Employers',
            'Post roles, review applicants, and move candidates through the hiring pipeline.',
          ],
          [
            School,
            'Universities',
            'Review jobs targeting your campus and understand how students are participating.',
          ],
        ].map(([Icon, title, description]) => (
          <Card key={title}>
            <CardBody className="space-y-3">
              <Icon className="h-6 w-6 text-accent-primary" />
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
              <p className="text-sm text-text-secondary">{description}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-primary">
              <BookOpen className="h-5 w-5 text-accent-primary" />
              <p className="font-medium">Need more help?</p>
            </div>
            <p className="text-sm text-text-secondary">
              Start with the role dashboards and use the main search to jump
              into the right workflow quickly.
            </p>
          </div>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
