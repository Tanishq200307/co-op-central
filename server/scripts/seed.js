const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const SavedJob = require('../models/SavedJob');
const StudentProfile = require('../models/StudentProfile');
const University = require('../models/University');
const User = require('../models/User');
const { connectDB, closeDB } = require('../config/db');
const {
  ensureAvatar,
  ensureCompanyLogo,
  ensurePlaceholderResume,
} = require('../utils/svgAssets');
const slugify = require('../utils/slugify');
const logger = require('../utils/logger');

faker.seed(20260418);

const DEMO_PASSWORD = 'Demo123!';
const UNIVERSITIES = [
  ['BCIT', 'bcit.ca'],
  ['Simon Fraser University', 'sfu.ca'],
  ['University of British Columbia', 'ubc.ca'],
  ['University of Victoria', 'uvic.ca'],
  ['University of Waterloo', 'uwaterloo.ca'],
  ['University of Toronto', 'utoronto.ca'],
  ['McGill University', 'mcgill.ca'],
  ['University of Alberta', 'ualberta.ca'],
];

const COMPANY_NAMES = [
  'Shopify',
  'Hootsuite',
  'Clio',
  'Thinkific',
  'Visier',
  'Trulioo',
  'Mojio',
  'Copperleaf',
  'D-Wave',
  'General Fusion',
  'Ballard Power',
  'Carbon Engineering',
  'Terramera',
  'Saltworks',
  'STEMCELL Technologies',
  'Slack (Salesforce)',
  'Later',
  'Jane Software',
  'Galvanize',
  'Traction on Demand',
  'Absolute Software',
  'Avigilon',
  'SAP Labs Vancouver',
  'TELUS Digital',
  'EA Vancouver',
  'Microsoft Vancouver',
  'Amazon Vancouver',
  'Unbounce',
  'PayByPhone',
  'Sauce Labs',
  'Article',
  'Lululemon Tech',
  'ecobee',
  'Wealthsimple',
  'Ada',
  'Vidyard',
  'Ritual',
  'Top Hat',
  'Plusgrade',
  'League',
  'Nudge.ai',
];

const INDUSTRIES = [
  'Software',
  'Climate Tech',
  'Enterprise SaaS',
  'Ecommerce',
  'Fintech',
  'Health Tech',
  'Education Tech',
  'Clean Energy',
];

const CULTURE_TAGS = [
  'Mentorship',
  'High trust',
  'Remote-friendly',
  'Inclusive teams',
  'Product craft',
  'Customer empathy',
  'Learning budget',
  'Career growth',
];

const ROLE_TEMPLATES = [
  'Software Engineer Co-op',
  'Frontend Developer Intern',
  'Backend Developer Co-op',
  'Data Analyst Co-op',
  'Data Science Intern',
  'ML Engineer Co-op',
  'DevOps Co-op',
  'QA Engineer Co-op',
  'Product Manager Intern',
  'UX Designer Co-op',
  'UI Designer Intern',
  'Marketing Coordinator Co-op',
  'Content Marketing Intern',
  'Business Analyst Co-op',
  'Finance Co-op',
  'Operations Intern',
  'Cleantech Research Co-op',
  'Sustainability Analyst Intern',
  'Mechanical Engineer Co-op',
  'Electrical Engineer Co-op',
];

const LOCATIONS = [
  'Vancouver, BC',
  'Burnaby, BC',
  'Richmond, BC',
  'Victoria, BC',
  'Toronto, ON',
  'Waterloo, ON',
  'Montreal, QC',
  'Ottawa, ON',
  'Calgary, AB',
  'Edmonton, AB',
  'Remote (Canada)',
];

const WORK_TERMS = ['Summer 2026', 'Fall 2026', 'Winter 2026', 'Spring 2026'];
const DURATION_OPTIONS = [4, 8, 12];
const HEADCOUNT_OPTIONS = [
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
];
const WORK_MODES = ['remote', 'hybrid', 'onsite'];
const EMPLOYMENT_TYPES = ['coop', 'internship'];
const AUDIENCE_TYPES = ['public', 'all_universities', 'selected_universities'];
const SKILL_TAXONOMY = [
  'React',
  'Node.js',
  'Python',
  'SQL',
  'TypeScript',
  'AWS',
  'Docker',
  'Figma',
  'Tableau',
  'Power BI',
  'Java',
  'C++',
  'Swift',
  'Kotlin',
  'Kubernetes',
  'PyTorch',
  'TensorFlow',
  'Go',
  'Rust',
  'Postgres',
  'MongoDB',
  'GraphQL',
  'REST APIs',
  'Git',
  'CI/CD',
  'Linux',
  'Agile',
  'Jira',
  'Confluence',
  'HubSpot',
  'Salesforce',
  'Google Analytics',
  'SEO',
  'Content Strategy',
  'Copywriting',
  'Excel',
  'Financial Modeling',
  'Accounting',
  'Sustainability Reporting',
  'GHG Accounting',
  'Life Cycle Assessment',
  'MATLAB',
  'SolidWorks',
  'AutoCAD',
];

const UNIVERSITY_PROGRAMS = [
  'Computer Science',
  'Software Systems',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Commerce',
  'Data Science',
  'Interaction Design',
  'Environmental Studies',
];

function pickMany(items, min, max) {
  return faker.helpers.arrayElements(items, faker.number.int({ min, max }));
}

function weightedChoice(index, choices) {
  return choices[index % choices.length];
}

function randomRecentDate() {
  const roll = faker.number.int({ min: 0, max: 100 });
  const daysAgo =
    roll < 55
      ? faker.number.int({ min: 0, max: 7 })
      : faker.number.int({ min: 8, max: 30 });
  return faker.date.recent({ days: daysAgo + 1 });
}

function buildJobDescription(
  title,
  companyName,
  workMode,
  skillsRequired,
  skillsPreferred
) {
  const requiredText = skillsRequired.slice(0, 4).join(', ');
  const preferredText = skillsPreferred.slice(0, 3).join(', ');

  return [
    `About the role\n${companyName} is hiring a ${title} to help ship meaningful student-impact work during the next work term. You will join a team that values momentum, clear communication, and practical problem solving across product, engineering, and operations.`,
    `What you will do\nYou will partner with your team to scope tasks, deliver polished work, and learn how strong execution looks in a modern ${workMode} environment. You will work on user-facing improvements, operational tooling, and internal systems that support customers and teammates.`,
    `What you bring\nYou have foundational experience with ${requiredText}. You are comfortable asking sharp questions, turning feedback into action, and owning your work from kickoff to handoff.`,
    `Nice to haves\nExperience with ${preferredText} will help you ramp quickly. If you have built class projects, personal projects, or internship work that demonstrates craft and follow-through, that will stand out.`,
    `About the team\nThe team balances mentorship with autonomy, and students are treated as real contributors from week one. You will have a clear onboarding plan, regular check-ins, and a project scope that matters to the business.`,
  ].join('\n\n');
}

function inferSalary(role) {
  if (
    /Data Science|ML Engineer|Software Engineer|Backend|Frontend|DevOps/.test(
      role
    )
  ) {
    return [30, 42];
  }
  if (/Product Manager|UX|UI|Data Analyst|Business Analyst/.test(role)) {
    return [26, 36];
  }
  return [22, 32];
}

function buildStatusHistory(finalStatus, createdAt) {
  const history = [
    {
      status: 'submitted',
      changedAt: createdAt,
      note: 'Application submitted.',
    },
  ];
  if (finalStatus === 'submitted') return history;

  const reviewDate = faker.date.between({ from: createdAt, to: new Date() });
  history.push({
    status: 'in_review',
    changedAt: reviewDate,
    note: 'Profile reviewed by the hiring team.',
  });

  if (['interview', 'offer'].includes(finalStatus)) {
    history.push({
      status: 'interview',
      changedAt: faker.date.between({ from: reviewDate, to: new Date() }),
      note: 'Interview requested.',
    });
  }

  if (['offer', 'rejected', 'withdrawn'].includes(finalStatus)) {
    history.push({
      status: finalStatus,
      changedAt: faker.date.between({
        from: history[history.length - 1].changedAt,
        to: new Date(),
      }),
      note:
        finalStatus === 'offer'
          ? 'Offer shared with student.'
          : finalStatus === 'withdrawn'
            ? 'Student withdrew application.'
            : 'Application closed after review.',
    });
  }

  return history;
}

async function clearSeededData() {
  await Promise.all([
    Notification.deleteMany({}),
    SavedJob.deleteMany({}),
    Application.deleteMany({}),
    Job.deleteMany({}),
    StudentProfile.deleteMany({}),
    Company.deleteMany({}),
    University.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function createUniversityAdmins(passwordHash) {
  const admins = [];

  for (const [name, domain] of UNIVERSITIES) {
    const email = name === 'BCIT' ? 'admin@bcit.ca' : `admin@${domain}`;
    const user = await User.create({
      name: `${name} Admin`,
      email,
      password: passwordHash,
      role: 'university',
    });

    const university = await University.create({
      name,
      email,
      domain,
      about: `${name} works with CoopCentral to make relevant work-integrated learning opportunities visible to students.`,
      logoUrl: ensureCompanyLogo(slugify(name), name),
      createdBy: user._id,
    });

    user.universityId = university._id;
    await user.save();

    admins.push({ user, university });
  }

  return admins;
}

async function createCompaniesAndEmployers(passwordHash) {
  const employers = [];

  for (let index = 0; index < 40; index += 1) {
    const companyName = COMPANY_NAMES[index];
    const slug = slugify(companyName);
    const contactEmail =
      companyName === 'Shopify'
        ? 'demo.employer@shopify.com'
        : `campus@${slug.replace(/[^a-z0-9-]/g, '')}.com`;

    const user = await User.create({
      name: `${companyName} Campus Hiring`,
      email: contactEmail,
      password: passwordHash,
      role: 'employer',
    });

    const company = await Company.create({
      name: companyName,
      slug,
      logoUrl: ensureCompanyLogo(slug, companyName),
      website: `https://www.${slug.replace(/-+/g, '')}.com`,
      industry: weightedChoice(index, INDUSTRIES),
      headcountRange: weightedChoice(index, HEADCOUNT_OPTIONS),
      headquarters: weightedChoice(
        index,
        LOCATIONS.filter((location) => location !== 'Remote (Canada)')
      ),
      about: `${companyName} builds products and services with a strong focus on execution, mentorship, and meaningful co-op work. Teams on CoopCentral hire students into real business priorities across product, engineering, operations, and growth.`,
      foundedYear: 2004 + (index % 18),
      specialties: pickMany(SKILL_TAXONOMY, 3, 5),
      cultureTags: pickMany(CULTURE_TAGS, 3, 4),
      createdBy: user._id,
      seedKey: `company-${slug}`,
    });

    user.companyId = company._id;
    await user.save();

    employers.push({ user, company });
  }

  return employers;
}

async function createStudentUsers(passwordHash, universities) {
  const students = [];
  const gmailCount = 18;

  const demoBcit = await User.create({
    name: 'Demo Student',
    email: 'demo.student@bcit.ca',
    password: passwordHash,
    role: 'student',
  });
  students.push(demoBcit);

  const demoGeneral = await User.create({
    name: 'Demo General Student',
    email: 'demo.general@gmail.com',
    password: passwordHash,
    role: 'student',
  });
  students.push(demoGeneral);

  for (let index = 0; index < 58; index += 1) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const useGmail = index < gmailCount;
    const domain = useGmail
      ? 'gmail.com'
      : universities[index % universities.length].university.domain;
    const email =
      `${firstName}.${lastName}.${index}`
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '') + `@${domain}`;

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: passwordHash,
      role: 'student',
    });

    students.push(user);
  }

  for (let index = 0; index < students.length; index += 1) {
    const student = students[index];
    const matchedUniversity = universities.find(({ university }) =>
      student.email.endsWith(`@${university.domain}`)
    );
    const avatarSlug = slugify(student.email);
    const program = weightedChoice(index, UNIVERSITY_PROGRAMS);
    const skills = pickMany(SKILL_TAXONOMY, 5, 10);
    const resumeUrl = ensurePlaceholderResume(
      `seed-resume-${index + 1}.pdf`,
      student.name
    );

    await StudentProfile.create({
      user: student._id,
      headline: matchedUniversity
        ? `${faker.number.int({ min: 2, max: 4 })}rd year ${program} at ${matchedUniversity.university.name}`
        : `${faker.number.int({ min: 2, max: 4 })}rd year ${program} student open to co-op roles`,
      about: `${student.name} is building practical experience through projects, team-based coursework, and community involvement. They are looking for a role that blends mentorship, ownership, and strong product or operational fundamentals.`,
      skills,
      education: [
        {
          university:
            matchedUniversity?.university.name || 'Independent learner',
          program,
          credential: 'Bachelor degree',
          startYear: 2023,
          endYear: 2027,
          gpa: Number(
            faker.number.float({ min: 3.0, max: 4.0, fractionDigits: 2 })
          ),
        },
      ],
      experience: pickMany([0, 1, 2, 3], 1, 1)[0]
        ? [
            {
              company: weightedChoice(index, COMPANY_NAMES),
              title: weightedChoice(index, [
                'Project Assistant',
                'Peer Tutor',
                'Research Assistant',
                'Junior Analyst',
              ]),
              startDate: new Date('2025-05-01'),
              endDate: new Date('2025-08-31'),
              description:
                'Contributed to a scoped project with clear deliverables, stakeholder updates, and measurable outcomes.',
              current: false,
            },
          ]
        : [],
      projects: Array.from(
        { length: faker.number.int({ min: 0, max: 3 }) },
        (_, projectIndex) => ({
          name: `${weightedChoice(projectIndex + index, ['Campus Planner', 'Sustainability Tracker', 'Portfolio Site', 'Data Dashboard'])} ${projectIndex + 1}`,
          description:
            'Built a polished project focused on usability, delivery quality, and measurable impact.',
          link: `https://portfolio.example/${avatarSlug}/${projectIndex + 1}`,
          techStack: pickMany(SKILL_TAXONOMY, 2, 4),
        })
      ),
      links: {
        linkedin: `https://linkedin.com/in/${avatarSlug}`,
        github: `https://github.com/${avatarSlug}`,
        portfolio: `https://${avatarSlug}.portfolio.dev`,
      },
      avatarUrl: ensureAvatar(avatarSlug, student.name),
      location: weightedChoice(index, LOCATIONS),
      workPreference: weightedChoice(index, [
        'remote',
        'hybrid',
        'onsite',
        'any',
      ]),
      availability: {
        workTerm: weightedChoice(index, WORK_TERMS),
        startDate: new Date('2026-05-01'),
        durationMonths: weightedChoice(index, DURATION_OPTIONS),
      },
      defaultResumeUrl: resumeUrl,
      defaultResumeOriginalName: `${student.name.replace(/ /g, '-')}-resume.pdf`,
      seedKey: `student-profile-${avatarSlug}`,
    });
  }

  return students;
}

async function createJobs(employers, universities) {
  const jobs = [];

  for (let index = 0; index < 150; index += 1) {
    const employer = employers[index % employers.length];
    const title = ROLE_TEMPLATES[index % ROLE_TEMPLATES.length];
    const workMode =
      index % 20 < 6 ? 'remote' : index % 20 < 13 ? 'hybrid' : 'onsite';
    const audienceType =
      index % 10 < 4
        ? 'public'
        : index % 10 < 7
          ? 'all_universities'
          : 'selected_universities';
    const location =
      workMode === 'remote'
        ? 'Remote (Canada)'
        : weightedChoice(
            index,
            LOCATIONS.filter((entry) => entry !== 'Remote (Canada)')
          );
    const skillsRequired = pickMany(SKILL_TAXONOMY, 3, 7);
    const skillsPreferred = pickMany(
      SKILL_TAXONOMY.filter((skill) => !skillsRequired.includes(skill)),
      2,
      5
    );
    const [salaryMin, salaryMax] = inferSalary(title);
    const postedAt = randomRecentDate();
    const expiresAt = new Date(postedAt);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const job = await Job.create({
      title,
      description: buildJobDescription(
        title,
        employer.company.name,
        workMode,
        skillsRequired,
        skillsPreferred
      ),
      location,
      audienceType,
      employmentType: weightedChoice(index, EMPLOYMENT_TYPES),
      workMode,
      salaryMin,
      salaryMax,
      salaryCurrency: 'CAD',
      salaryPeriod: 'hourly',
      workTerm: weightedChoice(index, WORK_TERMS),
      durationMonths: weightedChoice(index, DURATION_OPTIONS),
      startDate: new Date('2026-05-01'),
      skillsRequired,
      skillsPreferred,
      gpaRequirement: index % 6 === 0 ? 3.0 : null,
      selectedUniversities:
        audienceType === 'selected_universities'
          ? pickMany(
              universities.map(({ university }) => university._id),
              1,
              3
            )
          : [],
      employer: employer.user._id,
      company: employer.company._id,
      isPromoted: index % 7 === 0,
      isEasyApply: index % 9 !== 0,
      postedAt,
      expiresAt,
      seedKey: `job-${index + 1}`,
    });

    jobs.push(job);
  }

  return jobs;
}

async function createApplicationsAndSavedJobs(jobs, students) {
  const applicationStatuses = [
    'submitted',
    'submitted',
    'in_review',
    'interview',
    'offer',
    'rejected',
  ];
  let applicationCounter = 0;

  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index];
    const targetApplications =
      index < 5
        ? 32
        : index < 20
          ? faker.number.int({ min: 10, max: 18 })
          : faker.number.int({ min: 2, max: 9 });
    const applicants = faker.helpers.arrayElements(
      students,
      targetApplications
    );

    for (const student of applicants) {
      const profile = await StudentProfile.findOne({
        user: student._id,
      }).lean();
      const status = weightedChoice(applicationCounter, applicationStatuses);
      const createdAt = faker.date.between({
        from: job.postedAt,
        to: new Date(),
      });

      await Application.create({
        job: job._id,
        student: student._id,
        resumeUrl: profile.defaultResumeUrl,
        resumeOriginalName: profile.defaultResumeOriginalName,
        coverLetter:
          applicationCounter % 3 === 0
            ? 'I am excited about this opportunity because it combines strong mentorship with real responsibility and a clear path to impact.'
            : '',
        status,
        statusHistory: buildStatusHistory(status, createdAt),
        viewedByEmployerAt:
          status !== 'submitted'
            ? faker.date.between({ from: createdAt, to: new Date() })
            : null,
        createdAt,
        updatedAt: new Date(),
        seedKey: `application-${job.seedKey}-${student._id}`,
      });

      applicationCounter += 1;
    }
  }

  const counts = await Application.aggregate([
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const jobCountMap = new Map(
    counts.map((entry) => [entry._id.toString(), entry.count])
  );

  for (const job of jobs) {
    job.applicantCount = jobCountMap.get(job._id.toString()) || 0;
    await job.save();
  }

  for (let index = 0; index < students.length; index += 1) {
    const student = students[index];
    const savedJobs = faker.helpers.arrayElements(
      jobs,
      faker.number.int({ min: 10, max: 30 })
    );

    for (const job of savedJobs) {
      await SavedJob.updateOne(
        { student: student._id, job: job._id },
        {
          $setOnInsert: {
            savedAt: faker.date.between({ from: job.postedAt, to: new Date() }),
          },
        },
        { upsert: true }
      );
    }

    const notifications = [
      {
        type: 'welcome',
        title: 'Your profile is ready',
        body: 'Explore recommendations and tailor your saved jobs list.',
        link: '/student',
      },
    ];

    const inFlightApplication = await Application.findOne({
      student: student._id,
      status: { $in: ['in_review', 'interview', 'offer'] },
    })
      .populate('job', 'title')
      .lean();

    if (inFlightApplication) {
      notifications.push({
        type: 'application_status',
        title: 'Application updated',
        body: `Your application for ${inFlightApplication.job.title} is now ${inFlightApplication.status.replaceAll('_', ' ')}.`,
        link: '/applications',
      });
    }

    for (const notification of notifications) {
      await Notification.create({
        user: student._id,
        ...notification,
        read: false,
      });
    }
  }
}

async function seedDatabase() {
  logger.info('Seeding database...');
  await clearSeededData();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const universities = await createUniversityAdmins(passwordHash);
  const employers = await createCompaniesAndEmployers(passwordHash);
  const students = await createStudentUsers(passwordHash, universities);
  const jobs = await createJobs(employers, universities);
  await createApplicationsAndSavedJobs(jobs, students);

  logger.info('Seed complete.', {
    universities: await University.countDocuments(),
    companies: await Company.countDocuments(),
    jobs: await Job.countDocuments(),
    students: await User.countDocuments({ role: 'student' }),
    applications: await Application.countDocuments(),
  });

  logger.info('Demo credentials', {
    employer: 'demo.employer@shopify.com / Demo123!',
    student: 'demo.student@bcit.ca / Demo123!',
    generalStudent: 'demo.general@gmail.com / Demo123!',
    universityAdmin: 'admin@bcit.ca / Demo123!',
  });
}

if (require.main === module) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      await closeDB();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      logger.error('Seed script failed.', { error: error.message });
      await closeDB();
      process.exit(1);
    });
}

module.exports = { seedDatabase };
