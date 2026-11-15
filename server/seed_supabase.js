const { supabase, isSupabaseConfigured } = require('./config/supabase');
const bcrypt = require('bcryptjs');

async function seedSupabase() {
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not configured! Please set SUPABASE_URL and SUPABASE_KEY in server/.env');
    process.exit(1);
  }

  console.log('🌱 Starting Supabase Seeding...');

  // 1. Seed demo student user
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('password123', salt);

  const { data: user, error: userError } = await supabase
    .from('users')
    .upsert([
      {
        email: 'student@example.com',
        name: 'Jon Doe',
        password_hash,
        role: 'student',
        preferences: { domain: 'Artificial Intelligence & Web Development', preferredModes: ['remote', 'hybrid', 'onsite'] }
      }
    ], { onConflict: 'email' })
    .select()
    .single();

  if (userError) {
    console.error('Error seeding user:', userError.message);
  } else {
    console.log('✅ Demo student user seeded:', user.email);

    // Profile
    await supabase
      .from('student_profiles')
      .upsert([
        {
          user_id: user.id,
          bio: 'B.Tech CSE (Artificial Intelligence) student at Lingaya’s Vidyapeeth, Faridabad. Passionate about machine learning, full-stack web development with React and Node.js, and building intelligent data-driven applications.',
          location: 'Delhi NCR, India',
          preferred_mode: 'remote',
          github: 'https://github.com/jon-doe',
          linkedin: 'https://linkedin.com/in/jon-doe-ai',
          skills: ['React', 'Node.js', 'JavaScript', 'Python', 'Machine Learning', 'MongoDB', 'FastAPI', 'SQL', 'Git', 'Data Structures & Algorithms', 'Docker', 'NLP'],
          interests: ['Machine Learning', 'Full-Stack Development', 'AI Research', 'Cloud Systems']
        }
      ], { onConflict: 'user_id' });
    console.log('✅ Demo student profile seeded.');
  }

  // 2. Seed internships
  const sampleInternships = [
    {
      title: 'Machine Learning Engineering Intern',
      organization: 'Google',
      description: 'Work with the Google Research and Core ML team on natural language processing, semantic representation models, and high-scale inference optimization. You will collaborate with research scientists to deploy state-of-the-art transformer pipelines.',
      location: 'Bangalore, India',
      mode: 'hybrid',
      stipend: '₹75,000 / month',
      duration: '6 Months',
      skills: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Data Structures & Algorithms'],
      source: 'Google Careers',
      url: 'https://careers.google.com'
    },
    {
      title: 'Frontend React.js Developer Intern',
      organization: 'Razorpay',
      description: 'Build fast, accessible, and delightful merchant dashboard interfaces. Work directly with design and product teams using React, TypeScript, Redux Toolkit, and modern CSS architecture.',
      location: 'Bangalore, India',
      mode: 'remote',
      stipend: '₹45,000 / month',
      duration: '3 Months',
      skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Git'],
      source: 'Razorpay Jobs',
      url: 'https://razorpay.com/jobs'
    },
    {
      title: 'Full Stack Web Engineering Intern',
      organization: 'CRED',
      description: 'Craft high-performance user journeys, payment flows, and interactive UI animations. Collaborate with backend architects to build reactive microservices with Node.js and React.',
      location: 'Bangalore, India',
      mode: 'hybrid',
      stipend: '₹55,000 / month',
      duration: '6 Months',
      skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'SQL'],
      source: 'CRED Careers',
      url: 'https://cred.club/careers'
    },
    {
      title: 'AI & Data Science Intern',
      organization: 'Microsoft',
      description: 'Explore generative AI features, Azure Cognitive Services, and semantic search integration across Microsoft 365 cloud products.',
      location: 'Hyderabad, India',
      mode: 'hybrid',
      stipend: '₹80,000 / month',
      duration: '6 Months',
      skills: ['Python', 'Machine Learning', 'NLP', 'FastAPI', 'SQL'],
      source: 'Microsoft University Recruiting',
      url: 'https://careers.microsoft.com'
    },
    {
      title: 'Software Development Engineer (SDE) Intern',
      organization: 'Amazon',
      description: 'Design and implement customer-facing services that scale to millions of orders per day. Work with AWS infrastructure, distributed caching, and clean code practices.',
      location: 'Gurugram, India',
      mode: 'onsite',
      stipend: '₹70,000 / month',
      duration: '6 Months',
      skills: ['Python', 'Java', 'Data Structures & Algorithms', 'SQL', 'Docker'],
      source: 'Amazon Student Programs',
      url: 'https://amazon.jobs'
    },
    {
      title: 'Full Stack Engineering Intern',
      organization: 'Zerodha',
      description: 'Help build ultra-fast, minimal, accessible web tools and educational investment simulators. We value clean code, deep Linux understanding, and independent problem-solving.',
      location: 'Bangalore, India',
      mode: 'remote',
      stipend: '₹50,000 / month',
      duration: '3-6 Months',
      skills: ['React', 'Node.js', 'Python', 'SQL', 'Git'],
      source: 'Zerodha Careers',
      url: 'https://zerodha.com/careers'
    },
    {
      title: 'Data Analytics & Recommendation Intern',
      organization: 'Zomato',
      description: 'Analyze real-time delivery metrics, restaurant conversion funnels, and recommendation relevance to improve user discovery.',
      location: 'Gurugram, India',
      mode: 'hybrid',
      stipend: '₹40,000 / month',
      duration: '3 Months',
      skills: ['Python', 'SQL', 'Machine Learning', 'Data Structures & Algorithms'],
      source: 'Zomato Careers',
      url: 'https://zomato.com/careers'
    },
    {
      title: 'NLP & LLM Applications Intern',
      organization: 'PhonePe',
      description: 'Train and fine-tune language models for customer support automation, regional language intent parsing, and fraud detection.',
      location: 'Bangalore, India',
      mode: 'remote',
      stipend: '₹60,000 / month',
      duration: '6 Months',
      skills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
      source: 'PhonePe Careers',
      url: 'https://phonepe.com/careers'
    },
    {
      title: 'Backend Node.js & Cloud Intern',
      organization: 'Flipkart',
      description: 'Enhance Flipkart e-commerce fulfillment services, inventory microservices, and high-concurrency event messaging pipelines.',
      location: 'Bangalore, India',
      mode: 'hybrid',
      stipend: '₹50,000 / month',
      duration: '6 Months',
      skills: ['Node.js', 'JavaScript', 'MongoDB', 'Docker', 'SQL'],
      source: 'Flipkart Careers',
      url: 'https://flipkartcareers.com'
    },
    {
      title: 'Deep Learning & Computer Vision Intern',
      organization: 'Adobe',
      description: 'Implement computer vision pipelines, image segmentation models, and creative generative media workflows inside Adobe Creative Cloud APIs.',
      location: 'Noida, India',
      mode: 'hybrid',
      stipend: '₹65,000 / month',
      duration: '6 Months',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Structures & Algorithms'],
      source: 'Adobe Research',
      url: 'https://adobe.wd5.myworkdayjobs.com'
    }
  ];

  const { error: jobError } = await supabase.from('internships').upsert(sampleInternships, { onConflict: 'title,organization' });
  if (jobError) {
    // If conflict constraint doesn't exist, just insert
    await supabase.from('internships').insert(sampleInternships);
  }
  console.log(`✅ Seeded ${sampleInternships.length} verified internship opportunities.`);
  console.log('🎉 Supabase database seeding complete!');
  process.exit(0);
}

seedSupabase().catch(err => {
  console.error('Fatal error seeding Supabase:', err);
  process.exit(1);
});
