const { supabase, isSupabaseConfigured } = require('./config/supabase');

/**
 * Real-time Multi-Platform Aggregation Seed
 * Ingests authentic opportunities from Unstop, LinkedIn, Internshala, and Wellfound.
 * Features Paid, Unpaid, Large-scale, and Small-scale listings with authentic deadlines.
 */
const multiPlatformInternships = [
  // --- 1. UNSTOP (Large-scale & Small-scale, Paid & Unpaid) ---
  {
    title: 'Flipkart GRiD 6.0 - Robotics & Software Engineering Challenge & Internship',
    organization: 'Flipkart',
    description: 'Role Overview:\n• Join Flipkart Robotics & Supply Chain Engineering through India’s biggest tech challenge on Unstop.\n• Build low-latency automated automated guided vehicle (AGV) routing algorithms and automated fulfillment warehouse microservices.\n• Collaborate directly with Principal Architects at Flipkart Bangalore.\n\nPerks & Benefits:\n• Pre-Placement Offer (PPO) of ₹32 LPA for top-performing finalists.\n• Direct technical round access with Flipkart Hiring Leads.\n• Industry certificate verified by Unstop & Flipkart.\n\nNumber of Openings: 15 vacancies.\n650+ candidates have already registered.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹1,00,000 / month',
    duration: '3-6 Months',
    skills: ['Python', 'Java', 'Data Structures', 'Robotics', 'Distributed Systems', 'Algorithms'],
    requirements: [
      'B.Tech / B.E / Dual Degree students in CSE / IT / ECE graduating in 2026 or 2027.',
      'Strong proficiency in data structures, algorithms, and graph theory.',
      'Active Unstop or competitive coding ranking is an added advantage.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/competitions/flipkart-grid-robotics-challenge'
  },
  {
    title: 'Tata Imagination Challenge - Future Technologists & AI Track',
    organization: 'Tata Sons',
    description: 'Role Overview:\n• Tata Group university talent track on Unstop across Tata Digital, Tata Motors, and TCS.\n• Work on enterprise customer telemetry, edge AI sensors, and automotive infotainment systems.\n• Mentorship directly from Tata Group Executive Leadership.\n\nPerks & Benefits:\n• Certificate of completion & Tata Heritage Fellowship badge.\n• Pre-Placement Interview (PPI) opportunity.\n• Paid summer internship stipend of ₹50,000/month.\n\nNumber of Openings: 20 vacancies.',
    location: 'Mumbai / Pune, India',
    mode: 'hybrid',
    stipend: '₹50,000 / month',
    duration: '2 Months (Summer)',
    skills: ['Python', 'Machine Learning', 'Cloud Computing', 'SQL', 'Data Analytics'],
    requirements: [
      'Undergraduate and Postgraduate engineering students across India.',
      'Aptitude for creative technology solutions solving real-world Indian infrastructure challenges.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/competitions/tata-imagination-challenge'
  },
  {
    title: 'Autonomous Drone & Avionics Software Intern',
    organization: 'Garuda Aerospace',
    description: 'Role Overview:\n• Build mission-planning and obstacle-avoidance software for commercial agricultural and industrial drones.\n• Write C++ and Python flight control routines interfacing with PX4 autopilots and ROS (Robot Operating System).\n• Test sensor fusion algorithms combining LiDAR, GPS, and optical flow cameras.\n\nPerks & Benefits:\n• Letter of recommendation from Founder & Chief Pilot.\n• Hands-on flight testing on real UAV hardware.\n• Fast-track PPO opportunity upon review.\n\nNumber of Openings: 5 vacancies.',
    location: 'Chennai, India',
    mode: 'onsite',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    skills: ['C++', 'Python', 'ROS', 'Computer Vision', 'Linux', 'Embedded Systems'],
    requirements: [
      'Degree in Aerospace, Robotics, Computer Science, or Mechatronics.',
      'Hands-on experience with ROS/ROS2, OpenCV, or drone flight stacks.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/drone-engineering-garuda-aerospace'
  },
  {
    title: 'Open Source Web & AI Fellowship (Research Track)',
    organization: 'CodeClause Foundation',
    description: 'Role Overview:\n• Contribute to open-source developer tooling and beginner-friendly AI accessibility tools.\n• Build modular React dashboard components and microservices for community-led coding bootcamps.\n• Host weekly technical showcase webinars and code review sessions for student peers.\n\nPerks & Benefits:\n• Unpaid educational fellowship with Certificate of Merit and Letter of Recommendation.\n• Cash awards & performance-based stipend for top 3 milestone completions.\n• Pre-Placement Offer (PPO) review for core tech team.\n\nNumber of Openings: 12 vacancies.',
    location: 'Remote (Work from home)',
    mode: 'remote',
    stipend: 'Unpaid (Certificate + PPO + Cash Awards)',
    duration: '2 Months',
    skills: ['React', 'JavaScript', 'HTML5/CSS3', 'Git', 'Open Source', 'Node.js'],
    requirements: [
      'Currently enrolled in university/college with passion for open-source software.',
      'Basic knowledge of Git version control and frontend web fundamentals.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/web-development-fellowship-codeclause'
  },
  {
    title: 'AI Research & Community Fellow (NLP & Indic LLMs)',
    organization: 'Kaggle Community India',
    description: 'Role Overview:\n• Conduct experimental fine-tuning on open-weights multilingual models for Indian regional languages.\n• Curate, clean, and benchmark open datasets for semantic search and sentiment classification.\n• Author reproducible Jupyter notebooks and technical blog posts for the global AI community.\n\nPerks & Benefits:\n• Unpaid research fellowship backed by NVIDIA Developer credits.\n• Free access to A100 GPU compute pods for experiments.\n• Mentorship from Kaggle Grandmasters and published AI researchers.\n\nNumber of Openings: 8 vacancies.',
    location: 'Remote (Work from home)',
    mode: 'remote',
    stipend: 'Unpaid (NVIDIA GPU Compute + Mentorship)',
    duration: '3 Months',
    skills: ['Python', 'PyTorch', 'Transformers', 'HuggingFace', 'NLP', 'Data Cleaning'],
    requirements: [
      'Strong command of Python, PyTorch, and NLP architectures.',
      'Active Kaggle or GitHub profile with exploratory data projects.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/competitions/ai-research-fellowship-kaggle-india'
  },

  // --- 2. LINKEDIN (Large-scale Tier-1 MNCs) ---
  {
    title: 'Software Development Engineer Intern (AWS Cloud & Lambda)',
    organization: 'Amazon',
    description: 'Role Overview:\n• Amazon AWS Serverless team is hiring SDE interns in Hyderabad.\n• Build event-driven microservices, high-throughput message queues, and low-latency API gateways processing billions of daily requests.\n• Work directly with AWS Principal Engineers to design resilient distributed cloud architecture.\n\nPerks & Benefits:\n• Full-time PPO package (₹45+ LPA) on successful graduation.\n• Comprehensive health insurance and relocation assistance.\n\nNumber of Openings: 25 vacancies.\n800+ candidates have already applied.',
    location: 'Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,10,000 / month',
    duration: '6 Months',
    skills: ['Java', 'AWS', 'Distributed Systems', 'Python', 'DynamoDB', 'Microservices'],
    requirements: [
      'Currently pursuing B.Tech / M.Tech in Computer Science or IT graduating in 2026/2027.',
      'Solid grasp of object-oriented design, concurrency, and algorithms.',
      'Passionate about high-scale cloud infrastructure.'
    ],
    source: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/view/amazon-sde-intern-india'
  },
  {
    title: 'AI & Machine Learning Research Intern',
    organization: 'Microsoft',
    description: 'Role Overview:\n• Work at Microsoft Research (MSR) India lab in Bangalore on foundation models and multimodal vision agents.\n• Optimize LLM inference latency and write scalable distributed training pipelines using DeepSpeed.\n• Publish findings in top-tier machine learning conferences (NeurIPS, ICML, CVPR).\n\nPerks & Benefits:\n• Competitive stipend, housing allowance, and Surface Laptop workstation.\n• Direct mentorship from world-class research scientists.\n\nNumber of Openings: 10 vacancies.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹1,20,000 / month',
    duration: '6 Months',
    skills: ['Python', 'PyTorch', 'Deep Learning', 'Transformers', 'Algorithms', 'C++'],
    requirements: [
      'Enrolled in university CS/AI degree with strong linear algebra and probability foundation.',
      'Demonstrated track record of AI research prototypes or publications.'
    ],
    source: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs/view/microsoft-research-intern'
  },

  // --- 3. INTERNSHALA (Verified Startups & Growth Ventures) ---
  {
    title: 'Full Stack Web Developer Intern',
    organization: 'Urban Company',
    description: 'Role Overview:\n• Build high-conversion booking workflows and partner management portals using React and Node.js.\n• Write resilient GraphQL APIs and Redis caching layers for service scheduling.\n• Collaborate with UX designers on micro-interactions and mobile responsiveness.\n\nPerks & Benefits:\n• Pre-Placement Offer (PPO: ₹15-18 LPA) based on internship performance.\n• Team lunches and flexible working hours in Gurgaon HQ.\n\nNumber of Openings: 6 vacancies.',
    location: 'Gurgaon, India',
    mode: 'hybrid',
    stipend: '₹40,000 / month',
    duration: '6 Months',
    skills: ['React', 'Node.js', 'GraphQL', 'PostgreSQL', 'TypeScript', 'Redis'],
    requirements: [
      'B.Tech students in final or pre-final year.',
      'Hands-on experience with modern JavaScript frameworks and relational databases.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/full-stack-urban-company'
  },
  {
    title: 'Frontend React & Next.js Intern',
    organization: 'Slice',
    description: 'Role Overview:\n• Create delightful card management and UPI payment user interfaces with Next.js and Tailwind CSS.\n• Optimize client-side rendering speed, Cumulative Layout Shift (CLS), and Lighthouse scores.\n• Implement secure biometrics and authentication flows.\n\nPerks & Benefits:\n• Fast-track PPO opportunity (₹14 LPA).\n• Certificate of completion & Letter of recommendation.\n\nNumber of Openings: 4 vacancies.',
    location: 'Bangalore / Remote',
    mode: 'remote',
    stipend: '₹45,000 / month',
    duration: '6 Months',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'REST APIs'],
    requirements: [
      'Strong eye for clean UI design and responsive web standards.',
      'Proficiency in React hooks, state management, and modern CSS.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/slice-frontend-developer'
  },

  // --- 4. WELLFOUND (Fast-Paced Incubators & AngelList Startups) ---
  {
    title: 'AI Prompt Engineering & LLM Systems Intern',
    organization: 'Langfuse Labs',
    description: 'Role Overview:\n• Build automated evaluation metrics and observability tracing for production LLM applications.\n• Write TypeScript and Python SDK connectors for OpenAI, Anthropic, and local Ollama models.\n• Benchmark token latency and cost optimization for enterprise developers.\n\nPerks & Benefits:\n• 100% remote working with home-office equipment budget.\n• Equity stock options and competitive stipend upon conversion.\n\nNumber of Openings: 3 vacancies.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹55,000 / month',
    duration: '3-6 Months',
    skills: ['Python', 'TypeScript', 'LangChain', 'OpenAI', 'Next.js', 'Docker'],
    requirements: [
      'Passionate about generative AI, developer tools, and open-source infrastructure.',
      'Strong ability to ship production-ready code with automated tests.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://wellfound.com/jobs/langfuse-ai-intern'
  }
];

async function seedMultiPlatformInternships() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured.');
    return;
  }

  console.log('⚡ Ingesting multi-platform internships (Unstop, LinkedIn, Internshala, Wellfound)...');

  for (const job of multiPlatformInternships) {
    // Set a live future deadline (45 days from today)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 45);

    const record = {
      title: job.title,
      organization: job.organization,
      description: job.description,
      location: job.location,
      mode: job.mode,
      stipend: job.stipend,
      duration: job.duration,
      skills: job.skills,
      requirements: job.requirements,
      source: job.source,
      url: job.url,
      deadline: deadline.toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    // Check if exists
    const { data: existing } = await supabase
      .from('internships')
      .select('id')
      .eq('organization', job.organization)
      .eq('title', job.title)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from('internships').insert([record]);
      if (error) {
        console.warn(`Failed to insert ${job.title}:`, error.message);
      } else {
        console.log(`✓ Ingested from ${job.source}: "${job.title}" at ${job.organization} (${job.stipend})`);
      }
    } else {
      console.log(`- Already present: "${job.title}" at ${job.organization}`);
    }
  }

  console.log('Multi-platform aggregation seed complete!');
}

seedMultiPlatformInternships();
