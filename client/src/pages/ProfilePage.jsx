import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Input, Select, Textarea } from '../components/ui/Field';
import Skeleton from '../components/ui/Skeleton';
import {
  getMyStudentProfile,
  updateMyStudentProfile,
} from '../services/studentsApi';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['student-profile'],
    queryFn: getMyStudentProfile,
  });
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (query.data?.profile) {
      setForm(query.data.profile);
    }
  }, [query.data?.profile]);

  const mutation = useMutation({
    mutationFn: updateMyStudentProfile,
    onSuccess: () => {
      toast.success('Profile updated.');
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: () => toast.error('Could not save your profile.'),
  });

  if (query.isLoading || !form) {
    return <Skeleton className="h-[720px] rounded-md" />;
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateLinks(key, value) {
    setForm((current) => ({
      ...current,
      links: {
        ...current.links,
        [key]: value,
      },
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold text-text-primary">
              Student profile
            </h1>
          </CardHeader>
          <CardBody className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Headline
                </label>
                <Input
                  onChange={(event) =>
                    updateField('headline', event.target.value)
                  }
                  value={form.headline || ''}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Location
                </label>
                <Input
                  onChange={(event) =>
                    updateField('location', event.target.value)
                  }
                  value={form.location || ''}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                About
              </label>
              <Textarea
                maxLength={500}
                onChange={(event) => updateField('about', event.target.value)}
                rows={6}
                value={form.about || ''}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Skills
                </label>
                <Input
                  onChange={(event) =>
                    updateField(
                      'skills',
                      event.target.value
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean)
                    )
                  }
                  value={(form.skills || []).join(', ')}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Work preference
                </label>
                <Select
                  onChange={(event) =>
                    updateField('workPreference', event.target.value)
                  }
                  value={form.workPreference || 'any'}
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  LinkedIn
                </label>
                <Input
                  onChange={(event) =>
                    updateLinks('linkedin', event.target.value)
                  }
                  value={form.links?.linkedin || ''}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  GitHub
                </label>
                <Input
                  onChange={(event) =>
                    updateLinks('github', event.target.value)
                  }
                  value={form.links?.github || ''}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Portfolio
                </label>
                <Input
                  onChange={(event) =>
                    updateLinks('portfolio', event.target.value)
                  }
                  value={form.links?.portfolio || ''}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(form)}
              >
                {mutation.isPending ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text-primary">
            Completion checklist
          </h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-text-secondary">
          {[
            ['Headline', Boolean(form.headline)],
            ['About', Boolean(form.about)],
            ['Skills', Boolean(form.skills?.length)],
            [
              'Links',
              Boolean(
                form.links?.linkedin ||
                form.links?.github ||
                form.links?.portfolio
              ),
            ],
          ].map(([label, done]) => (
            <div className="flex items-center justify-between" key={label}>
              <span>{label}</span>
              <span
                className={done ? 'text-accent-success' : 'text-text-muted'}
              >
                {done ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
