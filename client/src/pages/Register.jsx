import { BriefcaseBusiness, Building2, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Field';

const roleOptions = [
  {
    value: 'student',
    label: 'Student',
    description: 'Discover and apply to co-op jobs',
    icon: GraduationCap,
  },
  {
    value: 'employer',
    label: 'Employer',
    description: 'Post roles and manage applicants',
    icon: BriefcaseBusiness,
  },
  {
    value: 'university',
    label: 'University',
    description: 'Manage campus visibility and student access',
    icon: Building2,
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const initialRole = roleOptions.some((option) => option.value === requestedRole)
    ? requestedRole
    : 'student';
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    universityName: '',
    universityDomain: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { ...form };
      if (form.role !== 'university') {
        delete payload.universityName;
        delete payload.universityDomain;
      }

      const { user } = await register(payload);
      navigate(
        user.role === 'student'
          ? '/student'
          : user.role === 'employer'
            ? '/employer'
            : '/university'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardBody className="p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
              Create account
            </p>
            <h1 className="text-3xl font-semibold text-text-primary">
              Join CoopCentral
            </h1>
            <p className="text-text-secondary">
              Choose the role that matches your workflow and get into the
              platform in minutes.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const selected = form.role === option.value;

              return (
                <button
                  className={`rounded-md border p-4 text-left transition ${selected ? 'border-accent-primary bg-accent-primary/10' : 'border-border-subtle bg-bg-elevated'}`}
                  key={option.value}
                  onClick={() =>
                    setForm((current) => ({ ...current, role: option.value }))
                  }
                  type="button"
                >
                  <Icon className="h-5 w-5 text-accent-primary" />
                  <p className="mt-3 font-semibold text-text-primary">
                    {option.label}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Full name"
              value={form.name}
            />
            <Input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="Email address"
              type="email"
              value={form.email}
            />
            <Input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Password"
              type="password"
              value={form.password}
            />

            {form.role === 'university' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      universityName: event.target.value,
                    }))
                  }
                  placeholder="University name"
                  value={form.universityName}
                />
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      universityDomain: event.target.value,
                    }))
                  }
                  placeholder="University domain"
                  value={form.universityDomain}
                />
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-accent-danger">{error}</p>
            ) : null}

            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <Link className="text-accent-primary" to="/login">
                Log in
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardBody className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.26),transparent_38%),linear-gradient(180deg,rgba(23,34,59,0.96),rgba(11,18,32,1))] p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-primary">
              Why teams use CoopCentral
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-text-primary">
              A single destination for the full co-op ecosystem.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              'Role-based dashboards that still share a common data model.',
              'Audience-aware jobs that respect public, all-university, and selected-campus visibility.',
              'Realistic seeded data, so the demo never feels empty on first load.',
            ].map((point) => (
              <div
                className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-secondary"
                key={point}
              >
                {point}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
