import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  CircleHelp,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  UserCircle2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { cn, firstInitialFromName } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getNotifications,
  markAllNotificationsRead,
} from '../services/notificationsApi';
import { getSuggestions } from '../services/searchApi';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Dropdown, { DropdownItem } from './ui/Dropdown';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

const NAV_LINKS = {
  guest: [
    { label: 'Jobs', to: '/jobs' },
    { label: 'Companies', to: '/companies' },
    { label: 'For employers', to: '/for-employers' },
    { label: 'For universities', to: '/for-universities' },
  ],
  student: [
    { label: 'Jobs', to: '/jobs' },
    { label: 'Companies', to: '/companies' },
    { label: 'Saved', to: '/saved' },
    { label: 'Applications', to: '/applications' },
  ],
  employer: [
    {
      label: 'Dashboard',
      to: '/employer',
      match: (location) =>
        location.pathname === '/employer' &&
        new URLSearchParams(location.search).get('tab') !== 'applicants',
    },
    { label: 'Post a job', to: '/employer/jobs/new' },
    {
      label: 'Applicants',
      to: '/employer?tab=applicants',
      match: (location) =>
        location.pathname === '/employer/applicants' ||
        location.pathname.startsWith('/employer/applicants/') ||
        (location.pathname === '/employer' &&
          new URLSearchParams(location.search).get('tab') === 'applicants'),
    },
  ],
  university: [
    {
      label: 'Dashboard',
      to: '/university',
      match: (location) =>
        location.pathname === '/university' &&
        !['students', 'jobs'].includes(
          new URLSearchParams(location.search).get('tab')
        ),
    },
    {
      label: 'Students',
      to: '/university?tab=students',
      match: (location) =>
        location.pathname === '/university' &&
        new URLSearchParams(location.search).get('tab') === 'students',
    },
    {
      label: 'Jobs targeting us',
      to: '/university?tab=jobs',
      match: (location) =>
        location.pathname === '/university' &&
        new URLSearchParams(location.search).get('tab') === 'jobs',
    },
  ],
  admin: [
    {
      label: 'Admin',
      to: '/admin',
      match: (location) =>
        location.pathname === '/admin' &&
        !['users', 'jobs', 'companies'].includes(
          new URLSearchParams(location.search).get('tab')
        ),
    },
    {
      label: 'Users',
      to: '/admin?tab=users',
      match: (location) =>
        location.pathname === '/admin' &&
        new URLSearchParams(location.search).get('tab') === 'users',
    },
    {
      label: 'Jobs',
      to: '/admin?tab=jobs',
      match: (location) =>
        location.pathname === '/admin' &&
        new URLSearchParams(location.search).get('tab') === 'jobs',
    },
    {
      label: 'Companies',
      to: '/admin?tab=companies',
      match: (location) =>
        location.pathname === '/admin' &&
        new URLSearchParams(location.search).get('tab') === 'companies',
    },
  ],
};

function getRoleLinks(role) {
  return NAV_LINKS[role] || NAV_LINKS.guest;
}

function matchesLink(item, location) {
  if (item.match) {
    return item.match(location);
  }

  if (item.to === '/') {
    return location.pathname === '/';
  }

  return (
    location.pathname === item.to ||
    location.pathname.startsWith(`${item.to}/`)
  );
}

function getProfileRoute(role) {
  return role === 'student' ? '/profile' : null;
}

function getSettingsRoute(role) {
  if (role === 'employer') return '/settings';
  if (role === 'university') return '/settings';
  if (role === 'admin') return '/settings';
  if (role === 'student') return '/settings';
  return '/login';
}

function NavLinks({ items, location, mobile = false, onNavigate }) {
  return (
    <nav
      className={
        mobile ? 'grid gap-1.5' : 'hidden items-center gap-1 lg:flex'
      }
    >
      {items.map((item) => {
        const active = matchesLink(item, location);

        return (
          <Link
            className={cn(
              mobile
                ? 'rounded-md px-3 py-2 text-sm font-medium'
                : 'rounded-md border-b-2 border-transparent px-3 py-[1.15rem] text-sm font-medium transition',
              active
                ? mobile
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'border-accent-primary text-accent-primary'
                : mobile
                  ? 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
            )}
            key={`${item.label}:${item.to}`}
            onClick={onNavigate}
            to={item.to}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children }) {
  const { user, logout, profileMeta, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [stableUser, setStableUser] = useState(user);
  const [stableProfileMeta, setStableProfileMeta] = useState(profileMeta);
  const searchRef = useRef(null);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    if (user) {
      setStableUser(user);
      setStableProfileMeta(profileMeta);
      return;
    }

    if (!loading) {
      setStableUser(null);
      setStableProfileMeta(null);
    }
  }, [loading, profileMeta, user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const activeUser = user || (loading ? stableUser : null);
  const activeProfileMeta = profileMeta || (loading ? stableProfileMeta : null);
  const role = activeUser?.role || 'guest';
  const isAuthenticated = role !== 'guest';
  const links = getRoleLinks(role);

  const suggestionQuery = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: () => getSuggestions(debouncedSearch),
    enabled: isAuthenticated && debouncedSearch.trim().length > 1,
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    function handleShortcut(event) {
      if (
        !isAuthenticated ||
        event.key !== '/' ||
        ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        return;
      }

      event.preventDefault();
      searchRef.current?.focus();
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isAuthenticated]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!searchValue.trim()) return;

    navigate(`/jobs?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchValue('');
  }

  function handleLogout() {
    logout();
    setSearchValue('');
    navigate('/login');
  }

  const unreadCount = notificationsQuery.data?.unreadCount || 0;
  const profileRoute = getProfileRoute(role);
  const settingsRoute = getSettingsRoute(role);

  const avatarName =
    activeUser?.name || stableUser?.name || (isAuthenticated ? 'Account' : '');

  return (
    <div className="app-shell bg-bg-base text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-base/90 backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center gap-4">
          <Link
            className="flex shrink-0 items-center gap-3 text-text-primary"
            to="/"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary font-semibold text-white shadow-card">
              C
            </span>
            <span className="text-lg font-semibold tracking-tight">
              CoopCentral
            </span>
          </Link>

          <NavLinks items={links} location={location} />

          {isAuthenticated ? (
            <form
              className="relative hidden max-w-xl flex-1 lg:block"
              onSubmit={handleSearchSubmit}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="w-full rounded-full border border-border-subtle bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted"
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search jobs, companies, skills..."
                ref={searchRef}
                value={searchValue}
              />

              {suggestionQuery.data && searchValue.trim().length > 1 ? (
                <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] rounded-md border border-border-subtle bg-bg-surface p-3 shadow-popover">
                  {suggestionQuery.data.jobs.length === 0 &&
                  suggestionQuery.data.companies.length === 0 &&
                  suggestionQuery.data.skills.length === 0 ? (
                    <p className="text-sm text-text-muted">No suggestions yet.</p>
                  ) : (
                    <div className="grid gap-3 text-sm">
                      {suggestionQuery.data.jobs.length ? (
                        <div className="grid gap-2">
                          <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                            Jobs
                          </p>
                          {suggestionQuery.data.jobs.slice(0, 4).map((job) => (
                            <Link
                              className="rounded-sm px-3 py-2 text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                              key={job._id}
                              onClick={() => setSearchValue('')}
                              to={`/jobs/${job._id}`}
                            >
                              {job.title}
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      {suggestionQuery.data.companies.length ? (
                        <div className="grid gap-2">
                          <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                            Companies
                          </p>
                          {suggestionQuery.data.companies
                            .slice(0, 4)
                            .map((company) => (
                              <Link
                                className="rounded-sm px-3 py-2 text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                                key={company.slug}
                                onClick={() => setSearchValue('')}
                                to={`/companies/${company.slug}`}
                              >
                                {company.name}
                              </Link>
                            ))}
                        </div>
                      ) : null}

                      {suggestionQuery.data.skills.length ? (
                        <div className="grid gap-2">
                          <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                            Skills
                          </p>
                          {suggestionQuery.data.skills.slice(0, 5).map((skill) => (
                            <Link
                              className="rounded-sm px-3 py-2 text-text-secondary transition hover:bg-bg-elevated hover:text-text-primary"
                              key={skill}
                              onClick={() => setSearchValue('')}
                              to={`/jobs?skills=${encodeURIComponent(skill)}`}
                            >
                              {skill}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </form>
          ) : (
            <div className="hidden flex-1 lg:block" />
          )}

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link
                  className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
                  to="/login"
                >
                  Log in
                </Link>
                <Button asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            ) : (
              <>
                <button
                  aria-label="Toggle theme"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                  onClick={toggleTheme}
                  type="button"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>

                <Dropdown
                  trigger={
                    <button
                      aria-label="Notifications"
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
                      type="button"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount ? (
                        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent-primary" />
                      ) : null}
                    </button>
                  }
                >
                  {({ close }) => (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-1">
                        <p className="text-sm font-semibold text-text-primary">
                          Notifications
                        </p>
                        <button
                          className="text-xs text-accent-primary"
                          onClick={async () => {
                            await markAllNotificationsRead();
                            notificationsQuery.refetch();
                            close();
                          }}
                          type="button"
                        >
                          Mark all read
                        </button>
                      </div>
                      {(notificationsQuery.data?.notifications || [])
                        .slice(0, 5)
                        .map((notification) => (
                          <Link
                            className="block rounded-sm px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-elevated"
                            key={notification._id}
                            onClick={close}
                            to={notification.link || '#'}
                          >
                            <p className="font-medium text-text-primary">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                              {notification.body}
                            </p>
                          </Link>
                        ))}
                    </div>
                  )}
                </Dropdown>

                <Dropdown
                  trigger={
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-2 py-1.5 transition hover:border-accent-primary"
                      type="button"
                    >
                      <Avatar
                        name={firstInitialFromName(avatarName, 'A')}
                      />
                      <span className="max-w-28 truncate text-sm font-medium text-text-primary">
                        {avatarName}
                      </span>
                    </button>
                  }
                >
                  {({ close }) => (
                    <div>
                      {profileRoute ? (
                        <DropdownItem
                          onClick={() => {
                            navigate(profileRoute);
                            close();
                          }}
                        >
                          <UserCircle2 className="h-4 w-4" />
                          Profile
                        </DropdownItem>
                      ) : null}

                      <DropdownItem
                        onClick={() => {
                          navigate(settingsRoute);
                          close();
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => {
                          navigate('/help');
                          close();
                        }}
                      >
                        <CircleHelp className="h-4 w-4" />
                        Help
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => {
                          handleLogout();
                          close();
                        }}
                      >
                        Log out
                      </DropdownItem>
                    </div>
                  )}
                </Dropdown>
              </>
            )}
          </div>

          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation menu"
                className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-primary lg:hidden"
                type="button"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent className="border-l border-border-subtle bg-bg-surface p-0 text-text-primary" side="right">
              <SheetHeader className="border-b border-border-subtle">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Browse the right areas for your account.
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-6 p-4">
                {isAuthenticated ? (
                  <form className="relative" onSubmit={handleSearchSubmit}>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      className="w-full rounded-full border border-border-subtle bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted"
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search jobs, companies, skills..."
                      value={searchValue}
                    />
                  </form>
                ) : null}

                <NavLinks
                  items={links}
                  location={location}
                  mobile
                  onNavigate={() => setMobileOpen(false)}
                />

                {isAuthenticated ? (
                  <div className="grid gap-2">
                    {profileRoute ? (
                      <Button
                        onClick={() => {
                          navigate(profileRoute);
                          setMobileOpen(false);
                        }}
                        variant="secondary"
                      >
                        Profile
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => {
                        navigate(settingsRoute);
                        setMobileOpen(false);
                      }}
                      variant="secondary"
                    >
                      Settings
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/help');
                        setMobileOpen(false);
                      }}
                      variant="secondary"
                    >
                      Help
                    </Button>
                    <Button onClick={toggleTheme} variant="secondary">
                      {theme === 'dark'
                        ? 'Switch to light mode'
                        : 'Switch to dark mode'}
                    </Button>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      variant="ghost"
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button asChild>
                      <Link onClick={() => setMobileOpen(false)} to="/register">
                        Sign up
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link onClick={() => setMobileOpen(false)} to="/login">
                        Log in
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="page-shell py-8">{children}</main>

      <footer className="mt-12 border-t border-border-subtle py-8">
        <div className="page-shell flex flex-col gap-4 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-text-primary">CoopCentral</p>
            <p>
              Centralized co-op hiring for students, employers, and
              universities.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              className={location.pathname === '/jobs' ? 'text-text-primary' : ''}
              to="/jobs"
            >
              Jobs
            </Link>
            <Link
              className={
                location.pathname === '/companies' ? 'text-text-primary' : ''
              }
              to="/companies"
            >
              Companies
            </Link>
            <Link to="/">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
