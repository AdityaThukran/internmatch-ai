// Standalone in-memory fallback store when local MongoDB is not running

const mockUsers = [
  {
    _id: 'usr_student_01',
    name: 'ADITYA',
    email: 'thukranaditya@gmail.com',
    role: 'student',
    preferences: { domain: 'Artificial Intelligence & Web Development', preferredModes: ['remote', 'hybrid', 'onsite'] },
    notificationSettings: { emailEnabled: true, weeklyDigest: true },
    createdAt: new Date(),
  },
  {
    _id: 'usr_admin_01',
    name: 'Dr. Arvind Kumar (Project Guide)',
    email: 'admin@internshipfinder.com',
    role: 'admin',
    preferences: { domain: 'Computer Science' },
    notificationSettings: { emailEnabled: true, weeklyDigest: true },
    createdAt: new Date(),
  }
];

const mockStudentProfile = {
  _id: 'prof_student_01',
  userId: mockUsers[0],
  name: 'ADITYA',
  email: 'thukranaditya@gmail.com',
  phone: '+91- 8398865720',
  degree: 'B.Tech in Artificial Intelligence',
  institution: "Lingaya's Vidyapeeth, Faridabad",
  bio: 'ADITYA — Full Stack Developer | B.Tech Artificial Intelligence at Lingaya’s Vidyapeeth, Faridabad. Skilled in React, Node.js, Express.js, MongoDB, Python, and Machine Learning.',
  location: 'Faridabad, India',
  preferredMode: 'remote',
  github: 'https://github.com/AdityaThukran',
  linkedin: '',
  skills: [
    'React',
    'Node.js',
    'JavaScript',
    'Python',
    'MongoDB',
    'Express.js',
    'C++',
    'Java',
    'Git',
    'GitHub',
    'Machine Learning',
    'REST API',
    'HTML5',
    'CSS3'
  ],
  interests: [
    'Natural Language Processing',
    'Full Stack Development',
    'Deep Learning',
    'Cloud Computing',
    'API Design'
  ],
  education: [
    {
      institution: 'Lingaya’s Vidyapeeth, Faridabad',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science & Engineering (AI)',
      startYear: 2024,
      endYear: 2028,
      gpa: '8.8 / 10'
    }
  ],
  extractedProfile: {
    summary: 'Undergraduate student with hands-on skills in Python ML, React frontend and Express/FastAPI backends.',
    topSkills: ['Python', 'React', 'Machine Learning', 'Node.js', 'MongoDB'],
  }
};

const mockInternships = require('./realInternshipsData');

const mockApplications = [
  {
    _id: 'app_01',
    userId: mockUsers[0]._id,
    internshipId: mockInternships[0], // Google ML
    status: 'applied',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Submitted online resume and project demo link. Waiting for screening round email.',
  },
  {
    _id: 'app_02',
    userId: mockUsers[0]._id,
    internshipId: mockInternships[1], // Razorpay React
    status: 'interviewing',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Completed technical take-home assignment! Technical interview scheduled for Friday 3 PM.',
  },
  {
    _id: 'app_03',
    userId: mockUsers[0]._id,
    internshipId: mockInternships[2], // CRED Full Stack
    status: 'saved',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: 'Great match for React + Node.js skills. Need to polish portfolio before applying.',
  },
  {
    _id: 'app_04',
    userId: mockUsers[0]._id,
    internshipId: mockInternships[3], // Microsoft AI
    status: 'offered',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    notes: 'Received official offer letter! Stipend ₹1,00,000/mo. Acceptance deadline in 7 days.',
  }
];

const mockNotifications = [
  {
    _id: 'notif_01',
    userId: mockUsers[0]._id,
    internshipId: 'job_01',
    channel: 'in-app',
    title: '🎯 High Match: Machine Learning Engineering Intern',
    message: 'Google posted a new opening with a 94% match for your Python, Machine Learning, and NLP skills!',
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deliveryStatus: 'sent',
    isRead: false,
  },
  {
    _id: 'notif_02',
    userId: mockUsers[0]._id,
    internshipId: 'job_02',
    channel: 'in-app',
    title: '💼 Application Status Update: Razorpay',
    message: 'Your application status for Frontend React.js Developer Intern has moved to Interviewing!',
    sentAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    deliveryStatus: 'sent',
    isRead: false,
  },
  {
    _id: 'notif_03',
    userId: mockUsers[0]._id,
    internshipId: 'job_04',
    channel: 'in-app',
    title: '🎉 Congratulations: Offer Received!',
    message: 'Microsoft has extended an internship offer for AI & Data Science Intern.',
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    deliveryStatus: 'sent',
    isRead: true,
  },
  {
    _id: 'notif_04',
    userId: mockUsers[0]._id,
    internshipId: 'job_06',
    channel: 'in-app',
    title: '📅 Weekly Monitoring Digest',
    message: '3 new remote internships matching your preferences were discovered during the weekly automated scan.',
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    deliveryStatus: 'sent',
    isRead: true,
  }
];

const calculateMatchRecommendations = (studentSkills = []) => {
  const skillsLower = studentSkills.map(s => s.toLowerCase());
  let allInternships = [];
  try {
    const internshipAggregator = require('./services/internshipAggregator');
    allInternships = internshipAggregator.getAllListings() || [];
  } catch (e) {
    allInternships = mockInternships || [];
  }

  return allInternships.map(internship => {
    const matched = [];
    const missing = [];

    (internship.skills || []).forEach(skill => {
      if (skillsLower.includes(skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const ratio = (internship.skills && internship.skills.length > 0) ? (matched.length / internship.skills.length) : 0.5;
    let score = Math.round(ratio * 75 + 18);
    if (internship.mode === 'remote') score += 5;
    score = Math.min(98, Math.max(35, score));

    return {
      _id: 'rec_' + (internship._id || internship.id),
      userId: mockUsers[0]._id,
      internshipId: { ...internship, _id: internship._id || internship.id },
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      matchDetails: {
        skillRatio: `${matched.length}/${(internship.skills || []).length}`,
        recommendationTier: score >= 75 ? 'Top Match' : 'Recommended'
      },
      generatedAt: new Date()
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
  mockUsers,
  mockStudentProfile,
  mockInternships,
  mockApplications,
  mockNotifications,
  calculateMatchRecommendations,
};
