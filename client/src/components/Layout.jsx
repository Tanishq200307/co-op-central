import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Menu,
  Moon,
  Search,
  Sun,
  UserCircle2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDebouncedValue from '../hooks/useDebouncedValue';
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

function NavLinks({ items, mobile = false, onNavigate }) {
  return (
    <div
      className={mobile ? 'grid gap-2' : 'hidden items-center gap-5 lg:flex'}
    >
      {items.map((item) => (
        <Link
          key={item.to}
          className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
          onClick={onNavigate}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout, profileMeta } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef(null);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  const suggestionQuery = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: () => getSuggestions(debouncedSearch),
    enabled: debouncedSearch.trim().length > 1,
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: Boolean(user),
  });

  useEffect(() => {
    function handleShortcut(event) {
      if (
        event.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (!searchValue.trim()) return;

    navigate(`/jobs?q=${encodeURIComponent(searchValue.trim())}`);
    setMobileOpen(false);
  }

  function getPrimaryLinks() {
    if (!user) {
      return [
        { label: 'Jobs', to: '/jobs' },
        { label: 'Companies', to: '/companies' },
        { label: 'For Employers', to: '/employer' },
        { label: 'For Universities', to: '/university' },
      ];
    }

    if (user.role === 'student') {
      return [
        { label: 'Jobs', to: '/jobs' },
        { label: 'Companies', to: '/companies' },
        { label: 'Saved', to: '/saved' },
        { label: 'Applications', to: '/applications' },
      ];
    }

    if (user.role === 'employer') {
      return [
        { label: 'Dashboard', to: '/employer' },
        { label: 'Post a job', to: '/employer/jobs/new' },
        { label: 'Applicants', to: '/employer' },
      ];
    }

    return [
      { label: 'Dashboard', to: '/university' },
      { label: 'Students', to: '/university' },
      { label: 'Jobs targeting us', to: '/university' },
    ];
  }

  const unreadCount = notificationsQuery.data?.unreadCount || 0;

  return (
    <div className="app-shell bg-bg-base text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg-base/90 backdrop-blur-xl">
        <div className="page-shell flex h-16 items-center gap-4">
          <Link
            className="shrink-0 text-xl font-bold tracking-tight text-text-primary"
            to="/"
          >
            CoopCentral
          </Link>

          <NavLinks items={getPrimaryLinks()} />

          <form
            className="relative hidden flex-1 lg:block"
            onSubmit={handleSearchSubmit}
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              className="w-full rounded-full border border-border-subtle bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search jobs, companies, or skills"
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
                    {suggestionQuery.data.jobs.map((job) => (
                      <Link key={job._id} to={`/jobs/${job._id}`}>
                        {job.title}
                      </Link>
                    ))}
                    {suggestionQuery.data.companies.map((company) => (
                      <Link
                        key={company.slug}
                        to={`/companies/${company.slug}`}
                      >
                        {company.name}
                      </Link>
                    ))}
                    {suggestionQuery.data.skills.map((skill) => (
                      <Link
                        key={skill}
                        to={`/jobs?skills=${encodeURIComponent(skill)}`}
                      >
                        {skill}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </form>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            {!user ? (
              <>
                <Link
                  className="text-sm font-medium text-text-secondary"
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
                <Dropdown
                  trigger={
                    <button
                      aria-label="Notifications"
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-secondary"
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
                      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-2 py-1.5"
                      type="button"
                    >
                      <Avatar
                        name={user.name}
                        src={
                          profileMeta?.studentProfile?.avatarUrl ||
                          profileMeta?.company?.logoUrl
                        }
                      />
                      <span className="max-w-28 truncate text-sm font-medium text-text-primary">
                        {user.name}
                      </span>
                    </button>
                  }
                >
                  {({ close }) => (
                    <div>
                      <DropdownItem
                        onClick={() => {
                          navigate(
                            user.role === 'student'
                              ? '/profile'
                              : user.role === 'employer'
                                ? '/employer'
                                : '/university'
                          );
                          close();
                        }}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          toggleTheme();
                          close();
                        }}
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        Theme toggle
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          logout();
                          navigate('/login');
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

          <button
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border-subtle bg-bg-surface lg:hidden">
            <div className="page-shell space-y-4 py-4">
              <form className="relative" onSubmit={handleSearchSubmit}>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  className="w-full rounded-full border border-border-subtle bg-bg-elevated py-2.5 pl-10 pr-4 text-sm"
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search jobs and companies"
                  value={searchValue}
                />
              </form>
              <NavLinks
                items={getPrimaryLinks()}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
              {user ? (
                <div className="grid gap-2">
                  <Button onClick={toggleTheme} variant="secondary">
                    {theme === 'dark'
                      ? 'Switch to light mode'
                      : 'Switch to dark mode'}
                  </Button>
                  <Button
                    onClick={() => {
                      logout();
                      navigate('/login');
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
          </div>
        ) : null}
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
              className={
                location.pathname === '/jobs' ? 'text-text-primary' : ''
              }
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
