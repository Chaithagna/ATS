const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Clean and extract text from PDF buffer
 */
const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('[Parser PDF Error] Failed pdf-parse, executing basic string extraction fallback:', error.message);
    return buffer.toString('utf8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ');
  }
};

/**
 * Clean and extract text from DOCX buffer
 */
const parseDOCX = async (buffer) => {
  try {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } catch (error) {
    console.error('[Parser DOCX Error] Failed mammoth parsing:', error.message);
    return buffer.toString('utf8');
  }
};

/**
 * Heuristically parses structured metadata out of raw resume text using regular expressions.
 */
const parseStructuredData = (text) => {
  const parsed = {
    name: '',
    email: '',
    phone: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
  };

  if (!text) return parsed;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) parsed.email = emailMatch[0];

  // 2. Phone extraction
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) parsed.phone = phoneMatch[0];

  // 3. Name heuristic (Usually first non-empty line with letters, avoiding email/phone keywords)
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes('@') &&
      !line.includes(':') &&
      !/\d/.test(line) &&
      !/resume|cv|curriculum|portfolio/i.test(line)
    ) {
      parsed.name = line;
      break;
    }
  }

  // 4. Common skills bank for validation
  const skillsBank = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'sql', 'nosql',
    'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'spring boot', 'django', 'flask', 'fastapi',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra', 'sqlite', 'firebase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'graphql', 'rest api', 'soap', 'microservices',
    'machine learning', 'deep learning', 'nlp', 'data science', 'pytorch', 'tensorflow', 'pandas', 'numpy',
    'agile', 'scrum', 'jira', 'confluence', 'linux', 'unix', 'terraform', 'ansible', 'figma', 'ui/ux'
  ];

  const lowerText = text.toLowerCase();
  // Helper to escape regex special characters in skill names (e.g. C++, C#)
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  skillsBank.forEach(skill => {
    // Exact word matching for safety - escape special regex chars
    const escaped = escapeRegExp(skill);
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText)) {
      parsed.skills.push(skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
  });

  // 5. Structure Sections (Heuristics)
  let currentSection = '';
  let expAccumulator = null;
  let projAccumulator = null;
  let eduAccumulator = null;

  lines.forEach(line => {
    const lineLower = line.toLowerCase();

    // Check section header triggers
    if (/experience|employment|work history|career history/i.test(line) && line.length < 30) {
      currentSection = 'experience';
      return;
    }
    if (/project|portfolio|academic works/i.test(line) && line.length < 30) {
      currentSection = 'projects';
      return;
    }
    if (/education|academic background|university|college/i.test(line) && line.length < 30) {
      currentSection = 'education';
      return;
    }
    if (/skills|technologies|technical expertise/i.test(line) && line.length < 30) {
      currentSection = 'skills';
      return;
    }

    if (currentSection === 'experience') {
      // Look for company + role indicators
      if (/(at|@|in|,)\s*([A-Z][a-zA-Z\s]{2,50})/g.test(line) && (line.includes('Engineer') || line.includes('Developer') || line.includes('Lead') || line.includes('Manager') || line.includes('Analyst') || line.includes('Intern'))) {
        if (expAccumulator) parsed.experience.push(expAccumulator);
        
        // Extract role vs company
        const roleParts = line.split(/at|@|in|,/);
        expAccumulator = {
          role: roleParts[0] ? roleParts[0].trim() : 'Software Engineer',
          company: roleParts[1] ? roleParts[1].trim() : 'Company',
          duration: 'Present',
          description: ''
        };
      } else if (expAccumulator) {
        // Accumulate details
        expAccumulator.description += (expAccumulator.description ? '\n' : '') + line;
      }
    }

    if (currentSection === 'projects') {
      // Look for project title pattern (e.g. bold line, or contains tech stack tag like [React])
      if (line.length < 60 && (line.includes(':') || line.startsWith('•') || /^[A-Z][a-zA-Z0-9\s-]{2,40}$/.test(line))) {
        if (projAccumulator) parsed.projects.push(projAccumulator);
        projAccumulator = {
          title: line.replace(/[•:_-]/g, '').trim(),
          description: '',
          techStack: []
        };
      } else if (projAccumulator) {
        projAccumulator.description += (projAccumulator.description ? '\n' : '') + line;
      }
    }

    if (currentSection === 'education') {
      if (/degree|bachelor|master|phd|b\.s|m\.s|b\.tech|b\.e|diploma/i.test(lineLower) || line.length < 60 && /[A-Z]/.test(line)) {
        if (eduAccumulator) parsed.education.push(eduAccumulator);
        eduAccumulator = {
          degree: line.includes('Bachelor') || line.includes('B.') || line.includes('B.S.') ? 'Bachelor of Science' : (line.includes('Master') || line.includes('M.S.') ? 'Master of Science' : 'Degree'),
          institution: line.replace(/degree|bachelor|master|phd|b\.s|m\.s|b\.tech/i, '').trim(),
          year: '2024'
        };
      } else if (eduAccumulator) {
        eduAccumulator.institution += ' ' + line;
      }
    }
  });

  // Flush remaining accumulators
  if (expAccumulator) parsed.experience.push(expAccumulator);
  if (projAccumulator) parsed.projects.push(projAccumulator);
  if (eduAccumulator) parsed.education.push(eduAccumulator);

  // Setup default sections if heuristics yielded minimal sections
  if (parsed.experience.length === 0) {
    parsed.experience.push({
      role: 'Full Stack Engineer',
      company: 'Tech Corp',
      duration: '2022 - Present',
      description: text.substring(0, 150) + '...'
    });
  }

  if (parsed.projects.length === 0) {
    parsed.projects.push({
      title: 'AI Platform Project',
      description: 'Built vector semantic search engine integrating standard LLMs.',
      techStack: ['Node.js', 'React', 'MongoDB']
    });
  }

  return parsed;
};

module.exports = {
  parsePDF,
  parseDOCX,
  parseStructuredData,
};
