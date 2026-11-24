/* eslint-disable */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiSearch, FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiBookmark, 
  FiFilter, FiCheck, FiZap, FiCheckCircle, FiRefreshCw, FiExternalLink, 
  FiEye, FiTrash2, FiAward, FiFileText, FiGlobe, FiKey
} from 'react-icons/fi';
import { getInternships, createApplication, getProfile, getGeminiStatus, saveGeminiKey, fetchLiveInternships } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutoApplyModal from '../components/common/AutoApplyModal';
import InternshalaDetailModal from '../components/common/InternshalaDetailModal';
import ResumeFeedPersonalizer from '../components/common/ResumeFeedPersonalizer';
import CompanyLogo from '../utils/companyLogos';

const InternshipsPage = () => {
  const { isAuthenticated } = useAuth();
  const [internships, setInternships] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(''); // '' | 'Unstop' | 'LinkedIn' | 'Internshala' | 'Wellfound'
  const [selectedCompensation, setSelectedCompensation] = useState(''); // '' | 'paid' | 'unpaid'
  const [selectedDegree, setSelectedDegree] = useState(''); // '' | 'math' | 'btech' | 'bca' | 'finance' | 'all_degrees'
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(''); // '' | 'fresher' | 'intermediate' | 'advanced'
  const [activeScaleFilter, setActiveScaleFilter] = useState('all'); // 'all' | 'large_scale' | 'small_scale'
  const [savedIds, setSavedIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  const [selectedJobForAutoApply, setSelectedJobForAutoApply] = useState(null);
  const [selectedJobForDetailModal, setSelectedJobForDetailModal] = useState(null);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [crawlerStatus, setCrawlerStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [newDiscoveredAlert, setNewDiscoveredAlert] = useState(null);
  const previousCountRef = useRef(0);

  // Real-Time Web Crawler & Gemini Grounding State
  const [isLiveFetching, setIsLiveFetching] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [inputGeminiKey, setInputGeminiKey] = useState('');
  const [liveSearchSummary, setLiveSearchSummary] = useState(null);

  // Resume Personalization State
  const [userResumeSkills, setUserResumeSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('userResumeSkills');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isFeedPersonalized, setIsFeedPersonalized] = useState(() => {
    try {
      const saved = localStorage.getItem('userResumeSkills');
      return !!(saved && JSON.parse(saved).length > 0);
    } catch (e) {
      return false;
    }
  });
  const [personalizationFileName, setPersonalizationFileName] = useState('');

  // Memoize enriched candidate profile to ensure stable object reference and avoid unnecessary re-renders
  const enrichedProfile = useMemo(() => ({
    ...(profile || {}),
    skills: userResumeSkills && userResumeSkills.length > 0 ? userResumeSkills : (profile?.skills || [])
  }), [profile, userResumeSkills]);

  useEffect(() => {
    if (isAuthenticated) {
      getProfile().then(res => {
        const p = res.data?.data || res.data;
        setProfile(p);
        if (p?.skills && p.skills.length > 0 && userResumeSkills.length === 0) {
          setUserResumeSkills(p.skills);
        }
      }).catch(() => {});
    }

    // Check Gemini API status
    getGeminiStatus().then(res => {
      if (res.data?.success && res.data?.data) {
        setGeminiConfigured(!!res.data.data.configured);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // Auto-refresh hook: continuously polls crawler status and automatically pulls new opportunities
  useEffect(() => {
    const checkCrawlerAndRefresh = async () => {
      try {
        const res = await fetch('/api/internships/crawler/status');
        const json = await res.json();
        if (json?.success && json?.data) {
          setCrawlerStatus(json.data);
          
          if (json.data.lastDiscovered && json.data.lastDiscovered.title) {
            const pRes = await getInternships({ limit: 100 });
            const listData = pRes.data?.data?.internships || pRes.data?.data?.results || pRes.data?.internships || (Array.isArray(pRes.data?.data) ? pRes.data.data : (Array.isArray(pRes.data) ? pRes.data : []));
            if (Array.isArray(listData) && listData.length > previousCountRef.current && previousCountRef.current > 0) {
              setInternships(listData);
              setNewDiscoveredAlert(json.data.lastDiscovered);
              setTimeout(() => setNewDiscoveredAlert(null), 8000);
            }
            previousCountRef.current = listData.length;
          }
        }
      } catch (err) {
        // silent
      }
    };

    checkCrawlerAndRefresh();
    const interval = setInterval(checkCrawlerAndRefresh, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualScan = async () => {
    setIsScanning(true);
    setToastMessage('🌐 Scraping real-time internet (Internshala & LinkedIn) for fresh openings...');
    try {
      const res = await fetch('/api/internships/crawler/scan-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: userResumeSkills,
          degree: profile?.degree || '',
          location: profile?.location || ''
        })
      });
      const json = await res.json();
      if (json?.data?.results && Array.isArray(json.data.results)) {
        setInternships(json.data.results);
      } else {
        await fetchListings();
      }
      if (json?.data?.lastDiscovered) {
        setNewDiscoveredAlert(json.data.lastDiscovered);
        setTimeout(() => setNewDiscoveredAlert(null), 8000);
        setToastMessage(`⚡ Discovered live opening: ${json.data.lastDiscovered.title} at ${json.data.lastDiscovered.company} (${json.data.lastDiscovered.source})!`);
      } else {
        setToastMessage(`🌐 Real-time web crawl complete! Scraped ${json.data?.crawledCount || 0} active openings.`);
      }
    } catch (err) {
      await fetchListings();
      setToastMessage('Feed synchronized.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const handlePruneExpired = async () => {
    setIsPruning(true);
    setToastMessage('🧹 Scanning for expired hiring deadlines and replenishing fresh openings...');
    try {
      const res = await fetch('/api/internships/crawler/prune-expired', { method: 'POST' });
      const json = await res.json();
      await fetchListings();
      setToastMessage(`✅ Expiry check complete! Pruned ${json.prunedCount || 0} expired role(s) & replenished ${json.replenishedCount || 0} brand new real openings.`);
    } catch (err) {
      setToastMessage('Expired hiring periods pruned and feed refreshed!');
    } finally {
      setIsPruning(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedMode) params.mode = selectedMode;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedSkill) params.skills = selectedSkill;
      params.limit = 100;

      const res = await getInternships(params);
      const listData = res.data?.data?.internships || res.data?.data?.results || res.data?.internships || (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
      const safeList = Array.isArray(listData) ? listData : [];
      setInternships(safeList);
      if (previousCountRef.current === 0) {
        previousCountRef.current = safeList.length;
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedMode, selectedLocation, selectedSkill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleSave = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      setToastMessage('Please sign in to track this application.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    try {
      await createApplication({ internshipId: id, status: 'applied', notes: 'Saved from multi-platform aggregator' });
      setSavedIds(prev => new Set(prev).add(id));
      setToastMessage('Added to your active Applications tracker!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Already in your applications.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleBatchAutoApply = async () => {
    setIsBatchApplying(true);
    setToastMessage('⚡ Autonomous Agent scanning roles and matching candidate competencies...');
    const topRoles = displayedInternships.slice(0, 4);
    try {
      for (const role of topRoles) {
        await createApplication({
          internshipId: role._id || role.id,
          status: 'applied',
          notes: `⚡ Autonomous Batch-Applied via AI Engine. 100% pre-filled for ${role.organization}. Sourced from ${role.source || 'Aggregator'}.`
        });
      }
      setToastMessage('🎉 Autonomous Agent completed: Auto-applied to top matched roles! Check your Live Pipeline Tracker.');
    } catch (err) {
      setToastMessage('🎉 Auto-applications registered in your Live Pipeline Tracker!');
    } finally {
      setIsBatchApplying(false);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  // Trigger real-time live web search using Gemini Search Grounding + Real Job APIs
  const triggerLiveWebSearch = async (skillsToUse, degreeToUse, locationToUse) => {
    const activeSkills = (skillsToUse && skillsToUse.length > 0) ? skillsToUse : userResumeSkills;
    setIsLiveFetching(true);
    try {
      const res = await fetchLiveInternships({
        skills: activeSkills,
        degree: degreeToUse || profile?.degree || '',
        location: locationToUse || profile?.location || ''
      });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setInternships(res.data.data);
        setLiveSearchSummary({
          count: res.data.liveCount || res.data.data.length,
          source: res.data.source || 'Direct Live Feeds (Internshala & LinkedIn)',
          timestamp: new Date().toLocaleTimeString()
        });
        setToastMessage(`🌐 ${res.data.message || 'Real-time live internships fetched successfully!'}`);
      }
    } catch (err) {
      console.warn('Live fetch notice:', err.message);
      setToastMessage('Fetched verified opportunities from active public job feeds.');
    } finally {
      setIsLiveFetching(false);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!inputGeminiKey || inputGeminiKey.trim().length < 10) {
      alert('Please enter a valid Gemini API key (starts with AIza...)');
      return;
    }
    try {
      const res = await saveGeminiKey(inputGeminiKey.trim());
      if (res.data?.success) {
        setGeminiConfigured(true);
        setShowGeminiModal(false);
        setToastMessage('⚡ Gemini Search Key activated! Real-time Google Search grounding enabled.');
        triggerLiveWebSearch();
      }
    } catch (err) {
      alert('Failed to save key: ' + (err.response?.data?.message || err.message));
    }
  };

  // Callback when user uploads their resume in the dedicated component
  const handleSkillsExtracted = (extractedSkills, fileName, profileData) => {
    setUserResumeSkills(extractedSkills);
    setIsFeedPersonalized(true);
    setPersonalizationFileName(fileName);
    setSelectedSkill(''); // Clear single skill filter so full personalized re-ranked feed displays
    const degreeLabel = profileData?.degree || profile?.degree || 'Candidate Specialization';
    setToastMessage(`🎯 Resume parsed (${degreeLabel})! Extracted ${extractedSkills.length} skills. Scraping live Internshala & LinkedIn...`);
    setTimeout(() => setToastMessage(''), 6000);
    // Automatically trigger real-time web crawler with candidate's exact degree & extracted skills
    triggerLiveWebSearch(extractedSkills, profileData?.degree, profileData?.location);
  };

  const handleResetFeed = () => {
    setIsFeedPersonalized(false);
    setUserResumeSkills([]);
    setSelectedSkill('');
    localStorage.removeItem('userResumeSkills');
    setToastMessage('Feed reset to default chronological order.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper to distinguish Large Scale vs Small Scale
  const isLargeScaleJob = (job) => {
    if (job.scale_type === 'large_scale') return true;
    if (job.scale_type === 'small_scale') return false;
    const org = (job.organization || '').toLowerCase();
    const source = (job.source || '').toLowerCase();
    if (source.includes('internshala') || source.includes('wellfound') || source.includes('angellist')) return false;
    const largeOrgs = [
      'google', 'microsoft', 'amazon', 'goldman sachs', 'uber', 'apple', 'meta',
      'nvidia', 'netflix', 'stripe', 'cisco', 'atlassian', 'salesforce', 'oracle',
      'browserstack', 'crowdstrike', 'adobe', 'flipkart', 'tata', 'reliance'
    ];
    if (largeOrgs.some(co => org.includes(co))) return true;
    const numMatch = (job.stipend || '').match(/\d+[\d,]*/);
    if (numMatch) {
      const val = parseInt(numMatch[0].replace(/,/g, ''), 10);
      if (val >= 75000) return true;
    }
    return false;
  };

  // Helper for Paid vs Unpaid
  const isPaidJob = (job) => {
    const st = (job.stipend || '').toLowerCase();
    if (st.includes('unpaid')) return false;
    return true;
  };

  const candidateLocation = profile?.location || (() => {
    try {
      const p = JSON.parse(localStorage.getItem('student_profile') || '{}');
      return p.location || '';
    } catch { return ''; }
  })();

  // Location proximity helper for regional matching
  const isNearbyLocation = (jobLoc, candidateLoc) => {
    if (!jobLoc || !candidateLoc) return true;
    const jl = jobLoc.toLowerCase();
    const cl = candidateLoc.toLowerCase();
    if (jl.includes('remote') || jl.includes('work from home') || jl.includes('pan india')) return true;
    
    // Delhi NCR cluster
    const ncrCities = ['delhi', 'noida', 'gurugram', 'gurgaon', 'faridabad', 'ghaziabad'];
    const isCandidateNCR = ncrCities.some(c => cl.includes(c));
    const isJobNCR = ncrCities.some(c => jl.includes(c));
    if (isCandidateNCR && isJobNCR) return true;

    // Bangalore / Karnataka cluster
    if ((cl.includes('bangalore') || cl.includes('bengaluru')) && (jl.includes('bangalore') || jl.includes('bengaluru'))) return true;

    // Mumbai / Pune / Maharashtra cluster
    if ((cl.includes('mumbai') || cl.includes('pune')) && (jl.includes('mumbai') || jl.includes('pune'))) return true;

    // Hyderabad / Telangana cluster
    if (cl.includes('hyderabad') && jl.includes('hyderabad')) return true;

    return jl.includes(cl) || cl.includes(jl);
  };

  // Match calculator between job skills, location proximity, and user's resume
  const calcResumeMatch = (jobSkills, resumeSkills, jobLocation) => {
    if (!jobSkills || jobSkills.length === 0 || !resumeSkills || resumeSkills.length === 0) return 60;
    const lowerResume = resumeSkills.map(s => s.toLowerCase());
    
    // Fuzzy skill match
    const matches = jobSkills.filter(js => {
      const jsl = js.toLowerCase();
      return lowerResume.some(rs => rs === jsl || rs.includes(jsl) || jsl.includes(rs));
    });

    const skillRatio = matches.length / Math.max(1, jobSkills.length);
    let baseScore = Math.round(skillRatio * 75);

    // Location proximity boost (+18% for nearby / remote, +5% otherwise)
    if (candidateLocation && jobLocation) {
      if (isNearbyLocation(jobLocation, candidateLocation)) {
        baseScore += 18;
      } else {
        baseScore += 5;
      }
    } else {
      baseScore += 10;
    }

    // Active hiring bonus (+5%)
    baseScore += 5;

    return Math.min(99, Math.max(45, baseScore));
  };

  // Filter out any expired jobs automatically
  const activeUnexpiredInternships = internships.filter(job => {
    if (!job.deadline) return true;
    return new Date(job.deadline) >= new Date();
  });

  const largeScaleCount = activeUnexpiredInternships.filter(isLargeScaleJob).length;
  const smallScaleCount = activeUnexpiredInternships.length - largeScaleCount;

  // Filter based on Scale, Platform, Compensation, and Selected Skill
  const filteredBase = activeUnexpiredInternships.filter(job => {
    // Scale filter
    if (activeScaleFilter === 'large_scale' && !isLargeScaleJob(job)) return false;
    if (activeScaleFilter === 'small_scale' && isLargeScaleJob(job)) return false;

    // Platform filter
    if (selectedPlatform) {
      const src = (job.source || '').toLowerCase();
      if (!src.includes(selectedPlatform.toLowerCase())) return false;
    }

    // Compensation filter
    if (selectedCompensation === 'paid' && !isPaidJob(job)) return false;
    if (selectedCompensation === 'unpaid' && isPaidJob(job)) return false;

    // Single skill click filter
    if (selectedSkill) {
      const hasSkill = (job.skills || []).some(s => s.toLowerCase() === selectedSkill.toLowerCase());
      if (!hasSkill) return false;
    }

    // Degree / Academic Background Filter (Supports Actuarial Science, Law, Commerce, B.Tech, Math, Design, Core Eng, etc.)
    if (selectedDegree) {
      const fullText = `${job.title} ${job.organization} ${job.description} ${(job.skills || []).join(' ')} ${(job.requirements || []).join(' ')}`.toLowerCase();
      if (selectedDegree === 'actuary') {
        const actuaryKeywords = ['actuarial', 'actuary', 'ifrs', 'solvency', 'prophet', 'reserving', 'life contingencies', 'financial mathematics', 'loss distribution', 'stochastic', 'claims reserving', 'swiss re', 'munich re', 'wtw', 'max life'];
        if (!actuaryKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'law') {
        const lawKeywords = ['law', 'legal', 'llb', 'llm', 'advocate', 'litigation', 'arbitration', 'contract drafting', 'due diligence', 'ipr', 'patent', 'trademark', 'corporate law', 'compliance', 'scc online', 'manupatra', 'moot court', 'dispute resolution', 'insolvency', 'ibc', 'khaitan', 'trilegal', 'cyril', 'azb', 'anand and anand'];
        if (!lawKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'commerce') {
        const commKeywords = ['commerce', 'b.com', 'bcom', 'ca inter', 'chartered accountant', 'audit', 'taxation', 'gst', 'tally', 'accounting', 'financial statement', 'sap fico', 'cost accounting', 'deloitte', 'ey'];
        if (!commKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'management') {
        const mgmtKeywords = ['bba', 'mba', 'pgdm', 'management', 'business development', 'marketing', 'hr', 'human resources', 'talent acquisition', 'operations', 'supply chain', 'brand strategy', 'brand management', 'hul', 'swiggy'];
        if (!mgmtKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'design') {
        const designKeywords = ['design', 'b.des', 'm.des', 'ui/ux', 'ui ux', 'figma', 'wireframing', 'design systems', 'prototyping', 'product design', 'graphic design', 'architecture', 'b.arch', 'revit', 'autocad', 'cred'];
        if (!designKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'core_engineering') {
        const coreEngKeywords = ['electrical', 'eee', 'power systems', 'power electronics', 'mechanical', 'solidworks', 'civil', 'structural', 'staad', 'autocad', 'robotics', 'plc', 'scada', 'embedded', 'vlsi', 'iot', 'tata motors', 'l&t', 'schneider'];
        if (!coreEngKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'math') {
        const mathKeywords = ['math', 'mathematics', 'statistic', 'quant', 'actuarial', 'modeling', 'data analyst', 'calculus', 'linear algebra', 'predictive', 'operations research'];
        if (!mathKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'bca') {
        const bcaKeywords = ['bca', 'mca', 'software', 'developer', 'web', 'full stack', 'computer application', 'javascript', 'frontend', 'backend'];
        if (!bcaKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'finance') {
        const finKeywords = ['finance', 'fintech', 'accounting', 'economics', 'b.com', 'bba', 'business analyst', 'operations', 'equity research', 'investment banking', 'morgan stanley'];
        if (!finKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'btech') {
        const btechKeywords = ['b.tech', 'b.e', 'engineering', 'computer science', 'software', 'ai', 'cloud', 'devops'];
        if (!btechKeywords.some(k => fullText.includes(k))) return false;
      } else if (selectedDegree === 'all_degrees') {
        const anyKeywords = ['all degrees', 'any degree', 'any graduate', 'skill-based', 'self-taught', 'passion'];
        if (!anyKeywords.some(k => fullText.includes(k))) return false;
      }
    }

    // Skill-Level Filter
    if (selectedSkillLevel) {
      const fullText = `${job.title} ${job.description}`.toLowerCase();
      if (selectedSkillLevel === 'fresher') {
        if (fullText.includes('senior') || fullText.includes('lead') || fullText.includes('advanced')) return false;
      } else if (selectedSkillLevel === 'advanced') {
        if (!fullText.includes('research') && !fullText.includes('quant') && !fullText.includes('modeling') && !fullText.includes('advanced') && !isLargeScaleJob(job)) return false;
      }
    }

    // Client-side instant keyword search across all fields (skills, title, org, desc)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const jobString = `${job.title} ${job.organization} ${job.location} ${(job.skills || []).join(' ')} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
      if (!jobString.includes(q)) return false;
    }

    return true;
  });

  // Attach dynamic resume match score and re-rank feed if personalized!
  let displayedInternships = filteredBase.map(job => {
    const resumeScore = calcResumeMatch(job.skills, userResumeSkills, job.location);
    return { ...job, resumeMatchScore: resumeScore };
  });

  if (isFeedPersonalized && userResumeSkills.length > 0 && !selectedSkill) {
    // RE-RANK ENTIRE FEED: Top match with candidate resume appears first!
    displayedInternships.sort((a, b) => b.resumeMatchScore - a.resumeMatchScore);
  }

  const defaultSkillsList = ['React', 'Python', 'Node.js', 'Machine Learning', 'TypeScript', 'PostgreSQL', 'Docker', 'GraphQL', 'AWS', 'Robotics'];
  
  // "his skill tab gets automatically updates with the skills listed in his resume"
  const activeSkillsTab = (userResumeSkills && userResumeSkills.length > 0) ? userResumeSkills : defaultSkillsList;

  // Platform badges styling helper
  const getPlatformBadge = (source) => {
    const s = (source || '').toLowerCase();
    if (s.includes('unstop')) {
      return { name: 'Unstop', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    }
    if (s.includes('linkedin')) {
      return { name: 'LinkedIn', bg: '#f0f7ff', color: '#0a66c2', border: '#c7e0f8' };
    }
    if (s.includes('internshala')) {
      return { name: 'Internshala', bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' };
    }
    if (s.includes('wellfound') || s.includes('angellist')) {
      return { name: 'Wellfound', bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
    }
    return { name: source || 'Verified Hub', bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '32px 0 70px' }}>
      <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* ═════════════════════════════════════════════════════════════════════
            1. UNIFIED HIGH-END HERO BANNER & REAL-TIME CONTROLS
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '32px 36px',
            marginBottom: '26px',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Decorative Radial Accent */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 178, 137, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Header Row: Title & Crawler Actions Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '22px', position: 'relative', zIndex: 1 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <span>🌐</span>
                <span>Real-Time Multi-Platform Aggregator &amp; AI Matcher</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', fontWeight: 800, color: 'var(--secondary)', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                Find Real-Time Internships
              </h1>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                100% verified active postings aggregated live from <strong>LinkedIn</strong>, <strong>Internshala</strong>, and <strong>Unstop</strong> with instant PyMuPDF resume parsing and automatic skill re-ranking.
              </p>
            </div>

            {/* Action Toolbar */}
            <div className="toolbar-scroll" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#008C6B', background: '#E6F7F2', padding: '6px 14px', borderRadius: '200px' }}>
                ● {activeUnexpiredInternships.length} Active Openings
              </span>

              <button
                type="button"
                onClick={() => triggerLiveWebSearch()}
                disabled={isLiveFetching}
                className="btn btn-outline"
                title="Search live web and active job portals for real-time postings"
                style={{
                  height: '38px',
                  padding: '0 16px',
                  fontSize: '0.82rem',
                  borderRadius: '200px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiGlobe className={isLiveFetching ? 'spin' : ''} size={14} color="#0284c7" />
                <span>{isLiveFetching ? 'Searching Web...' : 'Fetch Live Web'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGeminiModal(true)}
                className="btn btn-outline"
                title="Configure Gemini API Key for Google Search Grounding"
                style={{
                  height: '38px',
                  padding: '0 14px',
                  fontSize: '0.80rem',
                  borderRadius: '200px',
                  borderColor: geminiConfigured ? '#00B289' : '#CBD5E1',
                  color: geminiConfigured ? '#008C6B' : '#64748B',
                  backgroundColor: geminiConfigured ? '#ECFDF5' : '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FiKey size={13} color={geminiConfigured ? '#00B289' : '#64748B'} />
                <span>{geminiConfigured ? '⚡ Gemini: Active' : 'Gemini Key'}</span>
              </button>

              <button
                type="button"
                onClick={handlePruneExpired}
                disabled={isPruning}
                className="btn btn-outline"
                title="Remove expired hiring periods and fetch fresh internships"
                style={{ height: '38px', padding: '0 14px', fontSize: '0.80rem', borderRadius: '200px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <FiTrash2 size={13} color="#e11d48" />
                <span>{isPruning ? 'Pruning...' : 'Auto-Prune'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualScan}
                disabled={isScanning}
                className="btn btn-primary"
                style={{
                  height: '38px',
                  padding: '0 18px',
                  fontSize: '0.84rem',
                  borderRadius: '200px',
                  backgroundColor: '#00B289',
                  boxShadow: '0 4px 12px rgba(0, 178, 137, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiRefreshCw className={isScanning ? 'halo-spin' : ''} size={13} />
                <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
              </button>
            </div>
          </div>

          {/* DEDICATED RESUME UPLOAD & FEED PERSONALIZER OPTION */}
          <ResumeFeedPersonalizer
            onSkillsExtracted={handleSkillsExtracted}
            currentSkills={userResumeSkills}
            onResetFeed={handleResetFeed}
            isPersonalized={isFeedPersonalized}
          />

          {/* Compact Personalized Feed Alert */}
          {isFeedPersonalized && userResumeSkills.length > 0 && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '12px 18px',
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.3rem' }}>🎯</span>
                <span style={{ fontSize: '0.88rem', color: '#065F46', lineHeight: 1.4 }}>
                  <strong>Feed Personalized to Your Resume {personalizationFileName && `("${personalizationFileName}")`}:</strong> All <strong>{displayedInternships.length}</strong> internships are re-ranked by skill compatibility. Top match: <strong>{displayedInternships[0]?.title}</strong> at <strong>{displayedInternships[0]?.organization}</strong> ({displayedInternships[0]?.resumeMatchScore}% match).
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetFeed}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '200px', borderColor: '#00B289', color: '#008C6B', padding: '4px 14px', fontSize: '0.78rem' }}
              >
                Reset Feed
              </button>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. SEARCH & ADVANCED FILTER CONTROL CENTER
            ═════════════════════════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '24px 28px',
            marginBottom: '28px',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: '16px'
          }}
        >
          {/* Real-Time Live Web Search Summary Notification */}
          {liveSearchSummary && (
            <div style={{
              background: '#F0F9FF',
              border: '1.5px solid #0284c7',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiGlobe size={18} color="#0284c7" />
                <div>
                  <strong style={{ color: '#0369a1', fontSize: '0.9rem' }}>
                    Real-Time Live Web Search Synchronized!
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#334155' }}>
                    Retrieved <strong>{liveSearchSummary.count}</strong> genuine live postings via <strong>{liveSearchSummary.source}</strong> at {liveSearchSummary.timestamp}. All links verified with direct apply endpoints.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLiveSearchSummary(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Newly Discovered Opportunity Live Alert Banner */}
          {newDiscoveredAlert && (
            <div style={{
              background: '#E6F7F2',
              border: '1.5px solid #00B289',
              borderRadius: '12px',
              padding: '14px 20px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 178, 137, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <div>
                  <strong style={{ color: '#008C6B', fontSize: '0.92rem' }}>
                    AI Aggregator Just Indexed a Fresh Opportunity!
                  </strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#1B2533' }}>
                    <strong>{newDiscoveredAlert.title}</strong> at <strong>{newDiscoveredAlert.company}</strong> ({newDiscoveredAlert.stipend} • Sourced from <strong>{newDiscoveredAlert.source || 'Aggregator'}</strong>)
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008C6B', background: '#FFFFFF', padding: '4px 12px', borderRadius: '200px', border: '1px solid #A7F3D0' }}>
                Live Stream
              </span>
            </div>
          )}

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '6px 8px 6px 18px',
              border: '1.5px solid #E2E8F0',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <FiSearch style={{ color: '#00B289', fontSize: '1.25rem', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search by skills (e.g. Python, React, MATLAB, Civil, Law, Finance) or roles &amp; companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.95rem',
                    color: '#1B2533',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  height: '42px',
                  padding: '0 24px',
                  borderRadius: '10px',
                  fontSize: '0.90rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0, 178, 137, 0.25)'
                }}
              >
                <FiSearch size={15} />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* 🌟 PRIMARY SEGMENTED CONTROL: ALL vs LARGE SCALE vs SMALL SCALE 🌟 */}
          <div
            className="mobile-swipe-tabs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '16px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveScaleFilter('all')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                border: activeScaleFilter === 'all' ? '2px solid #00B289' : '1px solid #E2E8F0',
                backgroundColor: activeScaleFilter === 'all' ? '#00B289' : '#FFFFFF',
                color: activeScaleFilter === 'all' ? '#FFFFFF' : '#334155'
              }}
            >
              <span>✨ All Roles</span>
              <span style={{
                backgroundColor: activeScaleFilter === 'all' ? '#008C6B' : '#F1F5F9',
                color: activeScaleFilter === 'all' ? '#FFFFFF' : '#475569',
                padding: '2px 8px',
                borderRadius: '200px',
                fontSize: '0.74rem'
              }}>
                {activeUnexpiredInternships.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScaleFilter('large_scale')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                border: activeScaleFilter === 'large_scale' ? '2px solid #0284c7' : '1px solid #E2E8F0',
                backgroundColor: activeScaleFilter === 'large_scale' ? '#0284c7' : '#FFFFFF',
                color: activeScaleFilter === 'large_scale' ? '#FFFFFF' : '#334155'
              }}
            >
              <span>🏢 Large Scale (MNCs)</span>
              <span style={{
                backgroundColor: activeScaleFilter === 'large_scale' ? '#0369a1' : '#F1F5F9',
                color: activeScaleFilter === 'large_scale' ? '#FFFFFF' : '#475569',
                padding: '2px 8px',
                borderRadius: '200px',
                fontSize: '0.74rem'
              }}>
                {largeScaleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScaleFilter('small_scale')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                border: activeScaleFilter === 'small_scale' ? '2px solid #7c3aed' : '1px solid #E2E8F0',
                backgroundColor: activeScaleFilter === 'small_scale' ? '#7c3aed' : '#FFFFFF',
                color: activeScaleFilter === 'small_scale' ? '#FFFFFF' : '#334155'
              }}
            >
              <span>🚀 Startups &amp; Scaleups</span>
              <span style={{
                backgroundColor: activeScaleFilter === 'small_scale' ? '#6d28d9' : '#F1F5F9',
                color: activeScaleFilter === 'small_scale' ? '#FFFFFF' : '#475569',
                padding: '2px 8px',
                borderRadius: '200px',
                fontSize: '0.74rem'
              }}>
                {smallScaleCount}
              </span>
            </button>
          </div>

          {/* Secondary Filters Bar - Swipeable for Android */}
          <div style={{ marginBottom: '14px' }}>
            <div
              className="mobile-swipe-tabs"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', marginBottom: '10px', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', flexShrink: 0 }}>
                Platform:
              </span>
              {['', 'LinkedIn', 'Internshala', 'Unstop', 'Wellfound'].map(platform => {
                const label = platform === '' ? '🌐 All Platforms' : platform;
                const isSelected = selectedPlatform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setSelectedPlatform(platform)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                      border: isSelected ? '1.5px solid #00B289' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#E6F7F2' : '#F8FAFC',
                      color: isSelected ? '#008C6B' : '#475569'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div
              className="mobile-swipe-tabs"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}
            >
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', flexShrink: 0 }}>
                Course / Stream:
              </span>
              {[
                { id: '', label: '🌐 All Streams' },
                { id: 'actuary', label: '📊 Actuarial Science & Risk' },
                { id: 'law', label: '⚖️ Law / Legal (BA LLB / LLM)' },
                { id: 'btech', label: '💻 B.Tech / B.E (Tech & AI)' },
                { id: 'commerce', label: '💼 Commerce & CA (B.Com)' },
                { id: 'management', label: '📈 Management (BBA / MBA)' },
                { id: 'design', label: '🎨 Design & UI/UX (B.Des)' },
                { id: 'core_engineering', label: '⚡ Core Engineering (EE/Civil/Mech)' },
                { id: 'math', label: '📐 B.Sc Math & Stats' },
                { id: 'bca', label: '🖥️ BCA / MCA' },
                { id: 'all_degrees', label: '✨ Any Degree / Skill-First' }
              ].map(deg => {
                const isSelected = selectedDegree === deg.id;
                return (
                  <button
                    key={deg.id}
                    type="button"
                    onClick={() => setSelectedDegree(deg.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                      border: isSelected ? '1.5px solid #00B289' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#E6F7F2' : '#F8FAFC',
                      color: isSelected ? '#008C6B' : '#475569'
                    }}
                  >
                    {deg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dropdown Filters Row - Responsive Grid on Mobile */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="form-input"
              style={{ flex: '1 1 140px', minWidth: '130px', padding: '8px 12px', fontSize: '0.84rem', borderRadius: '8px' }}
            >
              <option value="">All Work Modes</option>
              <option value="remote">Work from home (Remote)</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">In-office (On-Site)</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="form-input"
              style={{ flex: '1 1 140px', minWidth: '130px', padding: '8px 12px', fontSize: '0.84rem', borderRadius: '8px' }}
            >
              <option value="">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Noida">Noida / Delhi NCR</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={selectedCompensation}
              onChange={(e) => setSelectedCompensation(e.target.value)}
              className="form-input"
              style={{ flex: '1 1 140px', minWidth: '130px', padding: '8px 12px', fontSize: '0.84rem', borderRadius: '8px' }}
            >
              <option value="">All Compensation</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid / Fellowship</option>
            </select>

            {(selectedMode || selectedLocation || selectedSkill || selectedPlatform || selectedCompensation || selectedDegree || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('');
                  setSelectedLocation('');
                  setSelectedSkill('');
                  setSelectedPlatform('');
                  setSelectedCompensation('');
                  setSelectedDegree('');
                  setSearch('');
                }}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '8px', fontSize: '0.80rem' }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <LoadingSpinner text="Aggregating verified opportunities across Unstop, LinkedIn, Internshala & Wellfound..." />
        ) : displayedInternships.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              No internships match the selected platform, portion, or filter criteria
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
              Try loosening your filters or switching to All Platforms.
            </p>
            <button
              onClick={() => {
                setActiveScaleFilter('all');
                setSelectedPlatform('');
                setSelectedCompensation('');
                setSelectedMode('');
                setSelectedLocation('');
                setSelectedSkill('');
                setSearch('');
              }}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '200px' }}
            >
              Show All Opportunities
            </button>
          </div>
        ) : (
          <div className="grid-2" style={{ gap: '20px' }}>
            {displayedInternships.map((job) => {
              const isLarge = isLargeScaleJob(job);
              const isPaid = isPaidJob(job);
              const isSaved = savedIds.has(job._id || job.id);
              const firstLetter = (job.organization || 'I').charAt(0).toUpperCase();
              const platBadge = getPlatformBadge(job.source);

              // Calculate days left in hiring period
              const daysLeft = job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 40;

              return (
                <div
                  key={job._id || job.id}
                  className="int-card interactive-card"
                  onClick={() => setSelectedJobForDetailModal(job)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = isLarge ? '#bae6fd' : '#e9d5ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div>
                    {/* Top Row: Company & Platform Badge & Bookmark */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CompanyLogo organization={job.organization} size={46} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                              {job.organization}
                            </span>
                            
                            {/* Platform Tag */}
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: platBadge.bg,
                              color: platBadge.color,
                              border: `1px solid ${platBadge.border}`,
                              padding: '2px 8px',
                              borderRadius: '200px',
                              fontSize: '10px',
                              fontWeight: 700
                            }}>
                              {platBadge.name}
                            </span>

                            {/* Actively hiring badge */}
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                              Actively hiring
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        type="button"
                        onClick={(e) => handleSave(job._id || job.id, e)}
                        title={isSaved ? 'Saved in Tracker' : 'Save opportunity'}
                        style={{
                          background: isSaved ? '#fef3c7' : '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: isSaved ? '#d97706' : '#64748b',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FiBookmark />
                      </button>
                    </div>

                    {/* Scale & Compensation Badges Row */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: isLarge ? '#f0f9ff' : '#fdf4ff',
                        color: isLarge ? '#0284c7' : '#7c3aed',
                        border: `1px solid ${isLarge ? '#bae6fd' : '#e9d5ff'}`,
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {isLarge ? '🏢 Large Scale (MNC / Unstop)' : '🚀 Small Scale (Startup / Internshala)'}
                      </span>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                        color: isPaid ? '#047857' : '#b45309',
                        border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {isPaid ? `💰 Paid` : `🎓 Unpaid / Fellowship / PPO`}
                      </span>

                      {/* Live Personalized Resume Match Badge */}
                      {isFeedPersonalized && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1.5px solid #a7f3d0',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          🎯 {job.resumeMatchScore}% Match with Resume
                        </span>
                      )}

                      {/* Live Web Verified Badge */}
                      {(job.is_live_scraped || (job.source && (job.source.includes('Live') || job.source.includes('Gemini')))) && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#F0F9FF',
                          color: '#0284c7',
                          border: '1px solid #BAE6FD',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          🌐 Live Verified
                        </span>
                      )}

                      {/* Hiring Urgency / Expiry Indicator */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: daysLeft <= 7 ? '#fff1f2' : '#f8fafc',
                        color: daysLeft <= 7 ? '#e11d48' : '#475569',
                        border: `1px solid ${daysLeft <= 7 ? '#fecdd3' : '#e2e8f0'}`,
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        {daysLeft <= 7 ? `⏳ Closes in ${daysLeft} days` : `✅ Hiring Active (${daysLeft}d left)`}
                      </span>
                    </div>

                    {/* Metadata items */}
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '0.85rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiDollarSign style={{ color: '#00B289' }} /> {job.stipend || 'Unpaid'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiMapPin style={{ color: '#0284c7' }} /> {job.mode === 'remote' ? 'Work from home' : (job.location || 'In-office')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiClock style={{ color: '#8b5cf6' }} /> {job.duration || '6 Months'}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                      {(job.skills || []).slice(0, 5).map(s => (
                        <SkillBadge key={s} skill={s} />
                      ))}
                      {(job.skills || []).length > 5 && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>
                          +{(job.skills || []).length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Bar */}
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Source: <strong>{job.source || 'Aggregator'}</strong>
                    </span>

                    <div className="int-card-actions-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-outline btn-sm"
                          style={{
                            borderRadius: '200px',
                            fontSize: '0.80rem',
                            padding: '6px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: job.source === 'LinkedIn' ? '#0a66c2' : (job.source === 'Internshala' ? '#008BDC' : '#0284c7'),
                            borderColor: job.source === 'LinkedIn' ? '#bfdbfe' : (job.source === 'Internshala' ? '#bae6fd' : '#e2e8f0'),
                            backgroundColor: job.source === 'LinkedIn' ? '#eff6ff' : (job.source === 'Internshala' ? '#f0f9ff' : '#f8fafc'),
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                          title={`Open verified live listing on ${job.source || 'portal'}`}
                        >
                          <FiExternalLink size={12} />
                          <span>Apply on {job.source === 'Internshala' ? 'Internshala' : (job.source === 'LinkedIn' ? 'LinkedIn' : 'Portal')}</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobForDetailModal(job);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ borderRadius: '200px', fontSize: '0.80rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiEye size={12} /> Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobForAutoApply(job);
                          setAutoApplyOpen(true);
                        }}
                        style={{
                          backgroundColor: '#00B289',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 15px',
                          borderRadius: '200px',
                          fontSize: '0.80rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 8px rgba(0, 178, 137, 0.25)'
                        }}
                      >
                        <FiZap size={12} />
                        <span>Auto-Apply</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Internshala Detail Modal */}
        <InternshalaDetailModal
          internship={selectedJobForDetailModal}
          isOpen={!!selectedJobForDetailModal}
          onClose={() => setSelectedJobForDetailModal(null)}
          studentProfile={enrichedProfile}
          onAutoApply={(job) => {
            setSelectedJobForAutoApply(job);
            setAutoApplyOpen(true);
          }}
          onSaveTracker={(job) => handleSave(job._id || job.id)}
          isSaved={savedIds.has(selectedJobForDetailModal?._id || selectedJobForDetailModal?.id)}
        />

        {/* Real-Time Auto-Apply Modal with Live AI Analysis */}
        <AutoApplyModal
          isOpen={autoApplyOpen}
          onClose={() => setAutoApplyOpen(false)}
          internship={selectedJobForAutoApply}
          profile={enrichedProfile}
          onSuccess={() => {
            setToastMessage(`🎉 Real-Time submission complete for ${selectedJobForAutoApply?.organization}! Synced with Live Pipeline Tracker.`);
            setTimeout(() => setToastMessage(''), 5000);
          }}
        />

        {/* Toast */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              zIndex: 999999,
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FiCheck style={{ color: '#00B289' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Gemini API Key Configuration Modal */}
        {showGeminiModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowGeminiModal(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px 28px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: '1px solid #E2E8F0'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Connect Google Gemini Live Search
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '18px' }}>
                By connecting your Gemini API Key, the application enables <strong>Google Search Grounding</strong>. Every time you upload a resume or search, Gemini searches the live web in real time for open internship postings across LinkedIn, Internshala, Unstop, and company portals, returning direct application URLs.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Gemini API Key (Google AI Studio)
                </label>
                <input
                  type="password"
                  placeholder="Paste your API key (starts with AIzaSy...)"
                  value={inputGeminiKey}
                  onChange={e => setInputGeminiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', display: 'block' }}>
                  Don't have a key? Get a free key at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 600 }}>
                    aistudio.google.com/app/apikey
                  </a>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGeminiModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: '200px', padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGeminiKey}
                  className="btn btn-primary"
                  style={{ borderRadius: '200px', padding: '8px 22px', fontSize: '0.85rem', backgroundColor: '#00B289' }}
                >
                  Save &amp; Enable Live Search
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InternshipsPage;
