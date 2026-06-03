const express = require('express');
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const Report = require('../models/Report');
const { calculateATS } = require('../services/scoringEngine');
const { generateAISuggestions, rewriteBulletPoint, generateCoverLetter } = require('../services/ragService');
const router = express.Router();

/**
 * @route   POST /api/analysis/process
 * @desc    Analyze resume against job description (Core RAG + ATS scoring pipeline)
 * @access  Private
 */
router.post('/process', protect, async (req, res) => {
  try {
    const { resumeId, jobDescription, jobTitle } = req.body;
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, error: 'Please provide resumeId and jobDescription' });
    }
    // 1. Get resume details
    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Capture Gemini/Pinecone Keys if custom configured on User profile
    const userGeminiKey = req.user.settings?.geminiKey || '';

    // 2. Perform score audits (Keywords, Cosine Similarity, Formatting, Experience)
    console.log(`[Scoring System] Auditing resume ${resumeId} for target role.`);
    const auditData = await calculateATS(resume.extractedText, jobDescription, resume.parsedData, userGeminiKey);

    // 3. Generate context-aware AI suggestions via RAG architecture
    console.log('[RAG Pipeline] Retrieval triggers initiated.');
    let aiData;
    try {
      aiData = await generateAISuggestions(
        resume.extractedText,
        jobDescription,
        auditData.scores.overall,
        userGeminiKey
      );
    } catch (err) {
      if (err && err.message === 'INVALID_API_KEY') {
        console.error('[RAG Pipeline] Invalid Gemini API key:', err.details || err.message);
        return res.status(401).json({ success: false, error: 'Invalid Gemini API key. Please update your GEMINI_API_KEY in server environment or user settings.' });
      }
      throw err;
    }

    // 4. Create and Save overall ATS report to Database
    const report = await Report.create({
      user: req.user.id,
      resume: resumeId,
      jobDescription,
      jobTitle: jobTitle || 'Target Position',
      scores: auditData.scores,
      keywordAnalysis: auditData.keywordAnalysis,
      skillGap: auditData.skillGap,
      formattingAnalysis: {
        readabilityScore: auditData.formattingAnalysis.readabilityScore,
        hasContactInfo: auditData.formattingAnalysis.hasContactInfo,
        hasSectionHeaders: auditData.formattingAnalysis.hasSectionHeaders,
        formattingTips: auditData.formattingAnalysis.formattingTips,
        warnings: auditData.formattingAnalysis.warnings
      },
      aiSuggestions: {
        generalTips: aiData.generalTips || [],
        strongerBulletPoints: aiData.strongerBulletPoints || [],
        projectImprovements: aiData.projectImprovements || [],
        roleSpecificAdvice: aiData.roleSpecificAdvice || ''
      },
      interviewPrep: aiData.interviewPrep || [],
      careerRecommendations: aiData.careerRecommendations || { roles: [], upskillRoadmap: [], alignmentPrediction: 50 }
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('[Analysis Process Router Error]', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/analysis/history
 * @desc    Fetch ATS report history for dashboard charting
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .select('jobTitle scores createdAt')
      .populate('resume', 'fileName')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/analysis/report/:id
 * @desc    Fetch single comprehensive ATS report
 * @access  Private
 */
router.get('/report/:id', protect, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user.id })
      .populate('resume', 'fileName fileSize fileType');

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/analysis/rewrite
 * @desc    Rewrite specific bullet point or section dynamically
 * @access  Private
 */
router.post('/rewrite', protect, async (req, res) => {
  try {
    const { bulletText, instruction } = req.body;

    if (!bulletText) {
      return res.status(400).json({ success: false, error: 'Bullet text is required' });
    }

    const userGeminiKey = req.user.settings?.geminiKey || '';
    try {
      const optimizedText = await rewriteBulletPoint(bulletText, instruction || 'Optimize for readability and impact.', userGeminiKey);
      res.json({ success: true, optimizedText });
    } catch (err) {
      if (err && err.message === 'INVALID_API_KEY') {
        return res.status(401).json({ success: false, error: 'Invalid Gemini API key. Please update your GEMINI_API_KEY in server environment or user settings.' });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/analysis/coverletter
 * @desc    Generate customized cover letter based on resume context
 * @access  Private
 */
router.post('/coverletter', protect, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, error: 'ResumeId and Job Description are required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const userGeminiKey = req.user.settings?.geminiKey || '';
    try {
      const coverLetter = await generateCoverLetter(resume.extractedText, jobDescription, userGeminiKey);
      res.json({ success: true, coverLetter });
    } catch (err) {
      if (err && err.message === 'INVALID_API_KEY') {
        return res.status(401).json({ success: false, error: 'Invalid Gemini API key. Please update your GEMINI_API_KEY in server environment or user settings.' });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/analysis/compare
 * @desc    Compare version reports (Old vs Improved ATS comparison)
 * @access  Private
 */
router.post('/compare', protect, async (req, res) => {
  try {
    const { originalReportId, improvedReportId } = req.body;

    if (!originalReportId || !improvedReportId) {
      return res.status(400).json({ success: false, error: 'Original and Improved report ids required' });
    }

    const originalReport = await Report.findOne({ _id: originalReportId, user: req.user.id });
    const improvedReport = await Report.findOne({ _id: improvedReportId, user: req.user.id });

    if (!originalReport || !improvedReport) {
      return res.status(404).json({ success: false, error: 'One or both reports not found.' });
    }

    const comparison = {
      scoreDiff: improvedReport.scores.overall - originalReport.scores.overall,
      keywordDiff: improvedReport.scores.keywordMatch - originalReport.scores.keywordMatch,
      semanticDiff: improvedReport.scores.semanticSimilarity - originalReport.scores.semanticSimilarity,
      addedKeywords: improvedReport.keywordAnalysis.matched.filter(k => !originalReport.keywordAnalysis.matched.includes(k)),
      removedMissingKeywords: originalReport.keywordAnalysis.missing.filter(k => !improvedReport.keywordAnalysis.missing.includes(k)),
      oldScore: originalReport.scores.overall,
      newScore: improvedReport.scores.overall
    };

    res.json({
      success: true,
      comparison,
      originalReport,
      improvedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
