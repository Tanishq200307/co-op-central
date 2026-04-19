const express = require('express');
const { isValidObjectId } = require('mongoose');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const StudentProfile = require('../models/StudentProfile');
const University = require('../models/University');
const uploadResume = require('../middleware/uploadMiddleware');
const { protect, requireRole } = require('../middleware/authMiddleware');
const createNotification = require('../utils/createNotification');
const { resolveStudentUniversity } = require('../utils/profileHelpers');

const router = express.Router();

function csvToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => csvToArray(item));
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildEligibilityQuery(matchedUniversity) {
  if (!matchedUniversity) {
    return { audienceType: 'public' };
  }

  return {
    $or: [
      { audienceType: 'public' },
      { audienceType: 'all_universities' },
      {
        audienceType: 'selected_universities',
        selectedUniversities: matchedUniversity._id,
      },
    ],
  };
}

function buildSearchQuery(query) {
  const filters = [];

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), 'i');
    filters.push({
      $or: [
        { title: regex },
        { description: regex },
        { skillsRequired: regex },
        { skillsPreferred: regex },
      ],
    });
  }

  if (query.location) {
    filters.push({ location: new RegExp(escapeRegex(query.location), 'i') });
  }

  const workModes = csvToArray(query.workMode);
  if (workModes.length > 0) filters.push({ workMode: { $in: workModes } });

  const employmentTypes = csvToArray(query.employmentType);
  if (employmentTypes.length > 0)
    filters.push({ employmentType: { $in: employmentTypes } });

  const workTerms = csvToArray(query.workTerm);
  if (workTerms.length > 0) filters.push({ workTerm: { $in: workTerms } });

  const companies = csvToArray(query.company);
  if (companies.length > 0)
    filters.push({ 'companyDoc.slug': { $in: companies } });

  const skills = csvToArray(query.skills);
  if (skills.length > 0) {
    filters.push({
      $or: [
        { skillsRequired: { $in: skills } },
        { skillsPreferred: { $in: skills } },
      ],
    });
  }

  if (query.salaryMin) {
    filters.push({ salaryMax: { $gte: Number(query.salaryMin) } });
  }

  if (query.postedWithin) {
    const days = Number(query.postedWithin);
    const start = new Date();
    start.setDate(start.getDate() - days);
    filters.push({ postedAt: { $gte: start } });
  }

  if (query.easyApply === 'true') {
    filters.push({ isEasyApply: true });
  }

  const durations = csvToArray(query.duration).map(Number).filter(Boolean);
  if (durations.length > 0)
    filters.push({ durationMonths: { $in: durations } });

  return filters;
}

async function decorateJobsForStudent(jobs, studentId) {
  if (!studentId || jobs.length === 0) return jobs;

  const [applications, savedJobs] = await Promise.all([
    Application.find({
      student: studentId,
      job: { $in: jobs.map((job) => job._id) },
    })
      .select('job status createdAt')
      .lean(),
    SavedJob.find({
      student: studentId,
      job: { $in: jobs.map((job) => job._id) },
    })
      .select('job savedAt')
      .lean(),
  ]);

  const appliedMap = new Map(
    applications.map((application) => [application.job.toString(), application])
  );
  const savedMap = new Map(
    savedJobs.map((saved) => [saved.job.toString(), saved.savedAt])
  );

  return jobs.map((job) => ({
    ...job,
    hasApplied: appliedMap.has(job._id.toString()),
    applicationStatus: appliedMap.get(job._id.toString())?.status || null,
    isSaved: savedMap.has(job._id.toString()),
    savedAt: savedMap.get(job._id.toString()) || null,
  }));
}

router.get('/search', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 25));
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'relevance';

    const pipeline = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyDoc',
        },
      },
      {
        $unwind: {
          path: '$companyDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const filters = buildSearchQuery(req.query);
    if (filters.length > 0) {
      pipeline.push({ $match: { $and: filters } });
    }

    const sortStage = (() => {
      if (sort === 'salary') return { salaryMax: -1, postedAt: -1 };
      if (sort === 'date') return { postedAt: -1 };
      return { isPromoted: -1, postedAt: -1, applicantCount: -1 };
    })();

    const baseProjection = {
      title: 1,
      description: 1,
      location: 1,
      audienceType: 1,
      employmentType: 1,
      workMode: 1,
      salaryMin: 1,
      salaryMax: 1,
      salaryCurrency: 1,
      salaryPeriod: 1,
      workTerm: 1,
      durationMonths: 1,
      startDate: 1,
      skillsRequired: 1,
      skillsPreferred: 1,
      gpaRequirement: 1,
      selectedUniversities: 1,
      employer: 1,
      company: '$companyDoc',
      viewCount: 1,
      applicantCount: 1,
      isPromoted: 1,
      isEasyApply: 1,
      postedAt: 1,
      expiresAt: 1,
    };

    const [jobs, countResults, facetResults] = await Promise.all([
      Job.aggregate([
        ...pipeline,
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        { $project: baseProjection },
      ]),
      Job.aggregate([...pipeline, { $count: 'total' }]),
      Job.aggregate([
        ...pipeline,
        {
          $facet: {
            workMode: [{ $sortByCount: '$workMode' }],
            employmentType: [{ $sortByCount: '$employmentType' }],
            skills: [
              {
                $project: {
                  combinedSkills: {
                    $concatArrays: ['$skillsRequired', '$skillsPreferred'],
                  },
                },
              },
              { $unwind: '$combinedSkills' },
              { $sortByCount: '$combinedSkills' },
              { $limit: 10 },
            ],
            companies: [
              {
                $group: {
                  _id: '$companyDoc.slug',
                  label: { $first: '$companyDoc.name' },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1, label: 1 } },
              { $limit: 10 },
            ],
          },
        },
      ]),
    ]);

    res.json({
      jobs,
      total: countResults[0]?.total || 0,
      page,
      pageSize: limit,
      facets: {
        workMode: facetResults[0]?.workMode || [],
        employmentType: facetResults[0]?.employmentType || [],
        topSkills: facetResults[0]?.skills || [],
        topCompanies: facetResults[0]?.companies || [],
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not search jobs.' });
  }
});

router.get(
  '/recommended',
  protect,
  requireRole('student'),
  async (req, res) => {
    try {
      const [matchedUniversity, profile] = await Promise.all([
        resolveStudentUniversity(req.user.email),
        StudentProfile.findOne({ user: req.user._id }).lean(),
      ]);

      const skills = profile?.skills || [];
      const query = buildEligibilityQuery(matchedUniversity);

      const jobs = await Job.find(query)
        .populate('company')
        .sort({ postedAt: -1 })
        .lean();

      const scored = jobs
        .map((job) => {
          const requiredMatches = job.skillsRequired.filter((skill) =>
            skills.includes(skill)
          ).length;
          const preferredMatches = job.skillsPreferred.filter((skill) =>
            skills.includes(skill)
          ).length;
          const universityBoost =
            matchedUniversity &&
            (job.audienceType === 'all_universities' ||
              job.selectedUniversities.some(
                (id) => id.toString() === matchedUniversity._id.toString()
              ))
              ? 2
              : 0;

          return {
            ...job,
            recommendationScore:
              requiredMatches * 3 + preferredMatches * 2 + universityBoost,
          };
        })
        .sort(
          (left, right) =>
            right.recommendationScore - left.recommendationScore ||
            new Date(right.postedAt) - new Date(left.postedAt)
        )
        .slice(0, 6);

      const decorated = await decorateJobsForStudent(scored, req.user._id);
      res.json({ jobs: decorated });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Could not load recommendations.' });
    }
  }
);

router.get('/saved', protect, requireRole('student'), async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
        },
      })
      .sort({ savedAt: -1 })
      .lean();

    const jobs = savedJobs
      .filter((entry) => entry.job)
      .map((entry) => ({
        ...entry.job,
        isSaved: true,
        savedAt: entry.savedAt,
      }));

    res.json({ jobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load saved jobs.' });
  }
});

router.post('/:id/save', protect, requireRole('student'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const savedJob = await SavedJob.findOneAndUpdate(
      { student: req.user._id, job: job._id },
      { $setOnInsert: { savedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ savedJob });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not save this job.' });
  }
});

router.delete(
  '/:id/save',
  protect,
  requireRole('student'),
  async (req, res) => {
    try {
      await SavedJob.findOneAndDelete({
        student: req.user._id,
        job: req.params.id,
      });
      res.json({ message: 'Job removed from saved list.' });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Could not remove saved job.' });
    }
  }
);

router.get('/similar/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { company: job.company },
        { workMode: job.workMode },
        { skillsRequired: { $in: job.skillsRequired.slice(0, 3) } },
      ],
    })
      .populate('company')
      .sort({ postedAt: -1 })
      .limit(5)
      .lean();

    res.json({ jobs: similarJobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load similar jobs.' });
  }
});

router.get(
  '/my-jobs/applicants',
  protect,
  requireRole('employer'),
  async (req, res) => {
    try {
      const jobs = await Job.find({ employer: req.user._id })
        .populate('company')
        .populate('selectedUniversities', 'name domain')
        .sort({ postedAt: -1 })
        .lean();

      const jobIds = jobs.map((job) => job._id);
      const applications = await Application.find({ job: { $in: jobIds } })
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      const studentIds = applications
        .map((application) => application.student?._id)
        .filter(Boolean);
      const profiles = await StudentProfile.find({
        user: { $in: studentIds },
      }).lean();
      const profileMap = new Map(
        profiles.map((profile) => [profile.user.toString(), profile])
      );

      const applicationsByJob = new Map();
      for (const application of applications) {
        const jobId = application.job.toString();
        const existing = applicationsByJob.get(jobId) || [];
        existing.push({
          ...application,
          profile: application.student
            ? profileMap.get(application.student._id.toString()) || null
            : null,
        });
        applicationsByJob.set(jobId, existing);
      }

      const jobsWithApplicants = jobs.map((job) => ({
        ...job,
        applicants: applicationsByJob.get(job._id.toString()) || [],
      }));

      res.json({ jobs: jobsWithApplicants });
    } catch (error) {
      res
        .status(500)
        .json({
          message: error.message || 'Could not load employer applicants.',
        });
    }
  }
);

router.get('/my-jobs', protect, requireRole('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate('company')
      .populate('selectedUniversities', 'name domain')
      .sort({ postedAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your jobs.' });
  }
});

router.get('/eligible', protect, requireRole('student'), async (req, res) => {
  try {
    const matchedUniversity = await resolveStudentUniversity(req.user.email);
    const jobs = await Job.find(buildEligibilityQuery(matchedUniversity))
      .populate('company')
      .populate('selectedUniversities', 'name domain')
      .sort({ postedAt: -1 })
      .lean();

    const jobsWithStatus = await decorateJobsForStudent(jobs, req.user._id);

    res.json({
      matchedUniversity,
      jobs: jobsWithStatus,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not fetch eligible jobs.' });
  }
});

router.get('/public', async (_req, res) => {
  try {
    const jobs = await Job.find({ audienceType: 'public' })
      .populate('company')
      .sort({ postedAt: -1 })
      .limit(25);

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch public jobs.' });
  }
});

router.post('/', protect, requireRole('employer'), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      audienceType,
      selectedUniversities = [],
      employmentType = 'coop',
      workMode = 'hybrid',
      salaryMin,
      salaryMax,
      salaryCurrency = 'CAD',
      salaryPeriod = 'hourly',
      workTerm,
      durationMonths,
      startDate,
      skillsRequired = [],
      skillsPreferred = [],
      gpaRequirement,
      isPromoted = false,
      isEasyApply = true,
      expiresAt,
    } = req.body;

    if (!title || !description || !audienceType) {
      return res.status(400).json({
        message: 'Title, description, and audience type are required.',
      });
    }

    if (
      audienceType === 'selected_universities' &&
      (!Array.isArray(selectedUniversities) ||
        selectedUniversities.length === 0)
    ) {
      return res.status(400).json({
        message: 'Please select at least one university.',
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() || 'Remote (Canada)',
      audienceType,
      employmentType,
      workMode,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      workTerm,
      durationMonths,
      startDate: startDate || null,
      skillsRequired,
      skillsPreferred,
      gpaRequirement,
      selectedUniversities:
        audienceType === 'selected_universities' ? selectedUniversities : [],
      employer: req.user._id,
      company: req.user.companyId || null,
      isPromoted,
      isEasyApply,
      expiresAt,
    });

    const populatedJob = await Job.findById(job._id)
      .populate('company')
      .populate('selectedUniversities', 'name domain');

    res.status(201).json({
      message: 'Job created successfully.',
      job: populatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not create job.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('company')
      .populate('selectedUniversities', 'name domain')
      .lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { company: job.company?._id || null },
        { skillsRequired: { $in: job.skillsRequired.slice(0, 3) } },
        { workMode: job.workMode },
      ],
    })
      .populate('company')
      .sort({ postedAt: -1 })
      .limit(4)
      .lean();

    res.json({ job, similarJobs });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not load job.' });
  }
});

router.post(
  '/:jobId/apply',
  protect,
  requireRole('student'),
  uploadResume.single('resume'),
  async (req, res) => {
    try {
      const [matchedUniversity, job, profile] = await Promise.all([
        resolveStudentUniversity(req.user.email),
        Job.findById(req.params.jobId),
        StudentProfile.findOne({ user: req.user._id }),
      ]);

      if (!job) {
        return res.status(404).json({ message: 'Job not found.' });
      }

      const eligibilityQuery = buildEligibilityQuery(matchedUniversity);
      const eligibleJobIds = await Job.find({
        ...eligibilityQuery,
        _id: job._id,
      }).select('_id');

      if (eligibleJobIds.length === 0) {
        return res.status(403).json({
          message: 'You are not eligible to apply for this job.',
        });
      }

      const existingApplication = await Application.findOne({
        job: job._id,
        student: req.user._id,
      });

      if (existingApplication) {
        return res.status(400).json({
          message: 'You have already applied for this role.',
        });
      }

      const resumeUrl = req.file
        ? `/uploads/resumes/${req.file.filename}`
        : profile?.defaultResumeUrl;
      const resumeOriginalName =
        req.file?.originalname || profile?.defaultResumeOriginalName;

      if (!resumeUrl || !resumeOriginalName) {
        return res.status(400).json({ message: 'Resume is required.' });
      }

      const application = await Application.create({
        job: job._id,
        student: req.user._id,
        resumeUrl,
        resumeOriginalName,
        coverLetter: req.body.coverLetter || '',
        statusHistory: [
          {
            status: 'submitted',
            changedAt: new Date(),
            note: 'Application submitted through Easy Apply.',
          },
        ],
      });

      await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

      await createNotification({
        user: req.user._id,
        type: 'application_submitted',
        title: 'Application submitted',
        body: `Your application for ${job.title} has been submitted.`,
        link: '/applications',
      });

      res.status(201).json({
        message: 'Applied successfully.',
        application,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || 'Could not apply for this job.' });
    }
  }
);

module.exports = router;
