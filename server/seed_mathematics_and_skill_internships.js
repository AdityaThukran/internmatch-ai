const { supabase, isSupabaseConfigured } = require('./config/supabase');

/**
 * Seed Mathematics, Quantitative, and Skill-Based Internships
 * For B.Sc Mathematics, Statistics, BCA, B.Com, B.Tech, and Any Graduate.
 * Purely skill-based evaluation!
 */
const mathAndSkillInternships = [
  {
    title: 'Quantitative Research & Mathematical Modeling Intern',
    organization: 'WorldQuant',
    description: 'Role Overview:\n• Apply advanced mathematical algorithms, linear algebra, and probability theory to global financial market datasets.\n• Develop predictive alphas, stochastic models, and time-series forecasting scripts using Python.\n• Work directly with PhD quantitative researchers in Mumbai.\n\nEligible Degrees: B.Sc Mathematics, Statistics, Physics, B.Tech, Economics, or any quantitative degree.\n\nPerks & Benefits:\n• Industry-leading stipend: ₹1,25,000/month.\n• Full-time Quantitative Researcher PPO opportunity (₹40-60 LPA).\n• Access to global supercomputing clusters.\n\nNumber of Openings: 8 vacancies.',
    location: 'Mumbai, India',
    mode: 'hybrid',
    stipend: '₹1,25,000 / month',
    duration: '3-6 Months',
    skills: ['Mathematics', 'Statistics', 'Python', 'Linear Algebra', 'Probability', 'Financial Modeling', 'Algorithms'],
    requirements: [
      'Pursuing or recently completed B.Sc Mathematics, Statistics, Physics, B.Tech, or Economics.',
      'Exceptional mathematical rigor in calculus, probability, and linear algebra.',
      'Proficiency in Python or C++ for data modeling.'
    ],
    source: 'LinkedIn',
    url: 'https://www.worldquant.com/careers/'
  },
  {
    title: 'Data Analyst & Statistical Modeling Intern',
    organization: 'Mu Sigma',
    description: 'Role Overview:\n• Clean, transform, and analyze enterprise customer behavior datasets using SQL, Python, and statistical regression.\n• Build interactive Tableau and PowerBI dashboards for Fortune 500 decision-makers.\n• Frame mathematical hypotheses and validate findings using statistical significance tests.\n\nEligible Degrees: B.Sc Mathematics, Statistics, BCA, B.Sc Computer Science, B.Tech, Any Graduate with strong data aptitude.\n\nPerks & Benefits:\n• Pre-Placement Offer (PPO) opportunities.\n• Rigorous analytics training program at Mu Sigma Academy.\n\nNumber of Openings: 12 vacancies.',
    location: 'Bangalore, India',
    mode: 'onsite',
    stipend: '₹45,000 / month',
    duration: '6 Months',
    skills: ['Statistics', 'SQL', 'Python', 'Excel', 'Data Analytics', 'Mathematics', 'Tableau'],
    requirements: [
      'Degree in Mathematics, Statistics, Computer Applications, or related quantitative discipline.',
      'Curious, first-principles problem solver with high numerical aptitude.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/data-analyst-mu-sigma'
  },
  {
    title: 'Actuarial Risk & Predictive Modeling Intern',
    organization: 'Swiss Re',
    description: 'Role Overview:\n• Build statistical probability models for reinsurance risk evaluation and loss distribution forecasts.\n• Analyze mortality, catastrophe, and asset liability trends with R and Python.\n• Support actuarial pricing teams in automated reserving calculations.\n\nEligible Degrees: B.Sc Mathematics, Actuarial Science, Statistics, Economics, or B.Com.\n\nPerks & Benefits:\n• Competitive stipend, flexible work hours, and study leave for actuarial society exams.\n• Certificate of completion & Letter of recommendation.\n\nNumber of Openings: 5 vacancies.',
    location: 'Bangalore / Remote',
    mode: 'hybrid',
    stipend: '₹50,000 / month',
    duration: '6 Months',
    skills: ['Mathematics', 'Probability', 'Statistics', 'Financial Risk', 'Excel', 'R', 'Python'],
    requirements: [
      'Strong grasp of probability distributions, calculus, and financial mathematics.',
      'Cleared 1+ Actuarial papers (CS1/CM1) or strong mathematics undergraduate record.'
    ],
    source: 'LinkedIn',
    url: 'https://careers.swissre.com/'
  },
  {
    title: 'Machine Learning & Applied Mathematics Intern',
    organization: 'Fractal Analytics',
    description: 'Role Overview:\n• Engineer machine learning models and optimization algorithms for retail demand forecasting and supply chain telemetry.\n• Implement matrix factorization, gradient boosting, and clustering algorithms in Python.\n• Evaluate model drift and performance metrics across production pipelines.\n\nEligible Degrees: B.Sc Mathematics, B.Sc Data Science, BCA, MCA, B.Tech - Open to all skill-level students.\n\nPerks & Benefits:\n• Direct mentorship from Fractal AI Principal Scientists.\n• Fast-track PPO conversion.\n\nNumber of Openings: 7 vacancies.',
    location: 'Gurgaon, India',
    mode: 'hybrid',
    stipend: '₹55,000 / month',
    duration: '6 Months',
    skills: ['Python', 'Mathematics', 'Statistics', 'Machine Learning', 'Pandas', 'SQL'],
    requirements: [
      'Strong foundation in mathematical optimization, multivariable calculus, and linear algebra.',
      'Hands-on experience with Python data science libraries (Pandas, NumPy, Scikit-Learn).'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/applied-ai-fractal'
  },
  {
    title: 'Junior Software & Logic Developer (Skill-Based - All Degrees)',
    organization: 'Zoho',
    description: 'Role Overview:\n• Build core cloud productivity modules and business logic engines. Zoho hires purely on SKILLS — NO degree barrier (B.Sc, B.Com, BCA, BA, B.Tech, or self-taught developers all welcome).\n• Solve algorithmic challenges and implement clean object-oriented code.\n• Participate in system design, database indexing, and automated testing.\n\nEligible Degrees: ALL DEGREES WELCOME (B.Sc Mathematics, BCA, B.Com, B.Tech, etc.) — 100% Skill & Logic Based.\n\nPerks & Benefits:\n• Full-time conversion offer upon successful internship.\n• Free meals and campus amenities at Zoho Estancia Chennai.\n\nNumber of Openings: 20 vacancies.',
    location: 'Chennai / Tenkasi, India',
    mode: 'onsite',
    stipend: '₹35,000 / month',
    duration: '6 Months',
    skills: ['Problem Solving', 'Python', 'Java', 'Data Structures', 'Logic', 'SQL'],
    requirements: [
      'Open to students of ANY degree or background.',
      'Demonstrated programming fundamentals and strong logic/problem-solving aptitude.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://www.zoho.com/careers/'
  },
  {
    title: 'Fintech Data & Quantitative Operations Intern',
    organization: 'Groww',
    description: 'Role Overview:\n• Analyze mutual fund, equity trading, and user portfolio metrics using PostgreSQL and Python.\n• Build automated statistical reconciliation scripts ensuring 100% financial transaction fidelity.\n• Create real-time reporting dashboards for product and compliance teams.\n\nEligible Degrees: B.Sc Mathematics, Statistics, Economics, BCA, B.Tech, B.Com.\n\nPerks & Benefits:\n• Competitive stipend and high-growth fintech exposure.\n• Pre-Placement Offer (PPO: ₹16-20 LPA) potential.\n\nNumber of Openings: 6 vacancies.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹60,000 / month',
    duration: '6 Months',
    skills: ['Python', 'SQL', 'Statistics', 'Data Analytics', 'Mathematics', 'Financial Markets'],
    requirements: [
      'Numerical problem solver with strong interest in capital markets and data analysis.',
      'Comfortable with SQL queries and Python data wrangling.'
    ],
    source: 'Internshala',
    url: 'https://groww.in/careers'
  },
  {
    title: 'Computational Mathematics & Education Content Intern',
    organization: 'Cuemath',
    description: 'Role Overview:\n• Design engaging computational puzzles, interactive geometry widgets, and algebra curriculum modules for K-12 learners.\n• Write Python visualizations illustrating complex calculus and number theory concepts.\n• Collaborate with pedagogical experts to break down challenging mathematical ideas.\n\nEligible Degrees: B.Sc Mathematics, M.Sc Mathematics, Statistics, B.Ed, Any Degree with Math Passion.\n\nPerks & Benefits:\n• Certificate of completion & Letter of recommendation from VP of Learning.\n• Work from home flexibility.\n\nNumber of Openings: 8 vacancies.',
    location: 'Remote (Work from home)',
    mode: 'remote',
    stipend: '₹30,000 / month',
    duration: '3-6 Months',
    skills: ['Mathematics', 'Calculus', 'Algebra', 'Problem Solving', 'Python', 'Pedagogy'],
    requirements: [
      'Degree in Mathematics, Statistics, or engineering with exceptional math passion.',
      'Ability to articulate and simplify abstract mathematical theorems.'
    ],
    source: 'Internshala',
    url: 'https://www.cuemath.com/careers/'
  },
  {
    title: 'Operations & Business Analytics Intern',
    organization: 'Zepto',
    description: 'Role Overview:\n• Optimize dark store delivery routes, inventory replenishment velocity, and labor allocation using statistical analysis.\n• Build SQL queries and automated Excel models monitoring hourly delivery fulfillment metrics.\n• Formulate operational experiments to minimize grocery waste.\n\nEligible Degrees: Open to ALL Degrees: B.Sc, B.Com, BBA, BCA, B.Tech.\n\nPerks & Benefits:\n• Fast-track PPO opportunity (₹12-15 LPA).\n• Team lunches in Bangalore office.\n\nNumber of Openings: 5 vacancies.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹40,000 / month',
    duration: '6 Months',
    skills: ['Excel', 'SQL', 'Data Analysis', 'Operations', 'Problem Solving', 'Mathematics'],
    requirements: [
      'Strong logical thinking and analytical curiosity across any degree discipline.',
      'High proficiency in Microsoft Excel and basic SQL.'
    ],
    source: 'Internshala / Startup Hub',
    url: 'https://zeptonow.com/careers'
  }
];

async function seedMathAndSkillInternships() {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured.');
    return;
  }

  console.log('⚡ Ingesting Mathematics, Quantitative, and Skill-Based Internships for ALL Degrees...');

  for (const job of mathAndSkillInternships) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 50);

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
        console.log(`✓ Ingested: "${job.title}" at ${job.organization} (${job.stipend})`);
      }
    } else {
      console.log(`- Already present: "${job.title}" at ${job.organization}`);
    }
  }

  console.log('Skill-based and Mathematics internships successfully seeded!');
}

seedMathAndSkillInternships();
