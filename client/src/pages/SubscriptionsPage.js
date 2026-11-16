/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheck,
  FiZap,
  FiShield,
  FiStar,
  FiArrowRight,
  FiLock,
  FiCreditCard,
  FiGift,
  FiClock,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiCpu,
  FiLayers,
  FiAward
} from 'react-icons/fi';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  claimFreeTrial,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const SubscriptionsPage = () => {
  const { user, isAuthenticated } = useAuth();

  const [billingCycle, setBillingCycle] = useState('yearly');
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  // Load plans and current subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, subRes] = await Promise.allSettled([
          getSubscriptionPlans(),
          getCurrentSubscription()
        ]);

        if (plansRes.status === 'fulfilled' && plansRes.value.data?.data) {
          setPlans(plansRes.value.data.data);
        }

        if (subRes.status === 'fulfilled' && subRes.value.data?.data) {
          setCurrentSub(subRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 6000);
  };

  // Claim 1-Year Free Campus Trial
  const handleClaimTrial = async () => {
    setActionLoading(true);
    try {
      const studentName = user?.name || 'Scholar';
      const studentEmail = user?.email || '';
      const res = await claimFreeTrial({
        name: studentName,
        email: studentEmail,
        college: "Lingaya's Vidyapeeth"
      });

      if (res.data?.success) {
        setCurrentSub(res.data.subscription);
        localStorage.setItem('internmatch_trial_claimed', 'true');
        showToast('🎉 1-Year Free Career Pro Campus Trial Activated! (365 Days Access)');
        window.dispatchEvent(new Event('subscriptionUpdated'));
      }
    } catch (err) {
      showToast('⚠️ Could not activate trial: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Razorpay Checkout Handler
  const handleRazorpayCheckout = async (planId, amount) => {
    if (planId === 'career-pro') {
      // Direct 1-Year free trial claim!
      return handleClaimTrial();
    }

    setActionLoading(true);
    try {
      const orderRes = await createRazorpayOrder({
        planId,
        amount,
        notes: {
          userName: user?.name || 'Recruiter Partner',
          userEmail: user?.email || 'recruiter@company.com'
        }
      });

      const orderData = orderRes.data;

      // Check if Razorpay script is loaded in window
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      // Configure Razorpay standard modal
      const options = {
        key: orderData.keyId || 'rzp_test_internmatch2026',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'InternMatch AI',
        description: `Subscription Upgrade: ${planId.toUpperCase()}`,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'mock_signature',
              planId
            });

            if (verifyRes.data?.success) {
              setCurrentSub(verifyRes.data.subscription);
              showToast(`🎉 Payment Successful! Welcome to ${verifyRes.data.subscription?.planName}`);
              window.dispatchEvent(new Event('subscriptionUpdated'));
            }
          } catch (vErr) {
            showToast('⚠️ Verification notice: ' + (vErr.response?.data?.message || vErr.message));
          }
        },
        prefill: {
          name: user?.name || 'Lingaya Student',
          email: user?.email || 'student@lingayas.edu.in',
          contact: '+91 9876543210'
        },
        notes: {
          university: "Lingaya's Vidyapeeth",
          platform: 'InternMatch AI Campus Engine'
        },
        theme: {
          color: '#00B289'
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failRes) {
        showToast(`❌ Payment Failed: ${failRes.error.description || 'Transaction canceled'}`);
      });
      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      // Fallback test simulation
      showToast('💳 Simulated Payment Verification triggered in Test Sandbox mode.');
      await handleClaimTrial();
    } finally {
      setActionLoading(false);
    }
  };

  const isCareerProActive = currentSub?.planId === 'career-pro' && currentSub?.status === 'active';

  const faqs = [
    {
      q: 'Is the 1-Year Free Campus Trial really 100% free?',
      a: 'Yes, completely free! Under our university partnership grant with Lingaya\'s Vidyapeeth and partner campuses, all students receive full Career Pro features (normally ₹499/year) for 365 days at ₹0. No credit card or payment information is required.'
    },
    {
      q: 'How does the automated 8-Hour Email Sync work in Career Pro?',
      a: 'Career Pro activates our background IMAP synchronization daemon. Every 8 hours, it securely inspects your dedicated career email for recruiter offers, assessment invitations, and rejection notes, automatically updates your live application kanban board, and detects phishing scams.'
    },
    {
      q: 'What happens when my 1-Year Free Trial ends?',
      a: 'Your account will simply transition back to the Scholar Free tier. We never charge surprise renewal fees or lock your data. You keep full access to your saved applications, resume scores, and profile history.'
    },
    {
      q: 'How does InternMatch AI protect my email privacy?',
      a: 'We strictly mandate using a secondary job-search email (like yourname.jobs@gmail.com) and a read-only 16-character Google App Password. We never access personal emails, never read banking messages, and store zero credentials in plain text.'
    },
    {
      q: 'What payment methods does Razorpay support for Recruiter Pro?',
      a: 'Our Razorpay gateway supports all standard Indian and international payment methods, including UPI (Google Pay, PhonePe, Paytm), NetBanking across 50+ Indian banks, Debit Cards, Credit Cards, and Corporate EMI.'
    }
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1B2533', paddingBottom: '80px' }}>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#1B2533',
            color: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.94rem',
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP SPECIAL SCHOLARSHIP ANNOUNCEMENT BANNER */}
      <div
        style={{
          background: 'linear-gradient(90deg, #008C6B 0%, #00B289 50%, #00E5A3 100%)',
          color: '#FFFFFF',
          padding: '14px 20px',
          textAlign: 'center',
          fontSize: '0.92rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(0, 178, 137, 0.2)'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🎓</span>
        <span>
          <strong>Campus Launch Initiative:</strong> 100% Free 1-Year Career Pro Trial (₹499 value) granted to all university students!
        </span>
        {!isCareerProActive && (
          <button
            onClick={handleClaimTrial}
            disabled={actionLoading}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#008C6B',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginLeft: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            Claim ₹0 Access ⚡
          </button>
        )}
      </div>

      {/* 2. HERO HEADER SECTION */}
      <section style={{ padding: '60px 20px 40px 20px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#008C6B',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '18px'
          }}
        >
          <FiGift size={14} />
          <span>Transparent Revenue Model · Razorpay Enabled</span>
        </div>

        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#1B2533',
            margin: '0 0 16px 0',
            lineHeight: 1.15
          }}
        >
          Simple, Fair Plans for{' '}
          <span style={{ color: '#00B289', borderBottom: '3px solid #00E5A3' }}>
            Students &amp; Recruiters
          </span>
        </h1>

        <p style={{ fontSize: '1.12rem', color: '#64748B', lineHeight: 1.6, margin: '0 auto 32px auto', maxWidth: '640px' }}>
          Start for free forever with our Scholar Tier, or activate 1 Full Year of Career Pro completely free with our special university campus launch grant.
        </p>

        {/* Billing cycle pill toggle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#E2E8F0',
            padding: '4px',
            borderRadius: '30px',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '8px 20px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: billingCycle === 'yearly' ? '#00B289' : 'transparent',
              color: billingCycle === 'yearly' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Yearly Billing</span>
            <span
              style={{
                backgroundColor: billingCycle === 'yearly' ? '#FFFFFF' : '#10B981',
                color: billingCycle === 'yearly' ? '#008C6B' : '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              100% OFF TRIAL
            </span>
          </button>

          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '8px 20px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: billingCycle === 'monthly' ? '#00B289' : 'transparent',
              color: billingCycle === 'monthly' ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Monthly Billing
          </button>
        </div>
      </section>

      {/* 3. PRICING CARDS GRID */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            alignItems: 'stretch'
          }}
        >
          {/* PLAN 1: SCHOLAR FREE */}
          <div
            className="card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 30px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}
              >
                Free Forever
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1B2533', margin: '12px 0 6px 0' }}>
                Scholar Free
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Essential AI tools for students to search and apply for verified corporate internships.
              </p>
            </div>

            <div style={{ margin: '16px 0 24px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1B2533' }}>₹0</span>
                <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>/ forever</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700, marginTop: '4px' }}>
                No credit card needed · Free student account
              </div>
            </div>

            {/* Features */}
            <div style={{ flex: 1, marginBottom: '28px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '14px' }}>
                What's Included:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Browse 120+ verified real corporate internships',
                  '5 AI 1-Click auto-applications / month',
                  'Semantic AI Resume Match score calculation',
                  'Manual email status tracking (1 sync/day)',
                  'Standard student dashboard & kanban pipeline'
                ].map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#00B289', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/internships"
              style={{
                width: '100%',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                padding: '13px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.94rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                transition: 'all 0.2s ease'
              }}
            >
              Browse 120 Free Internships →
            </Link>
          </div>

          {/* PLAN 2: CAREER PRO (FEATURED 1-YEAR FREE CAMPUS TRIAL) */}
          <div
            className="card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '38px 32px',
              border: '2px solid #00B289',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 12px 35px rgba(0, 178, 137, 0.15)',
              position: 'relative',
              transform: 'scale(1.02)'
            }}
          >
            {/* POPULAR BADGE */}
            <div
              style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#00B289',
                color: '#FFFFFF',
                padding: '5px 18px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 900,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(0, 178, 137, 0.35)'
              }}
            >
              ⭐ SPECIAL 1-YEAR FREE CAMPUS TRIAL
            </div>

            <div style={{ marginBottom: '20px', marginTop: '6px' }}>
              <span
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#008C6B',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}
              >
                100% Scholarship Grant
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1B2533', margin: '12px 0 6px 0' }}>
                Career Pro
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Autonomous 8-hour email sync, fraud protection shield, and unlimited AI auto-applications.
              </p>
            </div>

            <div style={{ margin: '16px 0 24px 0', borderBottom: '1px solid #ECFDF5', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#00B289' }}>₹0</span>
                <span style={{ color: '#94A3B8', fontSize: '1.2rem', textDecoration: 'line-through', fontWeight: 600 }}>₹499</span>
                <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>/ 1 Full Year</span>
              </div>
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  marginTop: '8px',
                  border: '1px solid #BBF7D0',
                  display: 'inline-block'
                }}
              >
                🎉 100% Free Campus Grant · 365 Days Access · ₹0 Renewal Guarantee
              </div>
            </div>

            {/* Features list */}
            <div style={{ flex: 1, marginBottom: '28px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#008C6B', textTransform: 'uppercase', marginBottom: '14px' }}>
                Everything in Scholar, plus:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { title: 'Unlimited AI 1-Click auto-applications to top MNCs', highlight: true },
                  { title: '8-Hour automated background IMAP email sync engine', highlight: true },
                  { title: 'AI Scam Shield (fake offer & fee detection)', highlight: true },
                  { title: 'Automated Google Meet & Zoom interview sync', highlight: false },
                  { title: 'PyMuPDF AI Resume Optimizer with ATS keyword booster', highlight: false },
                  { title: 'Priority notification alerts for 85%+ job matches', highlight: false },
                  { title: 'Cold-Boot persistent mailbox session recovery', highlight: false },
                  { title: 'Official Lingaya’s Verified Scholar Badge & Certificate', highlight: false }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: item.highlight ? '#1B2533' : '#334155', fontWeight: item.highlight ? 700 : 500 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#00B289', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} strokeWidth={3} />
                    </div>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isCareerProActive ? (
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#ECFDF5',
                  color: '#008C6B',
                  border: '1px solid #A7F3D0',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🟢</span>
                <span>Active: Career Pro ({currentSub?.daysRemaining || 365} Days Remaining)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimTrial}
                disabled={actionLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#00B289',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px rgba(0, 178, 137, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s ease'
                }}
              >
                <FiZap size={18} />
                <span>{actionLoading ? 'Activating 1-Year Pro...' : 'Claim 1-Year Free Pro Trial 🚀'}</span>
              </button>
            )}
          </div>

          {/* PLAN 3: RECRUITER PRO */}
          <div
            className="card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 30px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  textTransform: 'uppercase'
                }}
              >
                For Employers &amp; Colleges
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1B2533', margin: '12px 0 6px 0' }}>
                Recruiter Pro
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Post verified openings, rank student applicants with AI, and hire with zero commission.
              </p>
            </div>

            <div style={{ margin: '16px 0 24px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1B2533' }}>₹2,499</span>
                <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>/ month</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                Razorpay Secure Checkout · GST Invoice provided
              </div>
            </div>

            {/* Features */}
            <div style={{ flex: 1, marginBottom: '28px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '14px' }}>
                Recruiter Features:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Post unlimited verified internship & job openings',
                  'AI semantic candidate ranking & skill matrix match',
                  'Direct candidate outreach & 1-click interview scheduling',
                  'University placement cell management portal',
                  'Applicant tracking system (ATS) with pipeline export',
                  'Zero placement commission fees guaranteed'
                ].map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheck size={12} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleRazorpayCheckout('recruiter-pro', 2499)}
              disabled={actionLoading}
              style={{
                width: '100%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                border: 'none',
                padding: '13px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.94rem',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FiCreditCard size={16} />
              <span>Subscribe via Razorpay</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. RAZORPAY SECURITY & TRUST BADGE */}
      <section style={{ maxWidth: '960px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                color: '#00B289',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiShield size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1B2533' }}>
                Bank-Grade 256-Bit SSL &amp; Razorpay Secured
              </div>
              <div style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '2px' }}>
                RBI-compliant payment processing, UPI instant checkout, zero hidden fees.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>Supported:</span>
            <span style={{ backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>UPI / GPay / PhonePe</span>
            <span style={{ backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>NetBanking</span>
            <span style={{ backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>Credit / Debit Cards</span>
          </div>
        </div>
      </section>

      {/* 5. DETAILED COMPARISON MATRIX */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1B2533', margin: '0 0 10px 0' }}>
            Compare All Features Side-by-Side
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0 }}>
            Everything you need to know about our student and recruiter capabilities.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '18px 24px', fontSize: '0.88rem', fontWeight: 800, color: '#1B2533' }}>Feature</th>
                <th style={{ padding: '18px 20px', fontSize: '0.88rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Scholar Free</th>
                <th style={{ padding: '18px 20px', fontSize: '0.88rem', fontWeight: 800, color: '#008C6B', textAlign: 'center', backgroundColor: '#F0FDF4' }}>Career Pro (1-Yr Free)</th>
                <th style={{ padding: '18px 20px', fontSize: '0.88rem', fontWeight: 800, color: '#1E293B', textAlign: 'center' }}>Recruiter Pro</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.88rem', color: '#334155' }}>
              {[
                { name: 'Verified Corporate Internships', free: '120+ Listings', pro: '120+ Listings', rec: 'Unlimited Posts' },
                { name: 'AI 1-Click Auto-Applies', free: '5 per month', pro: 'Unlimited', rec: 'N/A' },
                { name: '8-Hour Automated Background IMAP Sync', free: '—', pro: '✅ Active (8h cycle)', rec: 'N/A' },
                { name: 'AI Fraud & Phishing Scam Shield', free: '—', pro: '✅ Active', rec: '✅ Active' },
                { name: 'PyMuPDF AI Resume Parsing & ATS Scoring', free: 'Basic Score', pro: 'Full Optimizer', rec: 'Resume Ranking' },
                { name: 'Google Meet & Zoom Calendar Sync', free: '—', pro: '✅ Auto-Schedule', rec: '✅ Direct Invite' },
                { name: 'Applicant Tracking Kanban Board', free: '✅ Included', pro: '✅ Real-time Synced', rec: '✅ Full ATS Export' },
                { name: 'University Placement Cell Integration', free: '—', pro: 'Lingaya’s Verified', rec: 'Dedicated Portal' },
                { name: 'Annual Cost with Campus Grant', free: '₹0', pro: '₹0 (100% OFF)', rec: '₹2,499 / mo' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#1B2533' }}>{row.name}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#64748B' }}>{row.free}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#008C6B', fontWeight: 700, backgroundColor: '#FAFDFB' }}>{row.pro}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#334155' }}>{row.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1B2533', margin: '0 0 10px 0' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0 }}>
            Got questions? We're here to help you get the most out of InternMatch AI.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: '#1B2533'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FiChevronUp size={18} color="#00B289" /> : <FiChevronDown size={18} color="#94A3B8" />}
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 24px 20px 24px',
                      fontSize: '0.90rem',
                      color: '#475569',
                      lineHeight: 1.6,
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '14px'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default SubscriptionsPage;
