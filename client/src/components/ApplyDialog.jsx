import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { applyToJob } from '../services/jobsApi';
import Button from './ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/Dialog';
import { Textarea } from './ui/Field';

export default function ApplyDialog({ job, open, onClose, defaultResumeName }) {
  const queryClient = useQueryClient();
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (resume) {
        formData.append('resume', resume);
      }
      if (coverLetter) {
        formData.append('coverLetter', coverLetter);
      }
      return applyToJob(job._id, formData);
    },
    onSuccess: () => {
      toast.success('Application submitted.');
      queryClient.invalidateQueries({ queryKey: ['job', job._id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Could not submit application.'
      );
    },
  });

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      open={open}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{`Apply to ${job.title}`}</DialogTitle>
          <DialogDescription>
            Upload a resume or use your saved default resume. Add a short cover
            letter if it helps your story.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-md border border-border-subtle bg-bg-elevated p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">Default resume</p>
            <p className="mt-1">
              {defaultResumeName ||
                'No default resume on file. Upload one below.'}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-primary"
              htmlFor="resume-upload"
            >
              Resume upload
            </label>
            <input
              accept=".pdf,.doc,.docx"
              className="block w-full rounded-sm border border-dashed border-border-strong bg-bg-elevated px-3 py-3 text-sm text-text-secondary"
              id="resume-upload"
              onChange={(event) => setResume(event.target.files?.[0] || null)}
              type="file"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-text-primary"
              htmlFor="cover-letter"
            >
              Cover letter
            </label>
            <Textarea
              id="cover-letter"
              maxLength={1200}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Share a few lines about what makes this role a strong fit."
              rows={6}
              value={coverLetter}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
