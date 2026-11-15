-- ====================================================================
-- InternMatch AI — Complete Supabase PostgreSQL Database Schema
-- Paste this into the Supabase SQL Editor and click "RUN"
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    preferences JSONB DEFAULT '{"domain": "Artificial Intelligence", "preferredModes": ["remote", "hybrid", "onsite"]}',
    notification_settings JSONB DEFAULT '{"emailEnabled": true, "weeklyDigest": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT DEFAULT '',
    location TEXT DEFAULT 'Delhi NCR, India',
    preferred_mode TEXT DEFAULT 'remote' CHECK (preferred_mode IN ('remote', 'hybrid', 'onsite', 'any')),
    github TEXT DEFAULT '',
    linkedin TEXT DEFAULT '',
    skills TEXT[] DEFAULT ARRAY['React', 'Node.js', 'Python', 'Machine Learning', 'SQL'],
    interests TEXT[] DEFAULT ARRAY['Machine Learning', 'Full-Stack Development', 'Cloud Computing'],
    resume_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'remote' CHECK (mode IN ('remote', 'hybrid', 'onsite')),
    stipend TEXT DEFAULT 'Stipend provided',
    duration TEXT DEFAULT '3-6 Months',
    skills TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'Verified Partner',
    url TEXT DEFAULT '',
    deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '45 days'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPLICATIONS TRACKER TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected')),
    notes TEXT DEFAULT '',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, internship_id)
);

-- 5. RECOMMENDATIONS TABLE (AI Cosine Match Results)
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, internship_id)
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'match' CHECK (type IN ('match', 'weekly', 'application', 'skill', 'system')),
    internship_id UUID REFERENCES internships(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_internships_active ON internships(is_active);
CREATE INDEX IF NOT EXISTS idx_internships_mode ON internships(mode);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- ====================================================================
-- SEED DATA: Tech & AI Internships
-- ====================================================================
INSERT INTO internships (title, organization, description, location, mode, stipend, duration, skills, source)
VALUES
('Machine Learning Engineering Intern', 'Google', 'Join Google Bangalore as an ML engineering intern working on scalable foundation models, Python algorithms, and distributed model evaluation.', 'Bangalore', 'hybrid', '₹1,25,000 / month', '6 Months', ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Algorithms', 'Docker'], 'Google Careers API'),
('Frontend Developer Intern', 'Razorpay', 'Build responsive, ultra-clean web dashboards in React and TypeScript. Collaborate with product design and payment gateway infrastructure teams.', 'Bangalore', 'remote', '₹60,000 / month', '3 Months', ARRAY['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Next.js'], 'Razorpay Engineering'),
('High-Scale Backend Intern', 'CRED', 'Scale high-throughput microservices using Node.js, Redis caches, and distributed event streaming with Kafka.', 'Bangalore', 'onsite', '₹80,000 / month', '6 Months', ARRAY['Node.js', 'Redis', 'Docker', 'Microservices', 'SQL'], 'CRED Talent Network'),
('AI Research & NLP Intern', 'Microsoft', 'Conduct state-of-the-art NLP research on prompt evaluation, RAG pipelines, and conversational models at Microsoft IDC Hyderabad.', 'Hyderabad', 'hybrid', '₹1,10,000 / month', '6 Months', ARRAY['Python', 'PyTorch', 'NLP', 'Machine Learning', 'SQL'], 'Microsoft IDC Careers'),
('Data Science & Recommendation Intern', 'Flipkart', 'Work on recommendation engines, collaborative filtering, customer intent prediction, and large-scale data pipelines.', 'Bangalore', 'remote', '₹75,000 / month', '4 Months', ARRAY['Python', 'SQL', 'Scikit-Learn', 'Pandas', 'Machine Learning'], 'Flipkart Hiring'),
('Full-Stack Software Engineering Intern', 'Zomato', 'Develop customer-facing food delivery modules, delivery partner dashboards, and merchant tools using React and Node.js.', 'Gurgaon', 'hybrid', '₹65,000 / month', '3 Months', ARRAY['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'], 'Zomato Engineering'),
('Cloud Infrastructure & DevOps Intern', 'AWS', 'Automate continuous integration pipelines, manage Kubernetes clusters, and architect serverless cloud workloads.', 'Hyderabad', 'remote', '₹90,000 / month', '6 Months', ARRAY['AWS', 'Docker', 'Kubernetes', 'Python', 'Linux'], 'Amazon University Talent'),
('Generative AI Systems Intern', 'Adobe', 'Develop creative Generative AI tools, diffusion integrations, and visual assistant workflows within Adobe Creative Cloud.', 'Noida', 'hybrid', '₹85,000 / month', '6 Months', ARRAY['Python', 'PyTorch', 'Generative AI', 'Computer Vision', 'C++'], 'Adobe Research Lab')
ON CONFLICT DO NOTHING;


-- ====================================================================
-- PERMISSIONS: Allow anon and authenticated access
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
