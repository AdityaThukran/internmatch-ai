/**
 * Standard API response formatter
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @returns {object} Formatted response object
 */
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

/**
 * Mongoose pagination helper
 * @param {object} query - Mongoose query object
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {object} { results, total, page, pages }
 */
const paginate = async (query, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [results, total] = await Promise.all([
    query.skip(skip).limit(limitNum),
    query.model.countDocuments(query.getFilter()),
  ]);

  return {
    results,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};

/**
 * Basic skill comparison
 * @param {string[]} skills1 - First skill set
 * @param {string[]} skills2 - Second skill set
 * @returns {object} { overlap, percentage, matched, missing }
 */
const calculateSkillOverlap = (skills1 = [], skills2 = []) => {
  const set1 = new Set(skills1.map((s) => s.toLowerCase().trim()));
  const set2 = new Set(skills2.map((s) => s.toLowerCase().trim()));

  const matched = [];
  const missing = [];

  for (const skill of set2) {
    if (set1.has(skill)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const unionSize = new Set([...set1, ...set2]).size;
  const percentage = unionSize > 0 ? Math.round((matched.length / unionSize) * 100) : 0;

  return {
    overlap: matched.length,
    percentage,
    matched,
    missing,
  };
};

module.exports = {
  formatResponse,
  paginate,
  calculateSkillOverlap,
};
