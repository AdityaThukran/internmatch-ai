const axios = require('axios');
const config = require('../config/config');

/**
 * Extract resume data by sending file path to AI service.
 * @param {string} filePath - Path to the uploaded resume file
 * @returns {object|null} Extracted resume data or null on error
 */
const extractResume = async (filePath) => {
  try {
    const response = await axios.post(
      `${config.aiServiceUrl}/api/extract-resume`,
      { file_path: filePath },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000, // 30 second timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error('AI Service - Resume extraction error:', error.message);
    return null;
  }
};

/**
 * Match student profile against internships using AI service.
 * Falls back to basic keyword matching on error.
 * @param {object} profile - Student profile object
 * @param {Array} internships - Array of internship objects
 * @returns {Array} Array of { internshipId, matchScore, matchedSkills, missingSkills }
 */
const matchProfiles = async (profile, internships) => {
  try {
    const response = await axios.post(
      `${config.aiServiceUrl}/api/match`,
      { profile, internships },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // 60 second timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error('AI Service - Matching error, falling back to basic matching:', error.message);
    return fallbackBasicMatching(profile, internships);
  }
};

/**
 * Fallback basic matching when AI service is unavailable.
 * Compares profile skills against internship skills using Jaccard similarity.
 * @param {object} profile - Student profile
 * @param {Array} internships - Array of internships
 * @returns {Array} Match results
 */
const fallbackBasicMatching = (profile, internships) => {
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());
  const profileSkillsSet = new Set(profileSkills);

  return internships.map((internship) => {
    const internshipSkills = (internship.skills || []).map((s) => s.toLowerCase().trim());
    const internshipSkillsSet = new Set(internshipSkills);

    const matchedSkills = [];
    const missingSkills = [];

    for (const skill of internshipSkillsSet) {
      if (profileSkillsSet.has(skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    // Jaccard similarity: intersection / union
    const union = new Set([...profileSkillsSet, ...internshipSkillsSet]);
    const matchScore =
      union.size > 0 ? Math.round((matchedSkills.length / union.size) * 100) : 0;

    return {
      internshipId: internship._id.toString(),
      matchScore,
      matchedSkills,
      missingSkills,
    };
  });
};

module.exports = {
  extractResume,
  matchProfiles,
  fallbackBasicMatching,
};
