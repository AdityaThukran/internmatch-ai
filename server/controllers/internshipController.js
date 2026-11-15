const Internship = require('../models/Internship');
const { formatResponse } = require('../utils/helpers');

/**
 * @route   GET /api/internships
 * @desc    Get internships with search, filter, and pagination
 * @access  Public
 */
const getInternships = async (req, res) => {
  try {
    const {
      search,
      skills,
      location,
      mode,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { isActive: true };

    // Text search on title, organization, description
    if (search) {
      filter.$text = { $search: search };
    }

    // Skills filter (comma-separated)
    if (skills) {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillsArray.length > 0) {
        filter.skills = {
          $in: skillsArray.map((s) => new RegExp(s, 'i')),
        };
      }
    }

    // Location filter
    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    // Mode filter
    if (mode && ['remote', 'onsite', 'hybrid'].includes(mode)) {
      filter.mode = mode;
    }

    // Build sort
    let sort = { postedAt: -1 };
    if (search) {
      sort = { score: { $meta: 'textScore' }, postedAt: -1 };
    }

    // Execute query with pagination
    const [internships, total] = await Promise.all([
      search
        ? Internship.find(filter, { score: { $meta: 'textScore' } })
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
        : Internship.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum),
      Internship.countDocuments(filter),
    ]);

    return res.status(200).json(
      formatResponse(true, 'Internships retrieved successfully', {
        internships,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      })
    );
  } catch (error) {
    console.error('GetInternships error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving internships'));
  }
};

/**
 * @route   GET /api/internships/:id
 * @desc    Get single internship by ID
 * @access  Public
 */
const getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!internship) {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }

    return res
      .status(200)
      .json(
        formatResponse(true, 'Internship retrieved successfully', internship)
      );
  } catch (error) {
    console.error('GetInternship error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }
    return res
      .status(500)
      .json(formatResponse(false, 'Server error retrieving internship'));
  }
};

/**
 * @route   POST /api/internships
 * @desc    Create a new internship
 * @access  Private (admin/recruiter)
 */
const createInternship = async (req, res) => {
  try {
    const {
      title,
      organization,
      description,
      skills,
      eligibility,
      location,
      mode,
      stipend,
      duration,
      source,
      applyUrl,
      deadline,
    } = req.body;

    if (!title || !organization || !description) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            'Title, organization, and description are required'
          )
        );
    }

    const internship = await Internship.create({
      title,
      organization,
      description,
      skills: skills || [],
      eligibility: eligibility || '',
      location: location || '',
      mode: mode || 'onsite',
      stipend: stipend || '',
      duration: duration || '',
      source: source || '',
      applyUrl: applyUrl || '',
      deadline: deadline || null,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json(
        formatResponse(true, 'Internship created successfully', internship)
      );
  } catch (error) {
    console.error('CreateInternship error:', error.message);
    return res
      .status(500)
      .json(formatResponse(false, 'Server error creating internship'));
  }
};

/**
 * @route   PUT /api/internships/:id
 * @desc    Update an internship
 * @access  Private (admin/recruiter)
 */
const updateInternship = async (req, res) => {
  try {
    const allowedFields = [
      'title',
      'organization',
      'description',
      'skills',
      'eligibility',
      'location',
      'mode',
      'stipend',
      'duration',
      'source',
      'applyUrl',
      'deadline',
      'isActive',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!internship) {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }

    return res
      .status(200)
      .json(
        formatResponse(true, 'Internship updated successfully', internship)
      );
  } catch (error) {
    console.error('UpdateInternship error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }
    return res
      .status(500)
      .json(formatResponse(false, 'Server error updating internship'));
  }
};

/**
 * @route   DELETE /api/internships/:id
 * @desc    Soft delete an internship (set isActive=false)
 * @access  Private (admin only)
 */
const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!internship) {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }

    return res
      .status(200)
      .json(
        formatResponse(true, 'Internship deleted successfully', internship)
      );
  } catch (error) {
    console.error('DeleteInternship error:', error.message);
    if (error.kind === 'ObjectId') {
      return res
        .status(404)
        .json(formatResponse(false, 'Internship not found'));
    }
    return res
      .status(500)
      .json(formatResponse(false, 'Server error deleting internship'));
  }
};

module.exports = {
  getInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
};
