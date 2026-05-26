const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Report = require('../models/Report');
const { parsePDF, parseDOCX, parseStructuredData } = require('../services/parserService');
const { calculateATS } = require('../services/scoringEngine');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * @route   POST /api/recruiter/analyze-batch
 * @desc    Upload multiple resumes and rank them against a target job description
 * @access  Private (Recruiter / Admin roles protected)
 */
router.post('/analyze-batch', protect, authorize('recruiter', 'admin', 'user'), upload.array('resumes', 15), async (req, res) => {
  try {
    const { jobDescription, jobTitle } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, error: 'Job description is required to rank candidate profiles.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one resume' });
    }

    const leaderboard = [];
    const userGeminiKey = req.user.settings?.geminiKey || '';

    // Loop through files sequentially
    for (const file of req.files) {
      try {
        const fileType = file.originalname.endsWith('.docx') ? 'docx' : 'pdf';
        let extractedText = '';

        if (fileType === 'pdf') {
          extractedText = await parsePDF(file.buffer);
        } else {
          extractedText = await parseDOCX(file.buffer);
        }

        if (!extractedText || extractedText.trim().length === 0) {
          continue; // skip unparseable
        }

        const parsedStructured = parseStructuredData(extractedText);

        // Run analysis calculations
        const analysis = await calculateATS(extractedText, jobDescription, parsedStructured, userGeminiKey);

        // Save resume database entry for referencing
        const resumeObj = await Resume.create({
          user: req.user.id,
          fileName: file.originalname,
          fileType,
          fileSize: file.size,
          extractedText,
          parsedData: parsedStructured
        });

        // Save individual report
        const reportObj = await Report.create({
          user: req.user.id,
          resume: resumeObj._id,
          jobDescription,
          jobTitle: jobTitle || 'Recruiter Job Matching',
          scores: analysis.scores,
          keywordAnalysis: analysis.keywordAnalysis,
          skillGap: analysis.skillGap,
          formattingAnalysis: {
            readabilityScore: analysis.formattingAnalysis.readabilityScore,
            hasContactInfo: analysis.formattingAnalysis.hasContactInfo,
            hasSectionHeaders: analysis.formattingAnalysis.hasSectionHeaders,
            formattingTips: analysis.formattingAnalysis.formattingTips,
            warnings: analysis.formattingAnalysis.warnings
          },
          aiSuggestions: {
            generalTips: ['Optimized for batch recruiter dashboard panel.'],
            strongerBulletPoints: [],
            projectImprovements: [],
            roleSpecificAdvice: 'Recruiter overview complete.'
          }
        });

        leaderboard.push({
          candidateName: parsedStructured.name || file.originalname.split('.')[0],
          fileName: file.originalname,
          resumeId: resumeObj._id,
          reportId: reportObj._id,
          email: parsedStructured.email || 'N/A',
          phone: parsedStructured.phone || 'N/A',
          skillsCount: parsedStructured.skills.length,
          scores: analysis.scores
        });
      } catch (err) {
        console.error(`[Recruiter Batch Error] Skipped corrupted resume file ${file.originalname}:`, err.message);
      }
    }

    // Sort leaderboard by overall ATS score descending
    leaderboard.sort((a, b) => b.scores.overall - a.scores.overall);

    res.json({
      success: true,
      count: leaderboard.length,
      jobTitle: jobTitle || 'Target Role',
      leaderboard
    });
  } catch (error) {
    console.error('[Recruiter Router Error]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
