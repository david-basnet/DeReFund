const { createDisasterCase, getDisasterCaseById, getAllDisasterCases, updateDisasterStatus } = require('../models/disasterModel');
const { formatResponse } = require('../utils/helpers');

// Create disaster case
const create = async (req, res, next) => {
  try {
    const { title, description, location, severity, longitude, latitude, images, video } = req.body;
    const submitted_by = req.user.userId;

    const disasterData = {
      submitted_by,
      title,
      description,
      location,
      severity: severity || 'MEDIUM',
      longitude: longitude || null,
      latitude: latitude || null,
      images: images || [],
      video: video || null
    };

    const disaster = await createDisasterCase(disasterData);
    res.status(201).json(formatResponse(true, 'Disaster case submitted successfully', { disaster }));
  } catch (error) {
    next(error);
  }
};

// Get disaster case by ID
const getById = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const disaster = await getDisasterCaseById(caseId);

    if (!disaster) {
      return res.status(404).json(formatResponse(false, 'Disaster case not found'));
    }

    res.json(formatResponse(true, 'Disaster case retrieved successfully', { disaster }));
  } catch (error) {
    next(error);
  }
};

// Get all disaster cases
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, severity } = req.query;
    const result = await getAllDisasterCases(parseInt(page), parseInt(limit), status, severity);
    res.json(formatResponse(true, 'Disaster cases retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

// Approve/Reject disaster case (Admin only)
const updateStatus = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json(formatResponse(false, 'Status must be APPROVED or REJECTED'));
    }

    const disaster = await updateDisasterStatus(caseId, status, req.user.userId);
    res.json(formatResponse(true, `Disaster case ${status.toLowerCase()} successfully`, { disaster }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getAll,
  updateStatus
};

