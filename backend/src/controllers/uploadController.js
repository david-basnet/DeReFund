const { pool } = require('../config/database');
const { formatResponse } = require('../utils/helpers');

// Upload NGO verification document
const uploadNGODocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'No file uploaded'));
    }

    const userId = req.user.userId;
    const { document_type } = req.body;

    // Check if user is NGO
    const userCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'NGO') {
      return res.status(403).json(formatResponse(false, 'Only NGOs can upload verification documents'));
    }

    // Store file in database
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // Check if verification record exists
    const existingVerification = await pool.query(
      'SELECT * FROM user_verification WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingVerification.rows.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE user_verification
        SET document_file = $1, document_filename = $2, document_mimetype = $3,
            document_type = $4, document_url = '', status = 'PENDING',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
        RETURNING *
      `;
      result = await pool.query(updateQuery, [
        fileBuffer, fileName, mimeType, document_type || 'REGISTRATION', userId
      ]);
    } else {
      // Create new verification record
      const insertQuery = `
        INSERT INTO user_verification (user_id, document_type, document_file, document_filename, document_mimetype, document_url, status)
        VALUES ($1, $2, $3, $4, $5, '', 'PENDING')
        RETURNING *
      `;
      result = await pool.query(insertQuery, [
        userId, document_type || 'REGISTRATION', fileBuffer, fileName, mimeType
      ]);
    }

    res.json(formatResponse(true, 'Document uploaded successfully. Waiting for admin approval.', {
      verification_id: result.rows[0].verification_id,
      status: result.rows[0].status
    }));
  } catch (error) {
    next(error);
  }
};

// Get NGO verification document (for download)
const getNGODocument = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Check if user is admin or the document owner
    const userCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [currentUserId]);
    const isAdmin = userCheck.rows.length > 0 && userCheck.rows[0].role === 'ADMIN';
    const isOwner = currentUserId === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json(formatResponse(false, 'Not authorized to view this document'));
    }

    const verification = await pool.query(
      'SELECT document_file, document_filename, document_mimetype FROM user_verification WHERE user_id = $1',
      [userId]
    );

    if (verification.rows.length === 0 || !verification.rows[0].document_file) {
      return res.status(404).json(formatResponse(false, 'Document not found'));
    }

    const { document_file, document_filename, document_mimetype } = verification.rows[0];

    res.setHeader('Content-Type', document_mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${document_filename}"`);
    res.send(document_file);
  } catch (error) {
    next(error);
  }
};

// Upload disaster images
const uploadDisasterImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(formatResponse(false, 'No images uploaded'));
    }

    const userId = req.user.userId;
    const { case_id } = req.body;

    // Check if disaster case exists and belongs to user (or is being created)
    if (case_id) {
      const disasterCheck = await pool.query(
        'SELECT submitted_by FROM disaster_cases WHERE case_id = $1',
        [case_id]
      );
      if (disasterCheck.rows.length === 0) {
        return res.status(404).json(formatResponse(false, 'Disaster case not found'));
      }
      if (disasterCheck.rows[0].submitted_by !== userId) {
        return res.status(403).json(formatResponse(false, 'Not authorized to upload images for this disaster'));
      }
    }

    // Process files
    const imageFiles = req.files.map(file => file.buffer);
    const imageFilenames = req.files.map(file => file.originalname);
    const imageMimetypes = req.files.map(file => file.mimetype);

    if (case_id) {
      // Update existing disaster case
      await pool.query(
        `UPDATE disaster_cases 
         SET image_files = $1, image_filenames = $2, image_mimetypes = $3, updated_at = CURRENT_TIMESTAMP
         WHERE case_id = $4`,
        [imageFiles, imageFilenames, imageMimetypes, case_id]
      );
    }

    res.json(formatResponse(true, 'Images uploaded successfully', {
      count: req.files.length,
      filenames: imageFilenames
    }));
  } catch (error) {
    next(error);
  }
};

// Get disaster image
const getDisasterImage = async (req, res, next) => {
  try {
    const { caseId, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    const disaster = await pool.query(
      'SELECT image_files, image_filenames, image_mimetypes FROM disaster_cases WHERE case_id = $1',
      [caseId]
    );

    if (disaster.rows.length === 0 || !disaster.rows[0].image_files || 
        !disaster.rows[0].image_files[index]) {
      return res.status(404).json(formatResponse(false, 'Image not found'));
    }

    const imageFile = disaster.rows[0].image_files[index];
    const filename = disaster.rows[0].image_filenames[index];
    const mimetype = disaster.rows[0].image_mimetypes[index];

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(imageFile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadNGODocument,
  getNGODocument,
  uploadDisasterImages,
  getDisasterImage
};

