const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    default: 'Target Role',
  },
  scores: {
    overall: { type: Number, default: 0 },
    keywordMatch: { type: Number, default: 0 },
    semanticSimilarity: { type: Number, default: 0 },
    projectQuality: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 }
  },
  keywordAnalysis: {
    matched: [String],
    missing: [String],
    density: [{
      keyword: String,
      count: Number,
      recommendedCount: Number
    }]
  },
  skillGap: {
    matchedSkills: [String],
    missingSkills: [String],
    recommendedTechnologies: [String],
    suggestedCertifications: [String]
  },
  formattingAnalysis: {
    readabilityScore: { type: Number, default: 0 }, // Flesch-Kincaid stub
    hasContactInfo: { type: Boolean, default: true },
    hasSectionHeaders: { type: Boolean, default: true },
    formattingTips: [String],
    warnings: [String]
  },
  aiSuggestions: {
    generalTips: [String],
    strongerBulletPoints: [{
      original: String,
      improved: String,
      rationale: String
    }],
    projectImprovements: [{
      title: String,
      original: String,
      improved: String,
      rationale: String
    }],
    roleSpecificAdvice: String
  },
  interviewPrep: [{
    category: { type: String, enum: ['Technical', 'HR', 'System Design', 'Behavioral'] },
    question: String,
    suggestedAnswer: String,
    keyFocusPoints: [String]
  }],
  careerRecommendations: {
    roles: [String],
    upskillRoadmap: [String],
    alignmentPrediction: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', ReportSchema);
