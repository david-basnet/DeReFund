const { 
  createDisasterCase, 
  getDisasterCaseById, 
  getAllDisasterCases, 
  updateDisasterStatus,
  updateDisasterCase,
  deleteDisasterCase,
  requestDisasterApproval
} = require('../services/disasterService');
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

// Update disaster case
const update = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { title, description, location, severity, longitude, latitude, images, video } = req.body;
    const userId = req.user.userId;

    const disasterData = {
      title,
      description,
      location,
      severity,
      longitude: longitude || null,
      latitude: latitude || null,
      images: images || [],
      video: video || null
    };

    const disaster = await updateDisasterCase(caseId, userId, disasterData);
    res.json(formatResponse(true, 'Disaster case updated successfully', { disaster }));
  } catch (error) {
    next(error);
  }
};

// Delete disaster case
const remove = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;

    await deleteDisasterCase(caseId, userId);
    res.json(formatResponse(true, 'Disaster case deleted successfully'));
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
    const { page = 1, limit = 10, status, severity, submitted_by } = req.query;
    
    // Clean query parameters to avoid "undefined" strings
    const cleanSubmittedBy = (submitted_by === 'undefined' || submitted_by === 'null') ? null : submitted_by;
    const cleanStatus = (status === 'undefined' || status === 'null') ? null : status;
    const cleanSeverity = (severity === 'undefined' || severity === 'null') ? null : severity;

    const result = await getAllDisasterCases(
      parseInt(page, 10),
      parseInt(limit, 10),
      cleanStatus,
      cleanSeverity,
      cleanSubmittedBy || null
    );
    res.json(formatResponse(true, 'Disaster cases retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

const requestApproval = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const userId = req.user.userId;

    const disaster = await requestDisasterApproval(caseId, userId);
    res.json(formatResponse(true, 'Disaster case submitted for admin approval', { disaster }));
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
  update,
  remove,
  getById,
  getAll,
  requestApproval,
  updateStatus
};

