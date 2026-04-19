const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const University = require('../models/University');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const { extractDomain, domainMatches } = require('../utils/extractDomain');
const slugify = require('../utils/slugify');
const { resolveStudentUniversity } = require('../utils/profileHelpers');
const { ensureAvatar, ensureCompanyLogo } = require('../utils/svgAssets');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, universityName, universityDomain } =
      req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'Please fill all required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (role === 'university') {
      if (!universityName || !universityDomain) {
        return res.status(400).json({
          message:
            'University name and domain are required for university registration.',
        });
      }

      const emailDomain = extractDomain(normalizedEmail);
      const normalizedUniversityDomain = universityDomain.toLowerCase().trim();

      if (!domainMatches(emailDomain, normalizedUniversityDomain)) {
        return res.status(400).json({
          message:
            'University login email domain must match the university domain.',
        });
      }

      const existingUniversity = await University.findOne({
        $or: [
          { name: universityName.trim() },
          { domain: normalizedUniversityDomain },
          { email: normalizedEmail },
        ],
      });

      if (existingUniversity) {
        return res.status(400).json({
          message:
            'University with this name, domain, or email already exists.',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    let createdUniversity = null;
    let createdCompany = null;

    if (role === 'university') {
      createdUniversity = await University.create({
        name: universityName.trim(),
        email: normalizedEmail,
        domain: universityDomain.toLowerCase().trim(),
        createdBy: user._id,
      });

      user.universityId = createdUniversity._id;
      await user.save();
    }

    if (role === 'employer') {
      const companyName = `${name.trim().split(' ')[0] || 'Demo'} Talent`;
      const slug = slugify(`${companyName}-${normalizedEmail}`);
      createdCompany = await Company.create({
        name: companyName,
        slug,
        logoUrl: ensureCompanyLogo(slug, companyName),
        website: `https://${slug}.com`,
        industry: 'Technology',
        headcountRange: '51-200 employees',
        headquarters: 'Vancouver, BC',
        about: `${companyName} is hiring through CoopCentral to connect with high-potential student talent across Canada.`,
        foundedYear: 2018,
        specialties: ['Hiring', 'Campus Talent', 'Product Development'],
        cultureTags: ['Career growth', 'Mentorship', 'Hybrid collaboration'],
        createdBy: user._id,
      });

      user.companyId = createdCompany._id;
      await user.save();
    }

    if (role === 'student') {
      const avatarSlug = slugify(normalizedEmail);
      await StudentProfile.create({
        user: user._id,
        headline: 'Student building momentum toward the next work term',
        about:
          'Curious builder focused on practical experience, collaborative teams, and meaningful work. Looking for opportunities to contribute, learn quickly, and grow through real product challenges.',
        skills: ['Communication', 'Problem solving', 'Teamwork'],
        avatarUrl: ensureAvatar(avatarSlug, name.trim()),
        location: 'Canada',
        workPreference: 'any',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        companyId: user.companyId,
      },
      university: createdUniversity,
      company: createdCompany,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Server error during login.' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    let linkedUniversity = null;
    let accessType = 'general';

    if (req.user.role === 'university' && req.user.universityId) {
      linkedUniversity = await University.findById(req.user.universityId);
      accessType = 'university_account';
    }

    if (req.user.role === 'student') {
      linkedUniversity = await resolveStudentUniversity(req.user.email);
      accessType = linkedUniversity
        ? 'verified_university_student'
        : 'general_student';
    }

    const company = req.user.companyId
      ? await Company.findById(req.user.companyId)
      : null;
    const studentProfile =
      req.user.role === 'student'
        ? await StudentProfile.findOne({ user: req.user._id })
        : null;

    res.json({
      user: req.user,
      linkedUniversity,
      accessType,
      company,
      studentProfile,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile.' });
  }
});

module.exports = router;
