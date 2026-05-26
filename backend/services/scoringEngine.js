const { compareSemanticSimilarity } = require('./vectorService');

/**
 * Clean text and extract key phrases/words
 */
const getKeywords = (text) => {
  if (!text) return [];
  return text.toLowerCase()
    .replace(/[^a-zA-Z0-9\s#-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !/this|that|with|have|from|your|their|about/i.test(word));
};

/**
 * Evaluates Project Quality (15%) based on bullet point impact, numbers/metrics, and action verbs.
 */
const evaluateProjects = (projectsText) => {
  if (!projectsText) return { score: 50, findings: ['No clear projects section found'] };

  let score = 60; // base score
  const findings = [];

  // 1. Metric check (quantified results like %, $, numbers, metrics)
  const metricRegex = /\b(\d+%|\$\d+|million|billion|reduced|increased\s*by\s*\d+|saved\s*\d+)\b/gi;
  const metricsMatched = projectsText.match(metricRegex);
  if (metricsMatched && metricsMatched.length > 0) {
    score += Math.min(metricsMatched.length * 8, 20);
    findings.push(`Excellent: Found ${metricsMatched.length} instances of quantified impact metrics (e.g. %, $).`);
  } else {
    score -= 10;
    findings.push('Suggestion: Quantify your project achievements using metrics (e.g., "Increased load speed by 40%").');
  }

  // 2. Action verbs check
  const actionVerbs = /\b(built|designed|implemented|optimized|developed|led|architected|created|integrated|automated|streamlined)\b/gi;
  const verbsMatched = projectsText.match(actionVerbs);
  if (verbsMatched && verbsMatched.length > 0) {
    score += Math.min(verbsMatched.length * 4, 15);
    findings.push(`Good: Used action verbs such as: ${[...new Set(verbsMatched)].slice(0, 3).join(', ')}.`);
  } else {
    score -= 8;
    findings.push('Suggestion: Begin your project bullets with strong action verbs (e.g., "Architected dynamic components...").');
  }

  // 3. Length checks
  if (projectsText.length > 500) {
    score += 5;
    findings.push('Good: Project descriptions are detailed and technically robust.');
  }

  return {
    score: Math.min(Math.max(score, 10), 100),
    findings
  };
};

/**
 * Evaluates Formatting parameters (10%)
 */
const evaluateFormatting = (text, structured) => {
  let score = 80; // starts high
  const tips = [];
  const warnings = [];

  // Check email
  if (structured.email) {
    score += 5;
  } else {
    score -= 15;
    warnings.push('Contact Information Missing: Email not detected.');
    tips.push('Ensure your email address is listed prominently at the top.');
  }

  // Check phone
  if (structured.phone) {
    score += 5;
  } else {
    score -= 10;
    warnings.push('Contact Information Missing: Phone number not found.');
    tips.push('Add your telephone number to allow recruiter callbacks.');
  }

  // Check sections
  if (structured.skills.length > 0) {
    score += 5;
  } else {
    score -= 15;
    warnings.push('Core Sections Missing: No formal technical skills block detected.');
    tips.push('Create a dedicated "Technical Skills" section grouped by category.');
  }

  // Length penalty/bonus
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 1500) {
    score -= 10;
    warnings.push('Formatting Issue: Document is too verbose (over 1500 words).');
    tips.push('Condense your resume content to a crisp 1 to 2-page format.');
  } else if (wordCount < 200) {
    score -= 20;
    warnings.push('Formatting Issue: Document contains very low word count.');
    tips.push('Include detailed information on your work history and technical project stack.');
  } else {
    tips.push('Excellent: Word count and overall resume density fits a standard single-page dashboard format.');
  }

  return {
    score: Math.min(Math.max(score, 10), 100),
    tips,
    warnings,
    readabilityScore: Math.min(100, Math.max(30, 100 - (wordCount / 20))) // dummy Flesch proxy
  };
};

/**
 * Evaluates Experience Match (5%) based on key role mentions and experience durations
 */
const evaluateExperience = (expText, jdText) => {
  if (!expText) return { score: 40, findings: ['No explicit professional work history segment located.'] };
  
  let score = 70;
  const findings = [];

  // Find overlapping seniority tokens
  const seniority = ['senior', 'junior', 'lead', 'architect', 'manager', 'intern', 'director', 'vp'];
  const expLower = expText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  seniority.forEach(level => {
    if (jdLower.includes(level)) {
      if (expLower.includes(level)) {
        score += 15;
        findings.push(`Role Alignment: Confirmed experience level matches target seniority requirement (${level}).`);
      } else {
        score -= 5;
        findings.push(`Role Divergence: Target job mentions "${level}" but your experience details do not clearly list this.`);
      }
    }
  });

  // Calculate experience span
  const yearsMatched = expText.match(/\b(20\d{2})\b/g);
  if (yearsMatched && yearsMatched.length >= 2) {
    const years = yearsMatched.map(Number);
    const span = Math.max(...years) - Math.min(...years);
    if (span > 0) {
      score += Math.min(span * 3, 15);
      findings.push(`Duration Match: Detected a solid historical professional footprint of approximately ${span} years.`);
    }
  }

  return {
    score: Math.min(Math.max(score, 10), 100),
    findings
  };
};

/**
 * Master Scoring Pipeline
 */
const calculateATS = async (resumeText, jdText, parsedStructured, customGeminiKey = '') => {
  // 1. Keyword analysis (40%)
  const resumeWords = getKeywords(resumeText);
  const jdWords = getKeywords(jdText);
  
  // Find distinct required keywords from JD (above 4 letters, high frequency)
  const wordFrequency = {};
  jdWords.forEach(w => {
    wordFrequency[w] = (wordFrequency[w] || 0) + 1;
  });

  const topJdKeywords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);

  const matchedKeywords = [];
  const missingKeywords = [];
  const densityAnalysis = [];

  topJdKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = resumeText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }

    densityAnalysis.push({
      keyword,
      count,
      recommendedCount: Math.max(2, wordFrequency[keyword])
    });
  });

  const keywordScore = topJdKeywords.length > 0 
    ? Math.round((matchedKeywords.length / topJdKeywords.length) * 100) 
    : 70;

  // 2. Semantic Similarity (30%)
  const semanticScoreRaw = await compareSemanticSimilarity(resumeText, jdText, customGeminiKey);
  const semanticScore = Math.round(semanticScoreRaw * 100);

  // 3. Project Quality (15%)
  const projectAnalysis = evaluateProjects(resumeText);

  // 4. Formatting Analysis (10%)
  const formatAnalysis = evaluateFormatting(resumeText, parsedStructured);

  // 5. Experience Match (5%)
  const experienceAnalysis = evaluateExperience(resumeText, jdText);

  // Weighted score calculation
  const overallScore = Math.round(
    (keywordScore * 0.40) +
    (semanticScore * 0.30) +
    (projectAnalysis.score * 0.15) +
    (formatAnalysis.score * 0.10) +
    (experienceAnalysis.score * 0.05)
  );

  return {
    scores: {
      overall: overallScore,
      keywordMatch: keywordScore,
      semanticSimilarity: semanticScore,
      projectQuality: projectAnalysis.score,
      formatting: formatAnalysis.score,
      experienceMatch: experienceAnalysis.score
    },
    keywordAnalysis: {
      matched: matchedKeywords.map(w => w.charAt(0).toUpperCase() + w.slice(1)),
      missing: missingKeywords.map(w => w.charAt(0).toUpperCase() + w.slice(1)),
      density: densityAnalysis
    },
    skillGap: {
      matchedSkills: parsedStructured.skills,
      // missing skills parsed out from missing keywords matching skillsBank items
      missingSkills: missingKeywords.filter(k => 
        ['react', 'node.js', 'mongodb', 'docker', 'aws', 'kubernetes', 'typescript', 'python', 'graphql', 'rest api', 'sql', 'postgres', 'java', 'redis', 'elasticsearch'].includes(k.toLowerCase())
      ).map(w => w.toUpperCase()),
      recommendedTechnologies: missingKeywords.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)),
      suggestedCertifications: [
        'AWS Certified Solutions Architect',
        'Certified Kubernetes Administrator (CKA)',
        'Professional Scrum Master (PSM)'
      ]
    },
    formattingAnalysis: {
      readabilityScore: formatAnalysis.readabilityScore,
      hasContactInfo: !!(parsedStructured.email && parsedStructured.phone),
      hasSectionHeaders: formatAnalysis.score > 60,
      formattingTips: formatAnalysis.tips,
      warnings: formatAnalysis.warnings
    },
    projectFindings: projectAnalysis.findings,
    experienceFindings: experienceAnalysis.findings
  };
};

module.exports = {
  calculateATS,
};
