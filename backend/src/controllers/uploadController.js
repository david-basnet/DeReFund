const { eq } = require('drizzle-orm');
const { db } = require('../db/client');
const { users, userVerification, disasterCases } = require('../db/schema');
const { formatResponse } = require('../utils/helpers');
const { uploadToCloudinary } = require('../config/cloudinary');

const uploadNGODocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, 'No file uploaded'));
    }

    const userId = req.user.userId;
    const { document_type } = req.body;

    const [userRow] = await db.select({ role: users.role }).from(users).where(eq(users.user_id, userId)).limit(1);

    if (!userRow || userRow.role !== 'NGO') {
      return res.status(403).json(formatResponse(false, 'Only NGOs can upload verification documents'));
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // Upload to Cloudinary
    let cloudinaryUrl = '';
    try {
      const uploadResult = await uploadToCloudinary(fileBuffer, 'ngo_documents');
      cloudinaryUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      // Fallback to database storage if Cloudinary fails (optional, but good for robustness)
    }

    const [existing] = await db
      .select()
      .from(userVerification)
      .where(eq(userVerification.user_id, userId))
      .limit(1);

    let resultRow;
    if (existing) {
      const [row] = await db
        .update(userVerification)
        .set({
          document_file: fileBuffer,
          document_filename: fileName,
          document_mimetype: mimeType,
          document_type: document_type || 'REGISTRATION',
          document_url: cloudinaryUrl || '',
          status: 'PENDING',
          updated_at: new Date(),
        })
        .where(eq(userVerification.user_id, userId))
        .returning();
      resultRow = row;
    } else {
      const [row] = await db
        .insert(userVerification)
        .values({
          user_id: userId,
          document_type: document_type || 'REGISTRATION',
          document_file: fileBuffer,
          document_filename: fileName,
          document_mimetype: mimeType,
          document_url: cloudinaryUrl || '',
          status: 'PENDING',
        })
        .returning();
      resultRow = row;
    }

    res.json(
      formatResponse(true, 'Document uploaded successfully. Waiting for admin approval.', {
        verification_id: resultRow.verification_id,
        status: resultRow.status,
        url: resultRow.document_url,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getNGODocument = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const [actor] = await db.select({ role: users.role }).from(users).where(eq(users.user_id, currentUserId)).limit(1);

    const isAdmin = actor?.role === 'ADMIN';
    const isOwner = currentUserId === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json(formatResponse(false, 'Not authorized to view this document'));
    }

    const [verification] = await db
      .select({
        document_file: userVerification.document_file,
        document_filename: userVerification.document_filename,
        document_mimetype: userVerification.document_mimetype,
        document_url: userVerification.document_url,
      })
      .from(userVerification)
      .where(eq(userVerification.user_id, userId))
      .limit(1);

    if (!verification) {
      return res.status(404).json(formatResponse(false, 'Document not found'));
    }

    // If Cloudinary URL exists, redirect to it
    if (verification.document_url) {
      return res.redirect(verification.document_url);
    }

    // Fallback to binary data
    if (!verification.document_file) {
      return res.status(404).json(formatResponse(false, 'Document content not found'));
    }

    res.setHeader('Content-Type', verification.document_mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${verification.document_filename}"`);
    res.send(verification.document_file);
  } catch (error) {
    next(error);
  }
};

const uploadDisasterImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(formatResponse(false, 'No images uploaded'));
    }

    const userId = req.user.userId;
    const { case_id } = req.body;

    if (case_id) {
      const [disaster] = await db
        .select({ submitted_by: disasterCases.submitted_by })
        .from(disasterCases)
        .where(eq(disasterCases.case_id, case_id))
        .limit(1);

      if (!disaster) {
        return res.status(404).json(formatResponse(false, 'Disaster case not found'));
      }
      if (disaster.submitted_by !== userId) {
        return res.status(403).json(formatResponse(false, 'Not authorized to upload images for this disaster'));
      }
    }

    // Upload images to Cloudinary in parallel
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'disasters'));
    let cloudinaryUrls = [];
    try {
      const results = await Promise.all(uploadPromises);
      cloudinaryUrls = results.map(r => r.secure_url);
    } catch (uploadError) {
      console.error('Cloudinary multi-upload error:', uploadError);
    }

    const imageFiles = req.files.map((file) => file.buffer);
    const imageFilenames = req.files.map((file) => file.originalname);
    const imageMimetypes = req.files.map((file) => file.mimetype);

    if (case_id) {
      // Get existing images array to append to it
      const [existingDisaster] = await db
        .select({ images: disasterCases.images })
        .from(disasterCases)
        .where(eq(disasterCases.case_id, case_id))
        .limit(1);
      
      const updatedImages = [...(existingDisaster?.images || []), ...cloudinaryUrls];

      await db
        .update(disasterCases)
        .set({
          images: updatedImages,
          image_files: imageFiles,
          image_filenames: imageFilenames,
          image_mimetypes: imageMimetypes,
          updated_at: new Date(),
        })
        .where(eq(disasterCases.case_id, case_id));
    }

    res.json(
      formatResponse(true, 'Images uploaded successfully', {
        count: req.files.length,
        filenames: imageFilenames,
        urls: cloudinaryUrls,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getDisasterImage = async (req, res, next) => {
  try {
    const { caseId, imageIndex } = req.params;
    const index = parseInt(imageIndex, 10);

    const [disaster] = await db
      .select({
        image_files: disasterCases.image_files,
        image_filenames: disasterCases.image_filenames,
        image_mimetypes: disasterCases.image_mimetypes,
        images: disasterCases.images,
      })
      .from(disasterCases)
      .where(eq(disasterCases.case_id, caseId))
      .limit(1);

    if (!disaster) {
      return res.status(404).json(formatResponse(false, 'Disaster not found'));
    }

    // If Cloudinary URL exists at this index, redirect
    if (disaster.images && disaster.images[index]) {
      return res.redirect(disaster.images[index]);
    }

    // Fallback to binary data
    if (!disaster.image_files || !disaster.image_files[index]) {
      return res.status(404).json(formatResponse(false, 'Image not found'));
    }

    const imageFile = disaster.image_files[index];
    const filename = disaster.image_filenames[index];
    const mimetype = disaster.image_mimetypes[index];

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
  getDisasterImage,
};
