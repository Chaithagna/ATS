const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true,
  },
  fileSize: {
    type: Number,
  },
  extractedText: {
    type: String,
    required: true,
  },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [{
      role: String,
      company: String,
      duration: String,
      description: String,
    }],
    projects: [{
      title: String,
      description: String,
      techStack: [String],
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
