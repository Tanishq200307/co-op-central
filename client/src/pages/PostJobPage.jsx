import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import JobCard from '../components/JobCard';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Checkbox, Input, Select, Textarea } from '../components/ui/Field';
import Tabs from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';
import { createJob } from '../services/jobsApi';
import { getUniversities } from '../services/universitiesApi';

const steps = [
  { label: 'Basics', value: 'basics' },
  { label: 'Description', value: 'description' },
  { label: 'Audience', value: 'audience' },
  { label: 'Review', value: 'review' },
];

export default function PostJobPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { profileMeta } = useAuth();
  const universitiesQuery = useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });
  const [step, setStep] = useState('basics');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: 'Vancouver, BC',
    audienceType: 'public',
    selectedUniversities: [],
    employmentType: 'coop',
    workMode: 'hybrid',
    salaryMin: 26,
    salaryMax: 34,
    salaryCurrency: 'CAD',
    salaryPeriod: 'hourly',
    workTerm: 'Summer 2026',
    durationMonths: 4,
    startDate: '2026-05-01',
    skillsRequired: ['React', 'Node.js'],
    skillsPreferred: ['TypeScript'],
    gpaRequirement: '',
    isEasyApply: true,
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success('Job published.');
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard'] });
      navigate('/employer');
    },
  });

  const previewJob = useMemo(
    () => ({
      ...form,
      _id: 'preview',
      company: profileMeta?.company,
      applicantCount: 0,
      postedAt: new Date().toISOString(),
      isPromoted: false,
    }),
    [form, profileMeta?.company]
  );

  function setValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">
            Post a job
          </h1>
          <p className="mt-2 text-text-secondary">
            Create a polished listing with compensation, audience targeting, and
            an accurate preview of how it will appear to students.
          </p>
        </div>

        <Tabs onChange={setStep} tabs={steps} value={step} />

        <Card>
          <CardBody className="space-y-4">
            {step === 'basics' ? (
              <>
                <Input
                  onChange={(event) => setValue('title', event.target.value)}
                  placeholder="Job title"
                  value={form.title}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    onChange={(event) =>
                      setValue('location', event.target.value)
                    }
                    value={form.location}
                  />
                  <Select
                    onChange={(event) =>
                      setValue('workMode', event.target.value)
                    }
                    value={form.workMode}
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Select
                    onChange={(event) =>
                      setValue('employmentType', event.target.value)
                    }
                    value={form.employmentType}
                  >
                    <option value="coop">Co-op</option>
                    <option value="internship">Internship</option>
                  </Select>
                  <Select
                    onChange={(event) =>
                      setValue('workTerm', event.target.value)
                    }
                    value={form.workTerm}
                  >
                    <option value="Summer 2026">Summer 2026</option>
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Winter 2026">Winter 2026</option>
                    <option value="Spring 2026">Spring 2026</option>
                  </Select>
                  <Select
                    onChange={(event) =>
                      setValue('durationMonths', Number(event.target.value))
                    }
                    value={form.durationMonths}
                  >
                    <option value={4}>4 months</option>
                    <option value={8}>8 months</option>
                    <option value={12}>12 months</option>
                  </Select>
                </div>
              </>
            ) : null}

            {step === 'description' ? (
              <>
                <Textarea
                  onChange={(event) =>
                    setValue('description', event.target.value)
                  }
                  rows={10}
                  value={form.description}
                />
                <Input
                  onChange={(event) =>
                    setValue(
                      'skillsRequired',
                      event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  value={form.skillsRequired.join(', ')}
                />
                <Input
                  onChange={(event) =>
                    setValue(
                      'skillsPreferred',
                      event.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  value={form.skillsPreferred.join(', ')}
                />
              </>
            ) : null}

            {step === 'audience' ? (
              <>
                <Select
                  onChange={(event) =>
                    setValue('audienceType', event.target.value)
                  }
                  value={form.audienceType}
                >
                  <option value="public">Public</option>
                  <option value="all_universities">All universities</option>
                  <option value="selected_universities">
                    Selected universities
                  </option>
                </Select>
                {form.audienceType === 'selected_universities' ? (
                  <div className="grid gap-2">
                    {(universitiesQuery.data || []).map((university) => (
                      <label
                        className="flex items-center gap-3 text-sm text-text-secondary"
                        key={university._id}
                      >
                        <Checkbox
                          checked={form.selectedUniversities.includes(
                            university._id
                          )}
                          onChange={() =>
                            setValue(
                              'selectedUniversities',
                              form.selectedUniversities.includes(university._id)
                                ? form.selectedUniversities.filter(
                                    (id) => id !== university._id
                                  )
                                : [...form.selectedUniversities, university._id]
                            )
                          }
                        />
                        {university.name}
                      </label>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    onChange={(event) =>
                      setValue('salaryMin', Number(event.target.value))
                    }
                    type="number"
                    value={form.salaryMin}
                  />
                  <Input
                    onChange={(event) =>
                      setValue('salaryMax', Number(event.target.value))
                    }
                    type="number"
                    value={form.salaryMax}
                  />
                  <Input
                    onChange={(event) =>
                      setValue('gpaRequirement', event.target.value)
                    }
                    placeholder="GPA requirement"
                    value={form.gpaRequirement}
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-text-secondary">
                  <Checkbox
                    checked={form.isEasyApply}
                    onChange={(event) =>
                      setValue('isEasyApply', event.target.checked)
                    }
                  />
                  Easy Apply enabled
                </label>
              </>
            ) : null}

            {step === 'review' ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Review the preview on the right. When you are happy with the
                  listing, publish it and it will appear immediately for
                  eligible students.
                </p>
                <Button
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(form)}
                >
                  {mutation.isPending ? 'Publishing...' : 'Publish job'}
                </Button>
              </div>
            ) : null}

            <div className="flex justify-between">
              <Button
                disabled={steps.findIndex((item) => item.value === step) === 0}
                onClick={() =>
                  setStep(
                    steps[
                      Math.max(
                        0,
                        steps.findIndex((item) => item.value === step) - 1
                      )
                    ].value
                  )
                }
                variant="ghost"
              >
                Back
              </Button>
              <Button
                disabled={
                  steps.findIndex((item) => item.value === step) ===
                  steps.length - 1
                }
                onClick={() =>
                  setStep(
                    steps[
                      Math.min(
                        steps.length - 1,
                        steps.findIndex((item) => item.value === step) + 1
                      )
                    ].value
                  )
                }
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-text-primary">
              Live preview
            </h2>
          </CardHeader>
          <CardBody>
            <JobCard compact job={previewJob} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
