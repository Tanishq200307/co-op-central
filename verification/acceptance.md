# CoopCentral verification

## Build

- `cd client && npm run build` passed
- Main entry chunk gzip: `104.43 kB`
- Largest route chunk gzip: `104.30 kB`

## Backend data

- `GET /api/stats/home` returned:
  - `openJobs: 150`
  - `hiringCompanies: 40`
  - `universityPartners: 8`
  - `students: 60`
- Seeded applications: `1096`

## Browser checks

- Home page renders with hero, live stats, featured jobs, and company grid
- Jobs search renders 25 job cards on the first page
- Job detail renders company info, skills, similar jobs, and a working apply modal
- Student login lands on `/student` with recommendations and seeded application activity
- Employer login lands on `/employer` with seeded jobs and applicants
- University login lands on `/university`
- Theme toggle switches dark/light and persists after refresh

## End-to-end path

- Logged in as `demo.student@bcit.ca`
- Selected an eligible Shopify role not yet applied to
- Submitted the application successfully
- Confirmed the job appeared in the student applications view
- Logged in as `demo.employer@shopify.com`
- Confirmed the new application was visible in the employer view

## Artifacts generated locally

- `verification/gate-0b-probe.png`
- `verification/gate-1.log`
- `verification/home-phase2-check.png`
- `verification/jobs-phase3-check.png`
- `verification/job-detail-phase3-check.png`
- `verification/student-dashboard-check-2s.png`
- `verification/employer-dashboard-check.png`
