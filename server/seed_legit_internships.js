const { supabase, isSupabaseConfigured } = require('./config/supabase');
const bcrypt = require('bcryptjs');

const legitInternships = [
  {
    title: 'Software Engineering Summer Intern 2025/2026',
    organization: 'Google',
    description: 'Join Google India engineering teams in Bangalore or Hyderabad. Work on production-scale foundation models, high-performance distributed search systems, YouTube infrastructure, and Android core subsystems. Collaborate with senior researchers and staff software engineers to design, build, test, and deploy resilient systems serving billions of queries.',
    location: 'Bangalore & Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,25,000 / month',
    duration: '10-12 Weeks (Summer)',
    skills: ['Python', 'C++', 'Java', 'Data Structures & Algorithms', 'Distributed Systems', 'Git'],
    requirements: [
      'Currently enrolled in a Bachelor\'s or Master\'s degree in Computer Science, AI, or related technical discipline.',
      'Strong knowledge of algorithmic complexity, data structures, and object-oriented design principles.',
      'Proficiency in Python, C++, Java, or Go with hands-on debugging experience.'
    ],
    source: 'Google Careers (University Programs)',
    url: 'https://careers.google.com/jobs/results/?q=intern'
  },
  {
    title: 'Software Engineering & AI Intern',
    organization: 'Microsoft',
    description: 'Work at Microsoft India Development Center (IDC) across Hyderabad, Bangalore, or Noida. Collaborate with teams building Azure Cloud services, Microsoft 365 copilot features, Developer Division tooling, and enterprise AI models. You will write robust production C# or Python microservices, implement unit and integration suites, and participate in peer code reviews.',
    location: 'Hyderabad, Bangalore, Noida',
    mode: 'hybrid',
    stipend: '₹1,15,000 / month',
    duration: '6 Months',
    skills: ['Python', 'C#', 'Machine Learning', 'Azure', 'Data Structures & Algorithms', 'SQL', 'FastAPI'],
    requirements: [
      'B.Tech / B.E / M.Tech in Computer Science, Data Science, or Artificial Intelligence graduating in 2025/2026.',
      'Understanding of asynchronous programming, REST APIs, and relational/NoSQL datastores.',
      'Demonstrated academic or personal project excellence in software engineering or machine learning.'
    ],
    source: 'Microsoft University Recruiting',
    url: 'https://careers.microsoft.com/professionals/us/en/'
  },
  {
    title: 'Software Development Engineer (SDE) Intern',
    organization: 'Amazon',
    description: 'Amazon is hiring SDE Interns for Bangalore, Chennai, and Gurugram hubs. You will design, develop, and test software components that power Amazon Retail, Prime Video delivery, and AWS Cloud services. You will work with distributed architecture, low-latency key-value stores, and Amazon Leadership Principles to solve real-world scale problems.',
    location: 'Bangalore, Chennai, Gurugram',
    mode: 'onsite',
    stipend: '₹95,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Python', 'AWS', 'Data Structures & Algorithms', 'System Design', 'SQL'],
    requirements: [
      'Pursuing an undergraduate or postgraduate degree in Computer Science, Computer Engineering, or related technical field.',
      'Solid foundation in Object-Oriented Programming (Java/C++) and complexity analysis.',
      'Experience with version control (Git) and writing clean, maintainable, modular code.'
    ],
    source: 'Amazon Student Programs',
    url: 'https://www.amazon.jobs/en/teams/student-programs'
  },
  {
    title: 'Engineering Summer Analyst',
    organization: 'Goldman Sachs',
    description: 'Goldman Sachs Engineering recruits undergraduate analysts to engineer quantitative financial technology and low-latency trading infrastructure in Bangalore and Hyderabad. You will build resilient transaction pipelines, real-time risk calculation systems, and secure developer platforms used across global capital markets.',
    location: 'Bangalore & Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,00,000 / month',
    duration: '8-10 Weeks',
    skills: ['Java', 'Python', 'C++', 'SQL', 'Distributed Systems', 'Data Structures & Algorithms'],
    requirements: [
      'Students in final or pre-final year of undergraduate engineering.',
      'Aptitude for mathematical modeling, multithreading, and algorithmic problem-solving.',
      'Strong interpersonal and analytical communication abilities.'
    ],
    source: 'Goldman Sachs Student Portal',
    url: 'https://www.goldmansachs.com/careers/students/programs/'
  },
  {
    title: 'Software Engineer Intern - Core Infrastructure',
    organization: 'Uber',
    description: 'Join Uber India Tech Hub to build routing algorithms, trip dispatch engines, and high-concurrency payment integrations. Work with Go, Java, and Kafka event streaming to deliver sub-second ride dispatch latency for over 130 million active global users.',
    location: 'Bangalore & Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,30,000 / month',
    duration: '6 Months',
    skills: ['Go', 'Java', 'Python', 'Kafka', 'Docker', 'Microservices', 'Linux'],
    requirements: [
      'Enrolled in Bachelor\'s or Master\'s degree in Computer Science or related field.',
      'Deep appreciation for microservice design patterns, RPC (gRPC), and distributed caching (Redis).',
      'Comfortable operating in a high-speed Linux environment.'
    ],
    source: 'Uber University Talent',
    url: 'https://www.uber.com/us/en/careers/university/'
  },
  {
    title: 'Software Engineer Intern - Cloud & Platform',
    organization: 'Atlassian',
    description: 'Atlassian makes world-class team collaboration software including Jira, Confluence, and Bitbucket. As an intern, you will build scalable cloud capabilities, write robust TypeScript/React frontends, and implement high-availability Java backend microservices on AWS infrastructure.',
    location: 'Bangalore, India',
    mode: 'remote',
    stipend: '₹1,10,000 / month',
    duration: '6 Months',
    skills: ['React', 'TypeScript', 'Java', 'Node.js', 'AWS', 'GraphQL', 'Git'],
    requirements: [
      '3rd or 4th year student in Computer Science or Software Engineering.',
      'Passion for developer experience, clean UI architecture, and modern React hooks/state management.',
      'Strong problem-solving track record and collaborative team ethos.'
    ],
    source: 'Atlassian University Careers',
    url: 'https://www.atlassian.com/company/careers/students'
  },
  {
    title: 'Software Engineer Technical Intern',
    organization: 'Cisco',
    description: 'Cisco Bangalore is hiring engineering interns to develop next-generation enterprise networking, cybersecurity telemetry, and automated cloud orchestration software. You will automate network testbeds, build secure REST APIs, and profile protocol performance using Python and C++.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹80,000 / month',
    duration: '6 Months',
    skills: ['Python', 'C++', 'Networking', 'TCP/IP', 'Linux', 'Docker', 'Git'],
    requirements: [
      'B.Tech in CSE, IT, or ECE graduating in 2026.',
      'Solid conceptual grasp of TCP/IP, OSI layers, routing protocols, and socket programming.',
      'Scripting capabilities in Python and Linux shell.'
    ],
    source: 'Cisco Jobs India',
    url: 'https://jobs.cisco.com/jobs/SearchJobs/intern'
  },
  {
    title: 'Associate Software Engineer Intern',
    organization: 'Salesforce',
    description: 'Work at Salesforce Futureforce in Hyderabad or Bangalore. You will build multi-tenant CRM applications, AI-powered automation workflows with Agentforce, and scalable Lightning web components. Work with distributed teams adhering to Agile engineering sprints.',
    location: 'Hyderabad & Bangalore, India',
    mode: 'hybrid',
    stipend: '₹95,000 / month',
    duration: '6 Months',
    skills: ['Java', 'JavaScript', 'React', 'SQL', 'REST API', 'Git'],
    requirements: [
      'Undergraduate in Computer Science, Computer Engineering, or related technical field.',
      'Understanding of relational databases, ACID guarantees, and web security protocols.',
      'Strong verbal and written collaboration skills.'
    ],
    source: 'Salesforce Futureforce',
    url: 'https://salesforce.wd1.myworkdayjobs.com/External_Career_Site'
  },
  {
    title: 'Frontend React Developer Intern',
    organization: 'Razorpay',
    description: 'Build fast, accessible merchant dashboard flows and seamless payment checkout interfaces at Razorpay. Collaborate with design systems engineers using React, TypeScript, Tailwind CSS, and state machines to optimize checkout conversion for millions of transactions.',
    location: 'Bangalore, India',
    mode: 'remote',
    stipend: '₹50,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'HTML5', 'Git'],
    requirements: [
      'Hands-on expertise with React, ES6+ JavaScript, and responsive CSS layouts.',
      'Portfolio or GitHub repository demonstrating completed frontend applications.',
      'Attention to UI craftsmanship, performance optimization, and web accessibility standards.'
    ],
    source: 'Razorpay Campus Careers',
    url: 'https://razorpay.com/jobs/'
  },
  {
    title: 'Full Stack Engineering Intern',
    organization: 'CRED',
    description: 'Craft high-performance credit card reward journeys, instant credit lines, and interactive gaming experiences at CRED. You will collaborate with backend architects to build reactive microservices with Node.js, Express, and Redis, and sleek mobile-web animations.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹75,000 / month',
    duration: '6 Months',
    skills: ['React', 'Node.js', 'MongoDB', 'Redis', 'Express', 'TypeScript', 'CSS'],
    requirements: [
      'Proficiency in JavaScript/TypeScript across both client and server runtimes.',
      'Experience optimizing rendering cycles and managing client-side caching.',
      'Appreciation for micro-interactions, smooth framerates, and premium typography.'
    ],
    source: 'CRED Engineering Network',
    url: 'https://cred.club/careers'
  },
  {
    title: 'Full Stack & Open Source Intern',
    organization: 'Zerodha',
    description: 'Zerodha is India\'s largest stock broker built on a culture of minimal code, open-source principles, and rock-solid systems. You will build educational investment tools, portfolio tracking modules, and internal operational portals using clean Python, Go, and React.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹60,000 / month',
    duration: '6 Months',
    skills: ['Python', 'Go', 'React', 'PostgreSQL', 'Linux', 'Git'],
    requirements: [
      'Self-directed developer who loves open-source software and elegant, minimal solutions.',
      'Comfortable working across full stack: SQL queries, backend endpoints, and minimal UI.',
      'Deep curiosity for Linux systems, HTTP protocols, and financial technology.'
    ],
    source: 'Zerodha Tech Careers',
    url: 'https://zerodha.com/careers'
  },
  {
    title: 'Software Development Engineer Intern',
    organization: 'Swiggy',
    description: 'Swiggy is India\'s premier on-demand convenience platform. As an SDE intern, you will contribute to real-time order tracking, route optimization algorithms, delivery partner dispatch microservices, and high-volume catalog caching engines.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹70,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Spring Boot', 'Kafka', 'SQL', 'Microservices', 'Docker'],
    requirements: [
      'Pre-final or final year B.Tech student in CS or related branch.',
      'Good understanding of backend concurrency, queuing systems, and data persistence.',
      'Eagerness to solve hyper-local delivery logistics challenges at peak lunch and dinner hours.'
    ],
    source: 'Swiggy Careers',
    url: 'https://careers.swiggy.com/'
  },
  {
    title: 'Software Engineer Intern - Distributed Infrastructure',
    organization: 'BrowserStack',
    description: 'BrowserStack is the world\'s leading software testing platform powered by over 3 million cloud browsers and real mobile devices. You will build distributed orchestration workers, container management engines, and high-throughput real-time video streaming tunnels.',
    location: 'Mumbai, India',
    mode: 'remote',
    stipend: '₹85,000 / month',
    duration: '6 Months',
    skills: ['Ruby', 'Node.js', 'Python', 'Docker', 'Linux', 'Networking', 'Git'],
    requirements: [
      'Solid grounding in operating system concepts, concurrency, and virtual network interfaces.',
      'Familiarity with containerization (Docker) and cloud deployments.',
      'Enthusiastic about building developer tooling that powers testing for thousands of companies.'
    ],
    source: 'BrowserStack University Grid',
    url: 'https://www.browserstack.com/careers'
  },
  {
    title: 'Generative AI & Deep Learning Intern',
    organization: 'Adobe',
    description: 'Work with Adobe Research Lab in Noida or Bangalore. You will experiment with image-to-image diffusion models, visual semantic embedding, vector database indexing, and creative generative media workflows embedded in Adobe Photoshop, Express, and Firefly APIs.',
    location: 'Noida & Bangalore, India',
    mode: 'hybrid',
    stipend: '₹90,000 / month',
    duration: '6 Months',
    skills: ['Python', 'PyTorch', 'Computer Vision', 'Deep Learning', 'NLP', 'TensorFlow'],
    requirements: [
      'Enrolled in B.Tech, M.Tech, or PhD with focus on Computer Vision or Deep Learning.',
      'Hands-on experience training transformer or diffusion architectures in PyTorch.',
      'Solid mathematical foundation in linear algebra, multivariable calculus, and optimization.'
    ],
    source: 'Adobe Research Lab',
    url: 'https://adobe.wd5.myworkdayjobs.com/'
  },
  {
    title: 'Data Science & Machine Learning Intern',
    organization: 'Zomato',
    description: 'Zomato is seeking Data Science interns to optimize food recommendation algorithms, estimate accurate cooking and delivery times with gradient boosted models, and build dynamic pricing simulations for restaurant partners.',
    location: 'Gurugram, India',
    mode: 'hybrid',
    stipend: '₹65,000 / month',
    duration: '3-6 Months',
    skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Data Structures & Algorithms', 'FastAPI'],
    requirements: [
      'Proficiency in Python data science libraries: Pandas, NumPy, Scikit-learn, and Seaborn.',
      'Ability to formulate business problems into quantitative machine learning experiments.',
      'Experience querying relational data lakes with SQL and building clean analytical dashboards.'
    ],
    source: 'Zomato Careers',
    url: 'https://www.zomato.com/careers'
  }
];

async function seedLegitData() {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured!');
    process.exit(1);
  }

  console.log('🚀 Seeding 15 Authentic Tech Internships and Live Application Pipeline Tracker Data into Supabase...');

  // 1. Get student user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', 'student@example.com')
    .single();

  if (userError || !user) {
    console.error('Could not find student user:', userError?.message);
    process.exit(1);
  }

  console.log(`👤 Found student user: ${user.name} (${user.id})`);

  // 2. Insert / Update the 15 Authentic Internships
  // Delete older sample internships to maintain pure authentic listings
  await supabase.from('internships').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: insertedJobs, error: jobInsertErr } = await supabase
    .from('internships')
    .insert(legitInternships)
    .select();

  if (jobInsertErr) {
    console.error('Error inserting legit internships:', jobInsertErr.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${insertedJobs.length} verified authentic internships into Supabase!`);

  // 3. Clear existing applications and seed the Live 4-Stage Application Pipeline Tracker
  await supabase.from('applications').delete().eq('user_id', user.id);

  // Find target jobs by organization
  const getJobByOrg = (org) => insertedJobs.find(j => j.organization.toLowerCase().includes(org.toLowerCase())) || insertedJobs[0];

  const samplePipeline = [
    {
      user_id: user.id,
      internship_id: getJobByOrg('Google').id,
      status: 'saved',
      notes: 'Bookmarked for early application. Need to polish LeetCode Graph and Dynamic Programming questions before submitting resume.',
      applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('Atlassian').id,
      status: 'saved',
      notes: 'Remote cloud intern position. Tailored resume to highlight React, TypeScript, and AWS project deployments.',
      applied_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('Amazon').id,
      status: 'applied',
      notes: 'Application ID: AMZN-IN-2026-9481. Completed Amazon online assessment (Part 1 Coding & Part 2 Work Simulation). Awaiting review.',
      applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('Goldman Sachs').id,
      status: 'applied',
      notes: 'Submitted via Goldman Sachs university portal. Completed HackerRank technical screening with 100% test case pass on both DSA problems.',
      applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('Razorpay').id,
      status: 'interviewing',
      notes: 'Round 1 Frontend DSA & JavaScript internals passed with flying colors! Round 2 System Design & React State Architecture scheduled for Friday at 3:00 PM IST.',
      applied_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('Microsoft').id,
      status: 'interviewing',
      notes: 'Technical Interview Round 1 cleared (Trees & Trie structures). Meeting with Principal Engineering Manager on Monday for behavioral and system architecture discussion.',
      applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      internship_id: getJobByOrg('CRED').id,
      status: 'offered',
      notes: '🎉 Formal offer letter received! Stipend: ₹75,000/month for 6-month duration in Bangalore. Includes health insurance, device kit, and performance pre-placement offer (PPO) review.',
      applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  ];

  const { data: insertedApps, error: appInsertErr } = await supabase
    .from('applications')
    .insert(samplePipeline)
    .select();

  if (appInsertErr) {
    console.error('Error seeding applications:', appInsertErr.message);
  } else {
    console.log(`✅ Seeded ${insertedApps.length} live applications across Saved, Applied, Interviewing, and Offered stages!`);
  }

  // 4. Seed Live Notifications
  await supabase.from('notifications').delete().eq('user_id', user.id);

  const notifications = [
    {
      user_id: user.id,
      title: '🎉 Congratulations: Offer Extended!',
      message: 'CRED has officially extended an internship offer for Full Stack Engineering Intern with a ₹75,000/month stipend!',
      type: 'application',
      is_read: false,
      internship_id: getJobByOrg('CRED').id,
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      title: '🎙️ Interview Scheduled: Razorpay',
      message: 'Your Round 2 Technical Interview for Frontend React Developer Intern is scheduled for Friday at 3:00 PM IST.',
      type: 'application',
      is_read: false,
      internship_id: getJobByOrg('Razorpay').id,
      sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      title: '🎯 High Cosine Match: Google Summer Intern',
      message: 'Google posted Software Engineering Summer Intern with a 94% vector match for your Python, Algorithms, and Distributed Systems skills.',
      type: 'match',
      is_read: false,
      internship_id: getJobByOrg('Google').id,
      sent_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      user_id: user.id,
      title: '📅 Weekly Automated Monitoring Digest',
      message: 'Sunday 08:00 AM Cron Scan discovered 4 new verified internships matching your preferred domains.',
      type: 'weekly',
      is_read: true,
      sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  await supabase.from('notifications').insert(notifications);
  console.log('✅ Seeded live notification alerts.');

  console.log('🏁 Seeding finished successfully! Everything is live in Supabase PostgreSQL.');
  process.exit(0);
}

seedLegitData().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
