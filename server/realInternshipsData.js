/**
 * Real Internships Data Store
 * Provides rich, verified industry-ready internship listings across:
 * - Technology & Software (AI/ML, Web, Cloud, DevOps, Mobile)
 * - Actuarial Science & Quantitative Risk (Swiss Re, Munich Re, WTW, Max Life)
 * - Law & Legal Studies (Khaitan & Co, Trilegal, Cyril Amarchand Mangaldas, Anand and Anand, AZB & Partners)
 * - Commerce, CA, Audit & Finance (Deloitte, EY, Morgan Stanley)
 * - Business Management, Brand Strategy & People Ops / HR (HUL, Swiggy)
 * - Design, UI/UX & Architecture (CRED, Hafeez Contractor)
 * - Core Engineering (Tata Motors EV, L&T Civil, Schneider Electric)
 */

let realListings = [];
try {
  const { REAL_INTERNSHIPS } = require('./clean_and_seed_real_internships');
  if (Array.isArray(REAL_INTERNSHIPS) && REAL_INTERNSHIPS.length > 0) {
    realListings = REAL_INTERNSHIPS;
  }
} catch (e) {
  realListings = [];
}

module.exports = realListings;
