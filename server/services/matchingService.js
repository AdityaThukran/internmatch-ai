const { calculateSkillOverlap } = require('../utils/helpers');
const aiService = require('./aiService');

/**
 * Basic keyword matching using Jaccard similarity coefficient.
 * @param {string[]} profileSkills - Student's skills
 * @param {string[]} internshipSkills - Internship required skills
 * @returns {number} Score 0-100
 */
const basicKeywordMatch = (profileSkills = [], internshipSkills = []) => {
  const set1 = new Set(profileSkills.map((s) => s.toLowerCase().trim()));
  const set2 = new Set(internshipSkills.map((s) => s.toLowerCase().trim()));

  if (set1.size === 0 && set2.size === 0) return 0;

  let intersectionCount = 0;
  for (const skill of set2) {
    if (set1.has(skill)) {
      intersectionCount++;
    }
  }

  // Jaccard similarity coefficient
  const union = new Set([...set1, ...set2]);
  const score = union.size > 0 ? Math.round((intersectionCount / union.size) * 100) : 0;

  return score;
};

/**
 * Generate detailed match information between a profile and an internship.
 * @param {object} profile - Student profile
 * @param {object} internship - Internship object
 * @returns {object} { matchedSkills, missingSkills, score, factors }
 */
const generateMatchDetails = (profile, internship) => {
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase().trim());
  const internshipSkills = (internship.skills || []).map((s) => s.toLowerCase().trim());

  const profileSkillsSet = new Set(profileSkills);
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of internshipSkills) {
    if (profileSkillsSet.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Calculate skill match score (primary factor)
  const skillScore = basicKeywordMatch(profileSkills, internshipSkills);

  // Location compatibility factor
  let locationScore = 0;
  if (
    internship.mode === 'remote' ||
    profile.preferredMode === 'any' ||
    profile.preferredMode === internship.mode
  ) {
    locationScore = 100;
  } else if (
    profile.location &&
    internship.location &&
    profile.location.toLowerCase() === internship.location.toLowerCase()
  ) {
    locationScore = 80;
  } else {
    locationScore = 30;
  }

  // Interest alignment factor
  let interestScore = 0;
  if (profile.interests && profile.interests.length > 0 && internship.description) {
    const descLower = internship.description.toLowerCase();
    const matchedInterests = profile.interests.filter((interest) =>
      descLower.includes(interest.toLowerCase())
    );
    interestScore =
      profile.interests.length > 0
        ? Math.round((matchedInterests.length / profile.interests.length) * 100)
        : 0;
  }

  // Weighted combined score: skills 60%, location 20%, interests 20%
  const combinedScore = Math.round(
    skillScore * 0.6 + locationScore * 0.2 + interestScore * 0.2
  );

  return {
    matchedSkills,
    missingSkills,
    score: combinedScore,
    factors: {
      skillScore,
      locationScore,
      interestScore,
      combinedScore,
    },
  };
};

/**
 * Match a student with internships. Tries AI service first, falls back to basic matching.
 * @param {object} profile - Student profile
 * @param {Array} internships - Array of internship objects
 * @returns {Array} Array of match results
 */
const matchStudentWithInternships = async (profile, internships) => {
  // Try AI service first
  try {
    const aiResults = await aiService.matchProfiles(profile, internships);
    if (aiResults && Array.isArray(aiResults) && aiResults.length > 0) {
      return aiResults;
    }
  } catch (error) {
    console.error('AI service matching failed, using basic matching:', error.message);
  }

  // Fallback to basic matching
  return internships.map((internship) => {
    const details = generateMatchDetails(profile, internship);
    return {
      internshipId: internship._id.toString(),
      matchScore: details.score,
      matchedSkills: details.matchedSkills,
      missingSkills: details.missingSkills,
      matchDetails: details.factors,
    };
  });
};

module.exports = {
  basicKeywordMatch,
  generateMatchDetails,
  matchStudentWithInternships,
};
