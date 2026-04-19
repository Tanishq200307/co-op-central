import { BriefcaseBusiness, GraduationCap, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Field';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { user } = await login(form.email, form.password);
      navigate(
        user.role === 'student'
          ? '/student'
          : user.role === 'employer'
            ? '/employer'
            : '/university'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
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
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold text-text-primary">
              Log in to CoopCentral
            </h1>
            <p className="text-text-secondary">
              Access saved jobs, applications, employer workflows, and
              university dashboards.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <Input
              name="email"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="Email"
              type="email"
              value={form.email}
            />
            <Input
              name="password"
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
            {error ? (
              <p className="text-sm text-accent-danger">{error}</p>
            ) : null}
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? 'Logging in...' : 'Log in'}
            </Button>
            <p className="text-sm text-text-secondary">
              No account yet?{' '}
              <Link className="text-accent-primary" to="/register">
                Sign up
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardBody className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_45%),linear-gradient(180deg,rgba(23,34,59,0.95),rgba(11,18,32,1))] p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-primary">
              Built for every side of co-op hiring
            </p>
            <h2 className="text-3xl font-semibold text-text-primary">
              A polished workflow for students, employers, and universities.
            </h2>
          </div>
          <div className="grid gap-4">
            {[
              [
                GraduationCap,
                'Students',
                'Save roles, track every status, and apply with less friction.',
              ],
              [
                BriefcaseBusiness,
                'Employers',
                'Target the right schools and manage candidates in one pipeline.',
              ],
              [
                ShieldCheck,
                'Universities',
                'See exactly which jobs are open to your students.',
              ],
            ].map(([Icon, title, description]) => (
              <div
                className="rounded-md border border-white/10 bg-white/5 p-4"
                key={title}
              >
                <Icon className="h-6 w-6 text-accent-primary" />
                <p className="mt-3 font-semibold text-text-primary">{title}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
