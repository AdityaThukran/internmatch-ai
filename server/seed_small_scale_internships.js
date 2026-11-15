const { supabase, isSupabaseConfigured } = require('./config/supabase');

const smallScaleInternships = [
  {
    title: 'Node.js Development',
    organization: 'Anshumat Foundation',
    description: 'Role Overview:\n• Develop full-stack features and responsive UIs using Next.js, React, TypeScript, Node.js, PostgreSQL, and REST APIs.\n• Implement backend APIs, database operations, testing, and debugging with AI coding tools and under senior guidance.\n• Participate in code reviews, technical discussions, documentation, and end-to-end ownership of assigned capabilities.\n\nPerks & Benefits:\n• Certificate of completion\n• Letter of recommendation\n• Flexible work hours (Work from home)\n• Pre-placement Job Offer (PPO) post internship based on performance evaluation.\n\nNumber of Openings: 4 vacancies.\n150+ candidates have already applied.',
    location: 'Remote (Work from home)',
    mode: 'remote',
    stipend: '₹20,000 / month',
    duration: '6 Months',
    skills: ['Node.js', 'Next.js', 'React', 'TypeScript', 'PostgreSQL', 'REST APIs', 'MongoDB', 'Git'],
    requirements: [
      'Currently pursuing or recently completed a degree in Computer Science, Engineering, or related field.',
      'Strong JavaScript/TypeScript, React, and web development fundamentals.',
      'Hands-on experience with Next.js, Node.js, REST APIs, PostgreSQL, Git/GitHub, and AI coding tools; built at least one project.',
      'Problem-solving skills, willingness to learn, ownership mindset, ability to work independently.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/matching-preferences/'
  },
  {
    title: 'Full Stack Engineering Intern (Fast-Track)',
    organization: 'Zepto',
    description: 'Role Overview:\n• Build high-concurrency order dispatching services and real-time delivery tracking UIs.\n• Collaborate with engineering leads to write reactive Node.js microservices and low-latency Redis caching layers.\n• Optimize SQL queries and PostgreSQL index performance.\n\nPerks:\n• Pre-Placement Offer (PPO) of ₹16 LPA upon successful internship completion.\n• Flexible work hours and team lunches in Bangalore office.\n\nNumber of Openings: 6 vacancies.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹45,000 / month',
    duration: '6 Months',
    skills: ['React', 'Node.js', 'Redis', 'PostgreSQL', 'Docker', 'REST APIs', 'TypeScript'],
    requirements: [
      'B.Tech / B.E student in CSE / IT graduating in 2025/2026.',
      'Demonstrated experience with React state management and Express / Fastify.',
      'Familiarity with distributed caching and caching invalidation strategies.'
    ],
    source: 'Internshala / Startup Hub',
    url: 'https://zeptonow.com/careers'
  },
  {
    title: 'Open Source & GraphQL Backend Intern',
    organization: 'Hasura',
    description: 'Role Overview:\n• Contribute to open-source GraphQL data access engines and cloud connector plugins.\n• Write clean, high-performance Go and Node.js microservices for database event triggers.\n• Participate in open-source developer documentation and community bug fixes.\n\nPerks:\n• 100% Remote flexibility with home-office setup stipend.\n• Letter of recommendation and fast-track PPO opportunity.\n\nNumber of Openings: 3 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹50,000 / month',
    duration: '3-6 Months',
    skills: ['GraphQL', 'Go', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    requirements: [
      'Passionate about open-source software and database internals.',
      'Understanding of relational schema design and SQL optimization.',
      'Prior contribution to GitHub open-source repositories is a major plus.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://hasura.io/careers/'
  },
  {
    title: 'AI Agent & LLM Integration Intern',
    organization: 'DevRev',
    description: 'Role Overview:\n• Build customer support AI copilot agents using LangChain, vector embeddings, and OpenAI APIs.\n• Create interactive Next.js dashboard widgets and real-time WebSocket communication channels.\n• Benchmark LLM prompt accuracy and optimize vector retrieval latency.\n\nPerks:\n• Pre-Placement Offer (PPO: ₹14-18 LPA) for high-performing interns.\n• MacBook Pro developer machine provided for duration of internship.\n\nNumber of Openings: 5 vacancies.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹60,000 / month',
    duration: '6 Months',
    skills: ['Python', 'LangChain', 'FastAPI', 'React', 'Vector Databases', 'NLP'],
    requirements: [
      'Degree in Computer Science, Artificial Intelligence, or Data Science.',
      'Strong hands-on experience building generative AI / RAG prototypes.',
      'Clean code craftsmanship with unit and integration tests.'
    ],
    source: 'LinkedIn Startups',
    url: 'https://devrev.ai/careers'
  },
  {
    title: 'Frontend & Generative Canvas Intern',
    organization: 'InVideo',
    description: 'Role Overview:\n• Build intuitive browser-based video editing timelines using React, TypeScript, and HTML5 Canvas.\n• Collaborate with product designers to implement pixel-perfect micro-animations and responsive components.\n• Profile memory consumption and GPU hardware acceleration in modern web browsers.\n\nPerks:\n• Letter of recommendation from VP of Engineering.\n• Certificate of completion and flexible remote working hours.\n\nNumber of Openings: 4 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹35,000 / month',
    duration: '6 Months',
    skills: ['React', 'TypeScript', 'HTML5 Canvas', 'CSS3', 'WebGL', 'State Management'],
    requirements: [
      'Undergraduate student with great visual UI design sense and JavaScript depth.',
      'Experience with complex state management (Redux, Zustand, or MobX).',
      'Enthusiasm for interactive client-side multimedia applications.'
    ],
    source: 'Internshala',
    url: 'https://invideo.io/careers/'
  },
  {
    title: 'Python & Data Engineering Intern',
    organization: 'TechCurators',
    description: 'Role Overview:\n• Build automated data scraping pipelines, ETL workflows, and content classification models.\n• Clean, validate, and structure high-volume technical datasets using Pandas and PostgreSQL.\n• Write lightweight REST APIs using Flask and FastAPI.\n\nPerks:\n• Certificate of internship & letter of recommendation.\n• Direct mentorship from senior data architects.\n\nNumber of Openings: 8 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹25,000 / month',
    duration: '3 Months',
    skills: ['Python', 'SQL', 'Pandas', 'Web Scraping', 'Data Cleaning', 'FastAPI'],
    requirements: [
      'Undergraduate engineering student with strong Python scripting abilities.',
      'Knowledge of relational databases, foreign keys, and SQL queries.',
      'Curiosity in automated data engineering and web scraping tools (BeautifulSoup / Playwright).'
    ],
    source: 'Internshala Verified',
    url: 'https://techcurators.com/careers'
  },
  {
    title: 'React & Mobile Web Developer Intern',
    organization: 'NextGen Labs',
    description: 'Role Overview:\n• Develop responsive web application components using React, Tailwind CSS, and mobile-first patterns.\n• Integrate RESTful backend APIs and manage authentication flows with JWT.\n• Participate in agile sprints, daily standups, and peer code reviews.\n\nPerks:\n• Startup equity exposure and Certificate of Excellence.\n• Job offer post internship with fast-track promotion path.\n\nNumber of Openings: 5 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹20,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'JavaScript', 'HTML5', 'Tailwind CSS', 'Git', 'REST APIs'],
    requirements: [
      'Enrolled in B.Tech / BCA / MCA or related program.',
      'Built at least 2 personal or academic projects in React / JavaScript.',
      'Eager to learn modern frontend build tooling (Vite, npm, GitHub Actions).'
    ],
    source: 'Internshala',
    url: 'https://nextgenlabs.io'
  },
  {
    title: 'Backend Systems & Cloud Operations Intern',
    organization: 'SuperOps.ai',
    description: 'Role Overview:\n• Design robust microservices for unified PSA-RMM IT management platform.\n• Build asynchronous background job workers using RabbitMQ and Spring Boot.\n• Monitor cloud performance metrics and configure AWS CloudWatch alerts.\n\nPerks:\n• PPO conversion opportunity (₹12-15 LPA package).\n• Comprehensive health insurance and hybrid office perks.\n\nNumber of Openings: 4 vacancies.',
    location: 'Chennai, India',
    mode: 'hybrid',
    stipend: '₹40,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Spring Boot', 'AWS', 'MySQL', 'RabbitMQ', 'Microservices'],
    requirements: [
      'Undergraduate student with strong Java and OOP programming foundations.',
      'Basic knowledge of cloud hosting (AWS / GCP / Azure).',
      'High ownership mindset and analytical problem-solving abilities.'
    ],
    source: 'Wellfound / Startup Hub',
    url: 'https://superops.ai/careers'
  },
  {
    title: 'Frontend Development Intern',
    organization: 'Khatabook',
    description: 'Role Overview:\n• Build high-speed web apps serving millions of small Indian merchant businesses.\n• Write performant TypeScript and React components with custom hooks and minimal bundle size.\n• Work with design systems and internationalization libraries.\n\nPerks:\n• Direct PPO placement opportunity post internship.\n• Annual learning and book stipend.\n\nNumber of Openings: 4 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹40,000 / month',
    duration: '6 Months',
    skills: ['React', 'TypeScript', 'Redux', 'Webpack', 'CSS Modules'],
    requirements: [
      'Final or pre-final year engineering student.',
      'Proficiency in React and modern ECMAScript standards.',
      'Passionate about crafting fast, delightful user experiences for Indian SMBs.'
    ],
    source: 'LinkedIn Startups',
    url: 'https://khatabook.com/careers'
  },
  {
    title: 'Full Stack Community Platform Intern',
    organization: 'Devfolio',
    description: 'Role Overview:\n• Build hacker application submission portals, automated review tools, and interactive hackathon dashboards.\n• Work across the full stack with Next.js, Node.js, and PostgreSQL.\n• Improve developer documentation and automated continuous integration pipelines.\n\nPerks:\n• Exclusive Devfolio swag kit and tech conference ticket sponsorships.\n• Job offer post internship with competitive compensation.\n\nNumber of Openings: 3 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹35,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'GraphQL', 'TypeScript'],
    requirements: [
      'Passionate hacker who has participated in college hackathons.',
      'Experience with full-stack TypeScript / JavaScript development.',
      'Strong team spirit and communication skills.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://devfolio.co/careers'
  }
];

async function seedSmallScale() {
  console.log('Seeding authentic small-scale & startup internships into Supabase...');
  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured');
    process.exit(1);
  }

  // Check existing
  const { data: existing } = await supabase.from('internships').select('title, organization');
  const existingKeys = new Set((existing || []).map(e => `${e.organization.toLowerCase()}-${e.title.toLowerCase()}`));

  let insertedCount = 0;
  for (const item of smallScaleInternships) {
    const key = `${item.organization.toLowerCase()}-${item.title.toLowerCase()}`;
    if (!existingKeys.has(key)) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 45);

      const { error } = await supabase.from('internships').insert([{
        ...item,
        deadline: deadline.toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      }]);

      if (error) {
        console.warn(`Failed to insert ${item.organization}:`, error.message);
      } else {
        insertedCount++;
        console.log(`✓ Inserted: ${item.title} at ${item.organization} (${item.source})`);
      }
    } else {
      console.log(`- Already exists: ${item.title} at ${item.organization}`);
    }
  }

  console.log(`Successfully seeded ${insertedCount} small-scale & startup internships!`);
  process.exit(0);
}

seedSmallScale().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
