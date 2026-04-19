const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.q) {
      query.name = new RegExp(req.query.q, 'i');
    }
    if (req.query.industry) {
      query.industry = new RegExp(req.query.industry, 'i');
    }
    if (req.query.location) {
      query.headquarters = new RegExp(req.query.location, 'i');
    }
    if (req.query.size) {
      query.headcountRange = req.query.size;
    }

    const [companies, total, jobsByCompany] = await Promise.all([
      Company.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Company.countDocuments(query),
      Job.aggregate([
        { $match: { company: { $ne: null } } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = new Map(
      jobsByCompany.map((entry) => [entry._id.toString(), entry.count])
    );
    res.json({
      data: companies.map((company) => ({
        ...company,
        openRoleCount: counts.get(company._id.toString()) || 0,
      })),
      companies: companies.map((company) => ({
        ...company,
        openRoleCount: counts.get(company._id.toString()) || 0,
      })),
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load companies.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug }).lean();
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    const jobs = await Job.find({ company: company._id })
      .sort({ postedAt: -1 })
      .lean();

    res.json({
      data: jobs,
      company,
      jobs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not load company profile.' });
  }
});

router.put('/:slug', protect, requireRole('employer'), async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company || company.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    Object.assign(company, req.body);
    await company.save();

    res.json({ company });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Could not update company.' });
  }
});

module.exports = router;
