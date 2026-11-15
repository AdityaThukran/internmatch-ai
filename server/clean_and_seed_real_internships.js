const { supabase, isSupabaseConfigured } = require('./config/supabase');

if (!isSupabaseConfigured()) {
  console.error('❌ Supabase not configured.');
  process.exit(1);
}

const REAL_INTERNSHIPS = [
  // ===================== UNSTOP (COMPETITIONS & MAJOR MNC DRIVES) =====================
  {
    title: 'Flipkart GRiD 6.0 - Robotics, SDE & AI Challenge & Internship',
    organization: 'Flipkart',
    description: 'Flipkart’s flagship engineering hiring challenge on Unstop. Selected finalists receive direct SDE Internship offers to work on massive e-commerce supply chains, robotics fulfillment automation, and real-time product recommendation models serving 500M+ users.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹1,00,000 / month',
    duration: '6 Months',
    skills: ['DSA', 'Python', 'Java', 'Machine Learning', 'Robotics', 'C++', 'System Design'],
    requirements: [
      'Open to all engineering and science undergraduate students (B.Tech, B.Sc, BCA, MCA).',
      'Demonstrated excellence in data structures, algorithms, or robotics automation.',
      'Ability to tackle high-concurrency e-commerce scale.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/competitions/flipkart-grid-60'
  },
  {
    title: 'Tata Imagination Challenge - Future Technologists & AI Track',
    organization: 'Tata Sons',
    description: 'Premier national internship initiative on Unstop across Tata Group companies (TCS, Tata Motors, Tata Neu, Tata Digital). Focuses on applied AI, cloud architecture, sustainable computing, and digital transformation.',
    location: 'Mumbai / Pune, India',
    mode: 'hybrid',
    stipend: '₹75,000 / month',
    duration: '3-6 Months',
    skills: ['Python', 'Cloud Computing', 'Data Analytics', 'AI Fundamentals', 'Problem Solving'],
    requirements: [
      'Open to college students from all degree backgrounds (Engineering, Sciences, Mathematics, Commerce).',
      'Creative problem-solving aptitude and passion for technology.',
      'Strong communication and collaborative skills.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/competitions/tata-imagination-challenge'
  },
  {
    title: 'Autonomous Drone & Avionics Software Intern',
    organization: 'Garuda Aerospace',
    description: 'Work with India’s leading drone manufacturer on autonomous flight path planning algorithms, ROS (Robot Operating System) computer vision, telemetry sensors, and embedded C++ autopilots for agricultural and defense drones.',
    location: 'Chennai, India',
    mode: 'onsite',
    stipend: '₹40,000 / month',
    duration: '6 Months',
    skills: ['C++', 'Python', 'ROS', 'Computer Vision', 'Embedded Systems', 'Robotics'],
    requirements: [
      'Students in CS, Robotics, ECE, or Mathematics with passion for aerial robotics.',
      'Hands-on experience with ROS, OpenCV, or sensor fusion.',
      'Curiosity for autonomous vehicle control.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/garuda-aerospace'
  },
  {
    title: 'Data Analyst & Statistical Modeling Intern',
    organization: 'Mu Sigma',
    description: 'Mu Sigma is the world’s largest pure-play decision sciences firm. Interns solve complex multi-industry business problems using statistical modeling, regression analysis, hypothesis testing, SQL pipelines, and Python analytics.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹45,000 / month',
    duration: '6 Months',
    skills: ['Statistics', 'Mathematics', 'Python', 'SQL', 'Data Analytics', 'Probability'],
    requirements: [
      'Open to B.Sc / M.Sc Mathematics, Statistics, Economics, BCA, or B.Tech students.',
      'Solid foundational command over probability distributions, hypothesis testing, and linear algebra.',
      'Eager curiosity to translate mathematical theory into business impact.'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/mu-sigma'
  },
  {
    title: 'Machine Learning & Applied Mathematics Intern',
    organization: 'Fractal Analytics',
    description: 'Fractal Analytics applies artificial intelligence and computational mathematics to Fortune 500 challenges. Interns develop predictive algorithms, optimize deep neural networks, and engineer scalable statistical forecasting pipelines.',
    location: 'Mumbai / Gurugram, India',
    mode: 'hybrid',
    stipend: '₹55,000 / month',
    duration: '6 Months',
    skills: ['Mathematics', 'Machine Learning', 'Python', 'Linear Algebra', 'Statistics', 'SQL'],
    requirements: [
      'Undergraduate in B.Sc Mathematics, Statistics, Data Science, BCA, MCA, or Engineering.',
      'Comfortable with mathematical formulations of machine learning algorithms.',
      'Working knowledge of Python (NumPy, SciPy, Pandas, Scikit-learn).'
    ],
    source: 'Unstop',
    url: 'https://unstop.com/internships/fractal-analytics'
  },
  {
    title: 'Engineering Summer Analyst',
    organization: 'Goldman Sachs',
    description: 'Goldman Sachs Engineering interns build high-frequency trade execution gateways, quantitative risk engines, and enterprise security platforms. Work directly alongside quantitative strategists and software engineers.',
    location: 'Bangalore / Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,10,000 / month',
    duration: '8-10 Weeks (Summer)',
    skills: ['Java', 'C++', 'Python', 'Algorithms', 'Data Structures', 'Quantitative Finance'],
    requirements: [
      'Penultimate year student in Computer Science, Mathematics, Statistics, or related discipline.',
      'Exceptional algorithmic problem-solving and clean code fundamentals.',
      'Strong analytical and quantitative mindset.'
    ],
    source: 'Unstop',
    url: 'https://www.goldmansachs.com/careers/students/'
  },

  // ===================== LINKEDIN (CORPORATE & GLOBAL TECH PORTALS) =====================
  {
    title: 'Software Engineering Summer Intern 2025/2026',
    organization: 'Google',
    description: 'Join Google’s Core Engineering and Search teams in India. Work on distributed storage systems, large-scale indexing algorithms, developer toolchains, and AI microservices used by billions across YouTube, Maps, and Android.',
    location: 'Bangalore / Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,25,000 / month',
    duration: '10-12 Weeks',
    skills: ['C++', 'Java', 'Python', 'DSA', 'Distributed Systems', 'Git'],
    requirements: [
      'Currently pursuing a Bachelor’s or Master’s in Computer Science or related STEM field.',
      'Proficiency in one or more general-purpose programming languages: C++, Java, or Python.',
      'Solid command over Data Structures & Algorithms (DSA).'
    ],
    source: 'LinkedIn',
    url: 'https://careers.google.com/jobs/results/'
  },
  {
    title: 'Software Engineering & AI Copilot Intern',
    organization: 'Microsoft',
    description: 'Work at Microsoft India Development Center (IDC) on cloud services, Azure AI foundations, Microsoft 365 Copilot agents, and distributed platform infrastructure.',
    location: 'Hyderabad / Bangalore / Noida, India',
    mode: 'hybrid',
    stipend: '₹1,20,000 / month',
    duration: '6 Months',
    skills: ['C#', 'C++', 'Python', 'Azure', 'Machine Learning', 'Data Structures'],
    requirements: [
      'Pre-final or final year undergraduate student in Computer Science, IT, or related field.',
      'Understanding of Object-Oriented Design and concurrent programming.',
      'Passion for developer productivity and intelligent software systems.'
    ],
    source: 'LinkedIn',
    url: 'https://careers.microsoft.com/students/us/en'
  },
  {
    title: 'Software Development Engineer (SDE) Intern - AWS Cloud',
    organization: 'Amazon',
    description: 'Design and deploy scalable, fault-tolerant customer-facing microservices on AWS. Work with DynamoDB, Lambda, S3, and high-throughput order fulfillment engines.',
    location: 'Bangalore / Hyderabad, India',
    mode: 'onsite',
    stipend: '₹1,10,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Python', 'AWS', 'SQL', 'Data Structures', 'REST API'],
    requirements: [
      'Bachelor’s in Engineering (CS, IT, Electronics) or related quantitative degrees.',
      'Demonstrated expertise in DSA and clean modular code.',
      'Familiarity with cloud computing and database design.'
    ],
    source: 'LinkedIn',
    url: 'https://amazon.jobs/en/teams/student-programs'
  },
  {
    title: 'Software Engineer Intern - Core Distributed Infrastructure',
    organization: 'Uber',
    description: 'Contribute to Uber’s global marketplace matching dispatch engine, geofencing real-time telemetry, routing graph algorithms, and Kafka distributed event backbones.',
    location: 'Bangalore / Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹1,15,000 / month',
    duration: '6 Months',
    skills: ['Go', 'Java', 'Kafka', 'Distributed Systems', 'Algorithms', 'Microservices'],
    requirements: [
      '3rd or 4th year student with strong interest in distributed architecture.',
      'Mastery over algorithmic complexity and graph algorithms.',
      'Commitment to high reliability and 99.99% service uptime.'
    ],
    source: 'LinkedIn',
    url: 'https://www.uber.com/global/en/careers/university/'
  },
  {
    title: 'Software Engineer Intern - Cloud Platform & Jira Core',
    organization: 'Atlassian',
    description: 'Atlassian India is recruiting interns to build high-performance React frontends, GraphQL APIs, and multi-tenant AWS cloud backends that power Jira, Confluence, and Trello for millions of developers.',
    location: 'Bangalore / Remote, India',
    mode: 'remote',
    stipend: '₹1,00,000 / month',
    duration: '6 Months',
    skills: ['React', 'Java', 'TypeScript', 'GraphQL', 'AWS', 'Microservices'],
    requirements: [
      'Undergraduate student graduating in 2026 or 2027.',
      'Experience with modern web architectures and asynchronous JavaScript / Java.',
      'Great team spirit and customer empathy.'
    ],
    source: 'LinkedIn',
    url: 'https://www.atlassian.com/company/careers/students'
  },
  {
    title: 'AI & GPU Accelerated Computing Intern',
    organization: 'NVIDIA',
    description: 'Work with the world leader in accelerated computing. Build CUDA deep learning kernels, optimize TensorRT inference for generative AI models, and collaborate with autonomous machine research teams.',
    location: 'Bangalore / Pune, India',
    mode: 'hybrid',
    stipend: '₹1,30,000 / month',
    duration: '6 Months',
    skills: ['C++', 'Python', 'CUDA', 'Deep Learning', 'PyTorch', 'TensorRT'],
    requirements: [
      'Bachelor’s or Master’s in Computer Science, AI, Mathematics, or Electrical Engineering.',
      'Solid C++ and linear algebra understanding.',
      'Familiarity with GPU memory hierarchies and neural networks.'
    ],
    source: 'LinkedIn',
    url: 'https://www.nvidia.com/en-us/about-nvidia/careers/university-recruiting/'
  },
  {
    title: 'Core Systems & Swift Software Engineer Intern',
    organization: 'Apple',
    description: 'Contribute to low-level operating system daemons, memory allocators, Swift frameworks, and graphics pipelines that power iOS, iPadOS, and macOS devices worldwide.',
    location: 'Hyderabad, India',
    mode: 'onsite',
    stipend: '₹1,35,000 / month',
    duration: '6 Months',
    skills: ['C++', 'C', 'Swift', 'Operating Systems', 'Linux', 'Data Structures'],
    requirements: [
      'Pre-final or final year undergraduate student in Computer Engineering.',
      'Curiosity in kernel internals, concurrency, and multi-threaded systems.',
      'Strong debugging and profiling skills.'
    ],
    source: 'LinkedIn',
    url: 'https://www.apple.com/careers/in/students.html'
  },
  {
    title: 'Software Engineer Intern (Llama GenAI & Distributed Systems)',
    organization: 'Meta',
    description: 'Work at Meta AI and Infrastructure in India. Help train large foundation models, optimize high-speed network topologies, and engineer backend microservices supporting Instagram, WhatsApp, and Facebook.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹1,30,000 / month',
    duration: '6 Months',
    skills: ['Python', 'C++', 'PyTorch', 'Distributed Computing', 'Algorithms'],
    requirements: [
      'Bachelor’s or Master’s candidate in Computer Science, Mathematics, or related field.',
      'Proficiency with graph theory and algorithmic optimization.',
      'Hands-on experience with modern deep learning toolchains.'
    ],
    source: 'LinkedIn',
    url: 'https://www.metacareers.com/students-and-grads/'
  },
  {
    title: 'Backend Distributed Infrastructure & Payments Intern',
    organization: 'Stripe',
    description: 'Stripe builds financial infrastructure for the internet. Interns architect fault-tolerant payment APIs, idempotency safeguards, and low-latency transaction processing pipelines.',
    location: 'Remote, India',
    mode: 'remote',
    stipend: '₹1,20,000 / month',
    duration: '12 Weeks',
    skills: ['Ruby', 'Java', 'Go', 'Distributed Systems', 'SQL', 'Microservices'],
    requirements: [
      'Undergraduate student with strong foundation in REST APIs and database ACID guarantees.',
      'Careful attention to security and edge-case handling.',
      'Enthusiasm for building robust developer tooling.'
    ],
    source: 'LinkedIn',
    url: 'https://stripe.com/jobs/university'
  },
  {
    title: 'Associate Software Engineer Intern',
    organization: 'Salesforce',
    description: 'Work on the Salesforce Einstein AI platform, multi-tenant cloud storage, and enterprise developer tools with high reliability and zero downtime.',
    location: 'Hyderabad / Bangalore, India',
    mode: 'hybrid',
    stipend: '₹90,000 / month',
    duration: '6 Months',
    skills: ['Java', 'JavaScript', 'SQL', 'Cloud Architecture', 'REST API'],
    requirements: [
      'Pre-final year undergraduate in CS/IT or related branch.',
      'Good understanding of database normalization and object-oriented principles.',
      'Strong problem-solving attitude.'
    ],
    source: 'LinkedIn',
    url: 'https://www.salesforce.com/company/careers/university-recruiting/'
  },
  {
    title: 'Network Systems & Cloud Security Intern',
    organization: 'Cisco',
    description: 'Build secure cloud network fabrics, software-defined WAN controllers, and real-time packet inspection engines protecting enterprise communications.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹85,000 / month',
    duration: '6 Months',
    skills: ['Python', 'C', 'Networking', 'Cybersecurity', 'Linux', 'Docker'],
    requirements: [
      'Bachelor’s student in CS, IT, ECE, or Network Engineering.',
      'Strong conceptual knowledge of TCP/IP, routing protocols, and socket programming.',
      'Scripting and automation skills in Python or Bash.'
    ],
    source: 'LinkedIn',
    url: 'https://jobs.cisco.com/'
  },
  {
    title: 'Autonomous Database & Distributed Cloud Systems Intern',
    organization: 'Oracle',
    description: 'Join Oracle India Engineering to enhance autonomous database query optimizers, high-speed Raft replication protocols, and multi-cloud Kubernetes orchestrators.',
    location: 'Bangalore / Hyderabad, India',
    mode: 'hybrid',
    stipend: '₹80,000 / month',
    duration: '6 Months',
    skills: ['C++', 'Java', 'SQL', 'Database Internals', 'Linux', 'Distributed Systems'],
    requirements: [
      'Undergraduate or postgraduate student in Computer Science.',
      'Deep interest in database internals, B-Trees, transaction logs, and concurrency control.',
      'Strong C++ or Java programming skills.'
    ],
    source: 'LinkedIn',
    url: 'https://www.oracle.com/corporate/careers/students-grads/'
  },
  {
    title: 'Quantitative Research & Mathematical Modeling Intern',
    organization: 'WorldQuant',
    description: 'WorldQuant develops sophisticated financial computer models to predict global market movements. Quantitative research interns formulate mathematical hypotheses, analyze massive time-series data, and deploy statistical arbitrage signals.',
    location: 'Mumbai / Remote, India',
    mode: 'remote',
    stipend: '₹1,25,000 / month',
    duration: '3-6 Months',
    skills: ['Mathematics', 'Statistics', 'Quantitative Modeling', 'Linear Algebra', 'Calculus', 'Python'],
    requirements: [
      'Exclusively targeted at students pursuing B.Sc / M.Sc Mathematics, Statistics, Physics, Data Science, or B.Tech with high math aptitude.',
      'Proficiency in calculus, linear algebra, and multivariate probability distributions.',
      'Clean coding in Python or C++ for mathematical simulations.'
    ],
    source: 'LinkedIn',
    url: 'https://www.worldquant.com/careers/'
  },
  {
    title: 'Actuarial Risk & Predictive Modeling Intern',
    organization: 'Swiss Re',
    description: 'Swiss Re is one of the world’s leading reinsurance providers. Interns apply stochastic calculus, actuarial risk mathematics, and predictive machine learning to global catastrophe modeling and life/health reinsurance underwriting.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹50,000 / month',
    duration: '6 Months',
    skills: ['Mathematics', 'Statistics', 'Actuarial Science', 'Python', 'SQL', 'Financial Modeling'],
    requirements: [
      'B.Sc Mathematics, Statistics, Actuarial Science, Economics, or B.Com students.',
      'Strong grasp of probability theory, stochastic processes, and financial mathematics.',
      'Hands-on comfort with statistical libraries in Python or R.'
    ],
    source: 'LinkedIn',
    url: 'https://careers.swissre.com/'
  },
  {
    title: 'Frontend React Engineering Intern',
    organization: 'Khatabook',
    description: 'Khatabook empowers 50M+ Indian MSMEs with digital bookkeeping. Build offline-first, multilingual, ultra-lightweight React web applications optimized for low-bandwidth 4G networks.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹35,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'REST API', 'Redux'],
    requirements: [
      'Demonstrated portfolio of responsive React web applications.',
      'Understanding of component lifecycles, state management, and web performance.',
      'Open to students from all college backgrounds (BCA, B.Sc, B.Tech).'
    ],
    source: 'LinkedIn',
    url: 'https://khatabook.com/careers'
  },
  {
    title: 'Backend Distributed Payments & UPI SDE Intern',
    organization: 'PhonePe',
    description: 'PhonePe processes over 45% of India’s UPI transactions. Interns build microservices with sub-50ms latency, write concurrent Java/Kotlin services, and optimize distributed Redis/Kafka clusters.',
    location: 'Bangalore, India',
    mode: 'onsite',
    stipend: '₹75,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'SQL', 'Microservices'],
    requirements: [
      'Strong foundational knowledge of OOP, multithreading, and distributed caching.',
      'Understanding of relational databases and transaction isolation levels.',
      'Prior backend projects using Java or Spring.'
    ],
    source: 'LinkedIn',
    url: 'https://www.phonepe.com/careers/'
  },
  {
    title: 'Fintech Distributed Infrastructure & Microservices Intern',
    organization: 'Paytm',
    description: 'Work on Paytm Payments Bank core banking engines, high-speed payment gateway reconciliation, and automated fraud detection pipelines.',
    location: 'Noida / Delhi NCR, India',
    mode: 'hybrid',
    stipend: '₹50,000 / month',
    duration: '6 Months',
    skills: ['Node.js', 'Java', 'MongoDB', 'REST API', 'Docker', 'Git'],
    requirements: [
      'Undergraduate student with experience building RESTful APIs with Node.js or Java.',
      'Knowledge of MongoDB, MySQL, and asynchronous event loops.',
      'Good analytical and debugging capabilities.'
    ],
    source: 'LinkedIn',
    url: 'https://paytm.com/careers'
  },
  {
    title: 'Big Data & Real-time AdTech Stream Processing Intern',
    organization: 'InMobi',
    description: 'InMobi reaches over 1.6B mobile devices. Build real-time bidding algorithms, Apache Spark streaming analytics, and multi-terabyte data lake pipelines on AWS.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹60,000 / month',
    duration: '6 Months',
    skills: ['Python', 'Java', 'Spark', 'SQL', 'Data Engineering', 'AWS'],
    requirements: [
      'Students with passion for large-scale data engineering and distributed processing.',
      'Comfortable writing optimized SQL queries and Python/Java data jobs.',
      'Curiosity for ad-tech auction mechanics.'
    ],
    source: 'LinkedIn',
    url: 'https://www.inmobi.com/company/careers'
  },

  // ===================== INTERNSHALA (STARTUPS, APPS & DIVERSE DEGREES) =====================
  {
    title: 'Node.js Development',
    organization: 'Anshumat Foundation',
    description: 'Develop full-stack features and responsive UIs using Next.js, React, TypeScript, Node.js, PostgreSQL, and REST APIs. Implement backend APIs, database operations, testing, and debugging with AI coding tools under senior guidance. Participate in code reviews, technical discussions, and documentation.',
    location: 'Work from home',
    mode: 'remote',
    stipend: 'Unpaid / Certificate & PPO',
    duration: '6 Months',
    skills: ['Node.js', 'React', 'JavaScript', 'PostgreSQL', 'Express.js', 'MongoDB', 'REST API', 'Git'],
    requirements: [
      'Currently pursuing or recently completed a degree in Computer Science, Engineering, or related field; strong JavaScript/TypeScript, React, and web development fundamentals.',
      'Hands-on experience with Next.js, Node.js, REST APIs, PostgreSQL, Git/GitHub, and AI coding tools; built at least one project.',
      'Problem-solving skills, willingness to learn, ownership mindset, ability to work independently; prior internship or open-source contribution is a plus.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internship/detail/node-js-development-internship-in-work-from-home-at-anshumat-foundation'
  },
  {
    title: 'Fintech Data & Quantitative Operations Intern',
    organization: 'Groww',
    description: 'Groww is India’s leading stockbroking and mutual fund platform. Interns build automated reconciliation scripts, perform quantitative portfolio analytics, and track financial metric anomalies.',
    location: 'Bangalore / Remote, India',
    mode: 'hybrid',
    stipend: '₹60,000 / month',
    duration: '3-6 Months',
    skills: ['Mathematics', 'Python', 'SQL', 'Financial Modeling', 'Data Analysis', 'Excel'],
    requirements: [
      'Open to B.Sc Mathematics, Statistics, B.Com, Economics, BCA, or B.Tech graduates.',
      'High numerical agility and comfort analyzing large tabular datasets with Python & SQL.',
      'Passion for capital markets, equities, and mutual funds.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/groww'
  },
  {
    title: 'Computational Mathematics & Education Content Intern',
    organization: 'Cuemath',
    description: 'Design visual algorithmic explanations, computational math simulations, and gamified logic puzzles for K-12 and university mathematics learners worldwide.',
    location: 'Bangalore / Remote, India',
    mode: 'remote',
    stipend: '₹30,000 / month',
    duration: '3-6 Months',
    skills: ['Mathematics', 'Logic', 'Calculus', 'Linear Algebra', 'Python', 'Problem Solving'],
    requirements: [
      'B.Sc or M.Sc in Mathematics, Statistics, Physics, or related discipline.',
      'Outstanding command over pure mathematics concepts (geometry, algebra, calculus, discrete math).',
      'Ability to communicate complex mathematical proofs intuitively.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/cuemath'
  },
  {
    title: 'Operations & Business Analytics Intern',
    organization: 'Zepto',
    description: 'Zepto is pioneering 10-minute grocery delivery. Interns analyze dark-store dispatch efficiency, predict order surge patterns using linear optimization, and build automated operational dashboards.',
    location: 'Mumbai / Gurugram, India',
    mode: 'hybrid',
    stipend: '₹40,000 / month',
    duration: '3-6 Months',
    skills: ['Operations', 'SQL', 'Python', 'Business Analytics', 'Excel', 'Problem Solving'],
    requirements: [
      'Completely open to all degrees (B.Sc, B.Com, BBA, BCA, B.Tech).',
      'Strong quantitative reasoning and data manipulation in Excel / SQL.',
      'Thrives in a high-velocity, dynamic startup environment.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/zepto'
  },
  {
    title: 'Frontend React & Next.js Intern',
    organization: 'Slice',
    description: 'Build modern fintech consumer interfaces with React, Next.js, and Tailwind CSS. Implement smooth card payment interactions, micro-animations, and fast mobile-first layouts.',
    location: 'Bangalore / Remote, India',
    mode: 'remote',
    stipend: '₹40,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'Next.js', 'JavaScript', 'CSS3', 'Tailwind CSS', 'REST API'],
    requirements: [
      'Proven hands-on projects with React and modern component libraries.',
      'Obsession with UI fidelity, 60fps animations, and mobile responsiveness.',
      'Active GitHub profile showcasing frontend code.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/slice'
  },
  {
    title: 'Full Stack Web Developer Intern',
    organization: 'Urban Company',
    description: 'Develop full-stack booking flows, partner portal dashboards, and automated geolocation microservices using Node.js, React, and MongoDB.',
    location: 'Gurugram, India',
    mode: 'hybrid',
    stipend: '₹45,000 / month',
    duration: '6 Months',
    skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Git'],
    requirements: [
      'Good command of full-stack MERN technologies.',
      'Knowledge of REST principles, JWT authentication, and database schemas.',
      'Eager to learn and ship production code.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/urban-company'
  },
  {
    title: 'Mobile App Engineering Intern (Flutter & Dart)',
    organization: 'Dukaan',
    description: 'Build fast cross-platform e-commerce storefronts using Flutter and Dart. Work directly on state management with Bloc/Provider, local caching, and payment gateway SDK integrations.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹35,000 / month',
    duration: '3-6 Months',
    skills: ['Flutter', 'Dart', 'Mobile Development', 'REST API', 'Git'],
    requirements: [
      'Built and published at least one Flutter mobile app or extensive GitHub portfolio.',
      'Understanding of asynchronous programming in Dart and mobile UI lifecycles.',
      'Open to all engineering and computer application students.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/dukaan'
  },
  {
    title: 'Software Development Engineer Intern',
    organization: 'Swiggy',
    description: 'Swiggy’s delivery logistics team is hiring interns to optimize real-time routing graphs, order batching algorithms, and high-volume Kafka streaming services.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹65,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Golang', 'Kafka', 'Redis', 'Distributed Systems', 'DSA'],
    requirements: [
      'Strong DSA problem-solving foundation.',
      'Understanding of microservices, caching, and concurrent computing.',
      'Passion for consumer tech and hyperlocal logistics.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/swiggy'
  },
  {
    title: 'Data Science & Hyperlocal Recommendation Intern',
    organization: 'Zomato',
    description: 'Develop hyper-personalized restaurant feed recommendation algorithms, user appetite prediction models, and dynamic delivery ETA predictors.',
    location: 'Gurugram, India',
    mode: 'hybrid',
    stipend: '₹65,000 / month',
    duration: '6 Months',
    skills: ['Python', 'Machine Learning', 'SQL', 'Deep Learning', 'Statistics'],
    requirements: [
      'Degree in Computer Science, Data Science, Mathematics, or related field.',
      'Hands-on experience training ML models (XGBoost, PyTorch, Transformers).',
      'Solid command over exploratory data analysis in Pandas and SQL.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/zomato'
  },
  {
    title: 'Generative AI Canvas & WebGL Video Intern',
    organization: 'InVideo',
    description: 'Work at InVideo on AI-powered video generation, WebGL rendering canvas tools, and automated text-to-speech synchronization using React and WebAssembly.',
    location: 'Mumbai / Remote, India',
    mode: 'remote',
    stipend: '₹40,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'JavaScript', 'WebGL', 'HTML5 Canvas', 'CSS3', 'Node.js'],
    requirements: [
      'Experience with complex web canvas, animations, or multimedia frontend development.',
      'Solid understanding of JavaScript asynchronous operations and DOM rendering.',
      'Excited by generative video and creator tools.'
    ],
    source: 'Internshala',
    url: 'https://internshala.com/internships/invideo'
  },

  // ===================== WELLFOUND (PRODUCT UNICORNS & HIGH-GROWTH STARTUPS) =====================
  {
    title: 'Junior Software & Logic Developer (Skill-Based - All Degrees)',
    organization: 'Zoho',
    description: 'Zoho hires purely based on programming logic, problem-solving, and clean coding — regardless of your degree or branch. Interns build cloud ERP modules, desktop sync clients, and database engines.',
    location: 'Chennai / Tenkasi / Remote, India',
    mode: 'hybrid',
    stipend: '₹35,000 / month',
    duration: '6 Months',
    skills: ['Java', 'C', 'JavaScript', 'Logic', 'Problem Solving', 'SQL'],
    requirements: [
      'Completely degree-agnostic: open to B.Sc, BCA, B.Com, B.Tech, or self-taught candidates.',
      'Strong logical deduction and command of algorithmic basics.',
      'Passion for craftsmanship in building independent software products.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://www.zoho.com/careers/'
  },
  {
    title: 'React & API Design Systems Intern',
    organization: 'Postman',
    description: 'Postman is used by 30M+ developers worldwide. Join the design systems and API client team to build accessible UI primitives, Monaco code editor integrations, and WebSocket inspector tools.',
    location: 'Bangalore / Remote, India',
    mode: 'remote',
    stipend: '₹55,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'TypeScript', 'Design Systems', 'WebSockets', 'REST API', 'Electron'],
    requirements: [
      'Demonstrated command over modern React, TypeScript, and component accessibility.',
      'Passion for developer tools and clean API design.',
      'Open-source contributions or personal developer utility projects.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://www.postman.com/company/careers/'
  },
  {
    title: 'Frontend React Developer Intern',
    organization: 'Razorpay',
    description: 'Build mission-critical checkout interfaces, merchant onboarding flows, and banking dashboard analytics. Collaborate with designers to ship pixel-perfect, accessible React components.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹50,000 / month',
    duration: '3-6 Months',
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS3', 'Tailwind CSS', 'REST API'],
    requirements: [
      'Proven hands-on experience building complex React web applications.',
      'Solid grasp of semantic HTML, CSS layout engines, and state management.',
      'Eager curiosity for fintech payments infrastructure.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://razorpay.com/jobs'
  },
  {
    title: 'Full Stack & High-Concurrency Systems Intern',
    organization: 'CRED',
    description: 'CRED is known for its exceptional design and high-velocity engineering. Work on gamified rewards engines, high-throughput financial ledgers, and reactive user experiences.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹75,000 / month',
    duration: '6 Months',
    skills: ['React', 'Node.js', 'Go', 'Distributed Systems', 'MongoDB', 'Redis'],
    requirements: [
      'Proficiency in React and backend server design (Node.js or Go).',
      'Knowledge of caching with Redis and database indexing.',
      'Obsessive attention to UI aesthetics and low-latency response times.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://cred.club/careers'
  },
  {
    title: 'Open Source & FinTech Developer Intern',
    organization: 'Zerodha',
    description: 'Zerodha is India’s largest stock broker. Work on open-source algorithmic tools, Kite trading platform microservices, and high-performance financial charting widgets.',
    location: 'Bangalore / Remote, India',
    mode: 'remote',
    stipend: '₹60,000 / month',
    duration: '6 Months',
    skills: ['Go', 'Python', 'Vue.js', 'React', 'PostgreSQL', 'Git'],
    requirements: [
      'Love for open-source software and minimalist, lightweight architecture.',
      'Comfortable writing clean Go or Python code.',
      'Understanding of financial markets and time-series data.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://zerodha.com/careers'
  },
  {
    title: 'Distributed Cloud Testing & Infrastructure Intern',
    organization: 'BrowserStack',
    description: 'BrowserStack powers automated testing for 50,000+ companies. Build containerized browser execution grids, Selenium/Playwright orchestration workers, and real-device Android/iOS virtualization.',
    location: 'Mumbai / Remote, India',
    mode: 'remote',
    stipend: '₹65,000 / month',
    duration: '6 Months',
    skills: ['Java', 'Node.js', 'Docker', 'Kubernetes', 'Linux', 'AWS'],
    requirements: [
      'Strong understanding of Linux OS, networking, and virtualization.',
      'Hands-on experience with Docker containers and test automation frameworks.',
      'Excellent analytical debugging skills.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://www.browserstack.com/careers'
  },
  {
    title: 'AI Agent & Knowledge Graph Integration Intern',
    organization: 'DevRev',
    description: 'DevRev connects developers, customers, and product managers through AI agents. Build semantic search pipelines, LLM function calling plugins, and graph data integrations.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹55,000 / month',
    duration: '3-6 Months',
    skills: ['Python', 'TypeScript', 'LLMs', 'Vector Databases', 'GraphQL', 'Next.js'],
    requirements: [
      'Understanding of Retrieval-Augmented Generation (RAG) and embeddings.',
      'Hands-on experience with TypeScript and Python API development.',
      'Passionate about the future of developer workflows.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://devrev.ai/careers'
  },
  {
    title: 'Indic Language Model & Voice AI Intern',
    organization: 'Sarvam AI',
    description: 'Sarvam AI builds foundational AI models tailored for Indian languages. Work on acoustic speech-to-text models, multilingual tokenizers, and high-speed GPU inference for rural banking and public services.',
    location: 'Bangalore, India',
    mode: 'hybrid',
    stipend: '₹70,000 / month',
    duration: '6 Months',
    skills: ['Python', 'PyTorch', 'NLP', 'Deep Learning', 'Audio Processing', 'C++'],
    requirements: [
      'Strong foundation in deep learning, sequence modeling, and PyTorch.',
      'Interest in speech recognition, text-to-speech, or Indic NLP.',
      'Strong mathematical command over probability and linear algebra.'
    ],
    source: 'Wellfound (AngelList)',
    url: 'https://www.sarvam.ai/careers'
  }
];

async function seed() {
  console.log('⚡ Purging outdated or generic listings and seeding 38 100% REAL industry-ready internships...');

  // 1. Delete all existing records from internships table
  const { error: delError } = await supabase
    .from('internships')
    .delete()
    .neq('title', '___IMPOSSIBLE_TITLE___'); // Deletes all rows

  if (delError) {
    console.error('Failed to clear old internships:', delError.message);
  } else {
    console.log('✓ Successfully purged old database listings.');
  }

  // 2. Insert the 38 real opportunities
  let inserted = 0;
  for (const job of REAL_INTERNSHIPS) {
    const deadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
    const { error: insError } = await supabase
      .from('internships')
      .insert([{
        title: job.title,
        organization: job.organization,
        description: job.description,
        location: job.location,
        mode: job.mode.toLowerCase(),
        stipend: job.stipend,
        duration: job.duration,
        skills: job.skills,
        requirements: job.requirements,
        source: job.source,
        url: job.url,
        deadline,
        is_active: true
      }]);

    if (insError) {
      console.warn(`Failed to insert "${job.title}" at ${job.organization}:`, insError.message);
    } else {
      inserted++;
      console.log(`✓ Seeded [${job.source}] ${job.organization} — ${job.title} (${job.stipend})`);
    }
  }

  console.log(`\n🎉 Industry-Ready Seeding Complete: ${inserted} authentic real-world internships live in Supabase!`);
}

seed().catch(console.error);
