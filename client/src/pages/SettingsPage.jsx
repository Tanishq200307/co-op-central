import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function getHomeRoute(role) {
  if (role === 'student') return '/student';
  if (role === 'employer') return '/employer';
  if (role === 'university') return '/university';
  if (role === 'admin') return '/admin';
  return '/';
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
          Account
        </p>
        <h1 className="text-3xl font-semibold text-text-primary">Settings</h1>
        <p className="text-text-secondary">
          Manage the basics for your current CoopCentral account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-text-primary">
            Preferences
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-bg-elevated p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-text-primary">Theme</p>
              <p className="text-sm text-text-secondary">
                Current mode: {theme === 'dark' ? 'Dark' : 'Light'}
              </p>
            </div>
            <Button onClick={toggleTheme} variant="secondary">
              Switch to {theme === 'dark' ? 'light' : 'dark'} mode
            </Button>
          </div>

          <div className="rounded-md border border-border-subtle bg-bg-elevated p-4">
            <p className="font-medium text-text-primary">Signed in as</p>
            <p className="mt-1 text-sm text-text-secondary">{user?.email}</p>
            <p className="mt-2 text-sm text-text-muted">
              Role: {user?.role || 'guest'}
            </p>
          </div>

          <Button asChild>
            <Link to={getHomeRoute(user?.role)}>Back to dashboard</Link>
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
