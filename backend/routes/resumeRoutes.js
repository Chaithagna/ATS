const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const { parsePDF, parseDOCX, parseStructuredData } = require('../services/parserService');
const router = express.Router();

// Configure Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
    const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.originalname.endsWith('.docx');
    
    if (isPdf || isDocx) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and DOCX uploads are supported.'));
    }
  }
});

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload a new resume & parse text contents
 * @access  Private
 */
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const fileType = req.file.originalname.endsWith('.docx') ? 'docx' : 'pdf';
    let text = '';

    // Extract text content based on file type
    if (fileType === 'pdf') {
      text = await parsePDF(req.file.buffer);
    } else {
      text = await parseDOCX(req.file.buffer);
    }

    if (!text || text.trim().length === 0) {
      return res.status(422).json({ success: false, error: 'Unable to extract text content from file. The document may be empty or encrypted.' });
    }

    // Heuristically extract structural fields
    const parsedData = parseStructuredData(text);

    // Save resume to DB
    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      extractedText: text,
      parsedData
    });

    res.status(201).json({
      success: true,
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        parsedData: resume.parsedData
      }
    });
  } catch (error) {
    console.error('[Resume Upload Router Error]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/resumes
 * @desc    List all resumes for the authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('fileName fileType fileSize createdAt parsedData')
      .sort('-createdAt');

    res.json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/resumes/:id
 * @desc    Retrieve a single resume and its contents
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    res.json({
      success: true,
      resume
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume from history
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
