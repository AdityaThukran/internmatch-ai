const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = require('./config/config');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Internship = require('./models/Internship');
const Recommendation = require('./models/Recommendation');
const Application = require('./models/Application');
const Notification = require('./models/Notification');
const MonitoringRun = require('./models/MonitoringRun');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB at:', config.mongodbUri);
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB. Clearing existing collections...');

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Internship.deleteMany({});
    await Recommendation.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await MonitoringRun.deleteMany({});

    console.log('Collections cleared. Creating demo users...');

    // Create passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    // 1. Admin User
    const adminUser = await User.create({
      name: 'Dr. Arvind Kumar (Admin)',
      email: 'admin@internshipfinder.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      preferences: {
        domain: 'Computer Science',
      },
      notificationSettings: {
        emailEnabled: true,
        weeklyDigest: true,
      },
    });

    // 2. Demo Student User
    const studentUser = await User.create({
      name: 'Jon Doe',
      email: 'student@example.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      preferences: {
        preferredLocations: ['Bangalore', 'Remote', 'Delhi'],
        preferredModes: ['remote', 'hybrid', 'onsite'],
        domain: 'Artificial Intelligence & Web Development',
      },
      notificationSettings: {
        emailEnabled: true,
        weeklyDigest: true,
      },
    });

    console.log('Creating Student Profile...');

    // Student Profile
    const studentProfile = await StudentProfile.create({
      userId: studentUser._id,
      bio: 'B.Tech CSE (Artificial Intelligence) student at Lingaya’s Vidyapeeth. Passionate about machine learning, full-stack web development with React and Node.js, and building intelligent data-driven applications.',
      location: 'Delhi NCR, India',
      preferredMode: 'remote',
      github: 'https://github.com/jon-doe',
      linkedin: 'https://linkedin.com/in/jon-doe-ai',
      skills: [
        'React',
        'Node.js',
        'JavaScript',
        'Python',
        'Machine Learning',
        'MongoDB',
        'FastAPI',
        'SQL',
        'Tailwind CSS',
        'Git',
        'Express.js',
        'PyTorch'
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
        },
        {
          institution: 'Delhi Public School',
          degree: 'Higher Secondary (12th CBSE)',
          fieldOfStudy: 'Science (PCM with CS)',
          startYear: 2022,
          endYear: 2024,
          gpa: '92.4%'
        }
      ],
      extractedProfile: {
        summary: 'Undergraduate student with hands-on skills in Python ML, React frontend and Express/FastAPI backends.',
        topSkills: ['Python', 'React', 'Machine Learning', 'Node.js', 'MongoDB'],
      }
    });

    console.log('Seeding 25+ realistic internship listings...');

    const internshipListings = [
      {
        title: 'Machine Learning Engineering Intern',
        organization: 'Google',
        description: 'Work with the Google Research and Core ML team on natural language processing, semantic representation models, and high-scale inference optimization. You will collaborate with research scientists to deploy state-of-the-art transformer pipelines.',
        skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Git'],
        eligibility: 'Pursuing B.Tech / M.Tech in CS, AI, or related field with strong programming foundation in Python.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹1,20,000 / month',
        duration: '6 Months',
        source: 'Google Careers API',
        applyUrl: 'https://careers.google.com/jobs/results/',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Frontend React.js Developer Intern',
        organization: 'Razorpay',
        description: 'Build fast, accessible, and delightful merchant dashboard interfaces. Work directly with design and product teams using React, TypeScript, Redux Toolkit, and modern CSS architecture.',
        skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
        eligibility: '3rd or 4th year undergraduate with demonstrable projects built using React and modern frontend toolchains.',
        location: 'Bangalore',
        mode: 'remote',
        stipend: '₹45,000 / month',
        duration: '3 to 6 Months',
        source: 'Razorpay Campus Portal',
        applyUrl: 'https://razorpay.com/jobs/',
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Full Stack Web Engineering Intern',
        organization: 'CRED',
        description: 'Craft high-performance user journeys, payment flows, and interactive UI animations. Collaborate with backend architects to build reactive microservices with Node.js and React.',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express.js', 'REST API'],
        eligibility: 'Students graduating in 2025/2026 with strong understanding of asynchronous JavaScript, REST APIs, and database indexing.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹75,000 / month',
        duration: '6 Months',
        source: 'CRED Careers',
        applyUrl: 'https://cred.club/careers',
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'AI & Data Science Intern',
        organization: 'Microsoft',
        description: 'Explore generative AI features, Azure Cognitive Services, and semantic search integration across Microsoft 365 cloud products.',
        skills: ['Python', 'Machine Learning', 'NLP', 'FastAPI', 'Azure', 'Scikit-learn'],
        eligibility: 'Pre-final or final year engineering students with passion for intelligent algorithms and data analysis.',
        location: 'Hyderabad',
        mode: 'hybrid',
        stipend: '₹1,00,000 / month',
        duration: '6 Months',
        source: 'Microsoft University Recruiting',
        applyUrl: 'https://careers.microsoft.com',
        postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Software Development Engineer (SDE) Intern',
        organization: 'Amazon',
        description: 'Design and implement customer-facing services that scale to millions of orders per day. Work with AWS infrastructure, distributed caching, and clean code practices.',
        skills: ['Java', 'Python', 'SQL', 'AWS', 'Data Structures', 'Git'],
        eligibility: 'B.Tech/BE in Computer Science with proficiency in Object-Oriented Programming and Data Structures.',
        location: 'Bangalore',
        mode: 'onsite',
        stipend: '₹80,000 / month',
        duration: '6 Months',
        source: 'Amazon Student Programs',
        applyUrl: 'https://amazon.jobs',
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Backend Node.js & Cloud Intern',
        organization: 'Flipkart',
        description: 'Enhance Flipkart e-commerce fulfillment services, inventory microservices, and high-concurrency event messaging pipelines.',
        skills: ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'Kafka', 'Docker'],
        eligibility: 'Students with hands-on experience building REST APIs, working with NoSQL databases, and API debugging.',
        location: 'Bangalore',
        mode: 'onsite',
        stipend: '₹60,000 / month',
        duration: '6 Months',
        source: 'Flipkart Campus Grid',
        applyUrl: 'https://flipkartcareers.com',
        postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Data Analytics & Recommendation Intern',
        organization: 'Zomato',
        description: 'Analyze real-time delivery metrics, restaurant conversion funnels, and recommendation relevance to improve user discovery.',
        skills: ['Python', 'SQL', 'Pandas', 'Data Analysis', 'Scikit-learn', 'Tableau'],
        eligibility: 'Comfort with large SQL datasets, data wrangling in Pandas, and statistical hypothesis testing.',
        location: 'Gurgaon',
        mode: 'hybrid',
        stipend: '₹40,000 / month',
        duration: '3 Months',
        source: 'Zomato Early Career',
        applyUrl: 'https://zomato.com/careers',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Full Stack Engineering Intern',
        organization: 'Zerodha',
        description: 'Help build ultra-fast, minimal, accessible web tools and educational investment simulators. We value clean code, deep Linux understanding, and independent problem-solving.',
        skills: ['Python', 'React', 'JavaScript', 'PostgreSQL', 'Linux', 'Git'],
        eligibility: 'Any college branch. We care about demonstrated open-source contributions or side-projects.',
        location: 'Remote',
        mode: 'remote',
        stipend: '₹50,000 / month',
        duration: '6 Months',
        source: 'Zerodha Tech Jobs',
        applyUrl: 'https://zerodha.com/careers',
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Deep Learning & Computer Vision Intern',
        organization: 'Adobe',
        description: 'Implement computer vision pipelines, image segmentation models, and creative generative media workflows inside Adobe Creative Cloud APIs.',
        skills: ['Python', 'PyTorch', 'OpenCV', 'Deep Learning', 'Computer Vision', 'C++'],
        eligibility: 'Strong math and matrix algebra skills with hands-on PyTorch or OpenCV project portfolio.',
        location: 'Noida',
        mode: 'hybrid',
        stipend: '₹90,000 / month',
        duration: '6 Months',
        source: 'Adobe University Talent',
        applyUrl: 'https://adobe.wd5.myworkdayjobs.com',
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Platform Engineering & DevOps Intern',
        organization: 'Atlassian',
        description: 'Work with the Jira & Confluence Cloud reliability team. Automate cloud container deployments, monitoring observability, and CI/CD resilience.',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Python', 'CI/CD'],
        eligibility: 'Understanding of containerization, cloud networking fundamentals, and shell scripting.',
        location: 'Remote',
        mode: 'remote',
        stipend: '₹85,000 / month',
        duration: '6 Months',
        source: 'Atlassian Careers API',
        applyUrl: 'https://atlassian.com/company/careers',
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Mobile App Developer (React Native) Intern',
        organization: 'Swiggy',
        description: 'Craft smooth food ordering and Instamart delivery experience on Android and iOS devices. Optimize bundle sizes and 60fps UI animations.',
        skills: ['React Native', 'React', 'JavaScript', 'TypeScript', 'Redux'],
        eligibility: 'Experience building mobile apps with React Native, state management, and native bridge concepts.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹50,000 / month',
        duration: '4 Months',
        source: 'Swiggy Careers',
        applyUrl: 'https://careers.swiggy.com',
        postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'NLP & LLM Applications Intern',
        organization: 'PhonePe',
        description: 'Train and fine-tune language models for customer support automation, regional language intent parsing, and fraud detection.',
        skills: ['Python', 'NLP', 'Machine Learning', 'FastAPI', 'Pandas', 'MongoDB'],
        eligibility: 'Academic or practical experience in Transformer models, BERT/RoBERTa, or LangChain workflows.',
        location: 'Bangalore',
        mode: 'onsite',
        stipend: '₹70,000 / month',
        duration: '6 Months',
        source: 'PhonePe Tech Careers',
        applyUrl: 'https://phonepe.com/careers',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'UI/UX Design & Frontend Engineering Intern',
        organization: 'Groww',
        description: 'Help simplify investing for millions of retail users. Create interactive investment calculators, charts, and accessible design system components.',
        skills: ['React', 'JavaScript', 'Tailwind CSS', 'Figma', 'HTML', 'CSS'],
        eligibility: 'A keen eye for aesthetic typography, color contrast, micro-interactions, and React components.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹40,000 / month',
        duration: '3 to 6 Months',
        source: 'Groww Careers',
        applyUrl: 'https://groww.in/careers',
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Cloud Security & Infrastructure Intern',
        organization: 'Paytm',
        description: 'Audit cloud API security, implement rate limiting safeguards, and configure automated vulnerability scans across fintech microservices.',
        skills: ['Python', 'Linux', 'AWS', 'Docker', 'REST API', 'Git'],
        eligibility: 'Computer science background with understanding of OWASP top 10, JWT, and network protocols.',
        location: 'Noida',
        mode: 'onsite',
        stipend: '₹35,000 / month',
        duration: '6 Months',
        source: 'Paytm Early Talent',
        applyUrl: 'https://paytm.com/careers',
        postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'High-Concurrency Backend Systems Intern',
        organization: 'Dream11',
        description: 'Build real-time fantasy sport calculation engines that handle 10+ million concurrent requests per match. Work on Go and Node.js microservices.',
        skills: ['Node.js', 'Go', 'Redis', 'Kafka', 'SQL', 'MongoDB'],
        eligibility: 'Proficiency in data structures, concurrency, multithreading, and distributed storage caching.',
        location: 'Mumbai',
        mode: 'hybrid',
        stipend: '₹65,000 / month',
        duration: '6 Months',
        source: 'Dream11 Tech Jobs',
        applyUrl: 'https://about.dream11.com/careers',
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Web Application Developer Intern',
        organization: 'Zoho Corporation',
        description: 'Build enterprise productivity web apps using modern JavaScript frameworks, clean MVC patterns, and multi-tenant cloud storage.',
        skills: ['JavaScript', 'HTML', 'CSS', 'Java', 'SQL', 'REST API'],
        eligibility: 'Strong logical reasoning, algorithmic problem solving, and passion for web development.',
        location: 'Chennai',
        mode: 'onsite',
        stipend: '₹30,000 / month',
        duration: '6 Months',
        source: 'Zoho University Drive',
        applyUrl: 'https://zoho.com/careers',
        postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'SaaS Product Development Intern',
        organization: 'Freshworks',
        description: 'Contribute to Freshdesk and Freshsales customer engagement suites. Build customer support automation bots and webhook integrations.',
        skills: ['React', 'Node.js', 'Express.js', 'MySQL', 'Git'],
        eligibility: 'Final year engineering student with web project experience and clean communication.',
        location: 'Chennai',
        mode: 'hybrid',
        stipend: '₹35,000 / month',
        duration: '6 Months',
        source: 'Freshworks Careers',
        applyUrl: 'https://freshworks.com/careers',
        postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Autonomous Navigation & Robotics Intern',
        organization: 'Ola Electric',
        description: 'Develop sensor fusion and battery telemetry processing software for electric two-wheelers and autonomous factory robotics.',
        skills: ['Python', 'C++', 'Machine Learning', 'Linux', 'Computer Vision'],
        eligibility: 'B.Tech / M.Tech in CS, Robotics, or Electrical with familiarity in embedded Linux and sensor parsing.',
        location: 'Bangalore',
        mode: 'onsite',
        stipend: '₹45,000 / month',
        duration: '6 Months',
        source: 'Ola Careers',
        applyUrl: 'https://olaelectric.com/careers',
        postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Product Analytics & Growth Intern',
        organization: 'Meesho',
        description: 'Analyze social commerce merchant conversion, supplier onboarding flows, and cohort retention across Tier-2 and Tier-3 Indian cities.',
        skills: ['SQL', 'Python', 'Pandas', 'Excel', 'Tableau', 'Data Analysis'],
        eligibility: 'Strong quantitative skills, curiosity for consumer behavior, and proficiency in complex SQL joins.',
        location: 'Bangalore',
        mode: 'remote',
        stipend: '₹40,000 / month',
        duration: '3 Months',
        source: 'Meesho Careers',
        applyUrl: 'https://meesho.io/careers',
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Backend Systems & API Engineering Intern',
        organization: 'Uber',
        description: 'Work on mapping, dispatch optimization, and driver-rider matching engine services under the Uber India Tech Centre.',
        skills: ['Java', 'Go', 'Python', 'Microservices', 'Docker', 'SQL'],
        eligibility: 'Exceptional CS fundamentals in operating systems, networking, distributed systems, and graph algorithms.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹1,10,000 / month',
        duration: '6 Months',
        source: 'Uber Careers',
        applyUrl: 'https://uber.com/careers',
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Full Stack Web Developer Intern',
        organization: 'Unacademy',
        description: 'Develop educator streaming tools, interactive real-time classroom polls, and responsive quiz interfaces for learners across India.',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Redis'],
        eligibility: 'Good foundation in React and Node.js with ability to integrate websockets or third-party media players.',
        location: 'Remote',
        mode: 'remote',
        stipend: '₹40,000 / month',
        duration: '4 Months',
        source: 'Unacademy Careers',
        applyUrl: 'https://unacademy.com/careers',
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Data Science & Recommendation Systems Intern',
        organization: 'Infosys',
        description: 'Work with the Infosys Center for Emerging Technology on recommendation models, automated document indexing, and enterprise AI accelerators.',
        skills: ['Python', 'Machine Learning', 'NLP', 'SQL', 'Scikit-learn'],
        eligibility: 'B.Tech / MCA with knowledge of predictive analytics and classification algorithms.',
        location: 'Pune',
        mode: 'hybrid',
        stipend: '₹28,000 / month',
        duration: '6 Months',
        source: 'Infosys InStep Portal',
        applyUrl: 'https://infosys.com/instep',
        postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'AI EdTech Application Intern',
        organization: "Byju's",
        description: 'Create personalized student learning paths and adaptive knowledge assessment modules using NLP and behavioral clustering.',
        skills: ['Python', 'FastAPI', 'Machine Learning', 'React', 'MongoDB'],
        eligibility: 'Enthusiasm for educational technology and interactive learning workflows.',
        location: 'Bangalore',
        mode: 'hybrid',
        stipend: '₹32,000 / month',
        duration: '3 Months',
        source: "Byju's Careers",
        applyUrl: 'https://byjus.com/careers',
        postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Cognitive Business & AI Analytics Intern',
        organization: 'TCS',
        description: 'Engage with enterprise clients on automated document parsing, chatbots, and business intelligence dashboards.',
        skills: ['Python', 'SQL', 'NLP', 'Machine Learning', 'Power BI'],
        eligibility: 'Engineering undergraduates with an aggregate of 65% or above and good verbal and written communication.',
        location: 'Chennai',
        mode: 'onsite',
        stipend: '₹25,000 / month',
        duration: '6 Months',
        source: 'TCS NextStep Portal',
        applyUrl: 'https://nextstep.tcs.com',
        postedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        title: 'Cloud Solutions & Infrastructure Intern',
        organization: 'Wipro',
        description: 'Support enterprise migration to AWS and Azure cloud platforms, automate infrastructure provisioning, and monitor cloud health.',
        skills: ['AWS', 'Azure', 'Linux', 'Python', 'Docker', 'Git'],
        eligibility: 'Undergraduates interested in cloud architecture, virtualization, and systems administration.',
        location: 'Hyderabad',
        mode: 'hybrid',
        stipend: '₹26,000 / month',
        duration: '6 Months',
        source: 'Wipro Careers',
        applyUrl: 'https://wipro.com/careers',
        postedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        isActive: true,
      }
    ];

    const insertedInternships = await Internship.insertMany(internshipListings);
    console.log(`Inserted ${insertedInternships.length} internships.`);

    console.log('Generating realistic AI Recommendations for demo student...');

    // Calculate match scores for the demo student
    const studentSkills = studentProfile.skills.map(s => s.toLowerCase());

    const recommendationsToInsert = insertedInternships.map(internship => {
      const requiredSkills = internship.skills.map(s => s.toLowerCase());
      const matched = [];
      const missing = [];

      internship.skills.forEach(skill => {
        if (studentSkills.includes(skill.toLowerCase())) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      });

      // Semantic/domain bonus
      let bonus = 0;
      if (internship.mode === 'remote' || studentProfile.preferredMode === 'any') bonus += 5;
      if (internship.title.toLowerCase().includes('machine learning') || internship.title.toLowerCase().includes('ai') || internship.title.toLowerCase().includes('react') || internship.title.toLowerCase().includes('full stack')) {
        bonus += 10;
      }

      const overlapFraction = requiredSkills.length > 0 ? (matched.length / requiredSkills.length) : 0.5;
      let calculatedScore = Math.round((overlapFraction * 75) + bonus + 10);
      calculatedScore = Math.min(98, Math.max(35, calculatedScore));

      return {
        userId: studentUser._id,
        internshipId: internship._id,
        matchScore: calculatedScore,
        matchedSkills: matched,
        missingSkills: missing,
        matchDetails: {
          skillMatchRatio: `${matched.length}/${requiredSkills.length}`,
          modeMatch: internship.mode === studentProfile.preferredMode,
          semanticRelevance: calculatedScore >= 75 ? 'High' : (calculatedScore >= 60 ? 'Moderate' : 'Developing')
        },
        generatedAt: new Date(),
      };
    });

    await Recommendation.insertMany(recommendationsToInsert);
    console.log(`Created ${recommendationsToInsert.length} recommendations.`);

    console.log('Creating sample student Applications...');

    // Create a few saved and applied applications
    const sampleApps = [
      {
        userId: studentUser._id,
        internshipId: insertedInternships[0]._id, // Google ML
        status: 'applied',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Submitted online resume and project demo link. Waiting for screening round email.',
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[1]._id, // Razorpay React
        status: 'interviewing',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Completed technical take-home assignment! Technical interview scheduled for Friday 3 PM.',
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[2]._id, // CRED Full Stack
        status: 'saved',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Great match for React + Node.js skills. Need to polish portfolio before applying.',
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[3]._id, // Microsoft AI
        status: 'offered',
        appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        notes: 'Received official offer letter! Stipend ₹1,00,000/mo. Acceptance deadline in 7 days.',
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[7]._id, // Zerodha
        status: 'saved',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Remote role. Preparing blog post link on algorithmic execution.',
      }
    ];

    await Application.insertMany(sampleApps);
    console.log(`Created ${sampleApps.length} applications.`);

    console.log('Creating sample in-app Notifications...');

    const sampleNotifications = [
      {
        userId: studentUser._id,
        internshipId: insertedInternships[0]._id,
        channel: 'in-app',
        title: '🎯 High Match: Machine Learning Engineering Intern',
        message: 'Google posted a new opening with a 94% match for your Python, Machine Learning, and NLP skills!',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveryStatus: 'sent',
        isRead: false,
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[1]._id,
        channel: 'in-app',
        title: '💼 Application Status Update: Razorpay',
        message: 'Your application status for Frontend React.js Developer Intern has moved to Interviewing!',
        sentAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        deliveryStatus: 'sent',
        isRead: false,
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[3]._id,
        channel: 'in-app',
        title: '🎉 Congratulations: Offer Received!',
        message: 'Microsoft has extended an internship offer for AI & Data Science Intern.',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        deliveryStatus: 'sent',
        isRead: true,
      },
      {
        userId: studentUser._id,
        internshipId: insertedInternships[7]._id,
        channel: 'in-app',
        title: '📅 Weekly Monitoring Digest',
        message: '3 new remote internships matching your preferences were discovered during the weekly automated scan.',
        sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        deliveryStatus: 'sent',
        isRead: true,
      }
    ];

    await Notification.insertMany(sampleNotifications);
    console.log(`Created ${sampleNotifications.length} notifications.`);

    console.log('Creating sample Monitoring Run audit record...');

    await MonitoringRun.create({
      source: 'weekly-cron',
      startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 48 * 60 * 60 * 1000 + 12500),
      status: 'completed',
      newListingCount: 14,
      matchedStudentCount: 38,
      duration: 12500,
      errors: []
    });

    console.log('----------------------------------------------------');
    console.log('✅ SEEDING COMPLETE!');
    console.log('Demo Credentials:');
    console.log('Student Login: student@example.com / student123');
    console.log('Admin Login:   admin@internshipfinder.com / admin123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
