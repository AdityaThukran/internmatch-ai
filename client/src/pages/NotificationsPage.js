import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiCheck,
  FiCpu,
  FiCalendar,
  FiAward,
  FiSearch,
  FiTrash2,
  FiLayers,
  FiGlobe,
  FiArrowRight,
  FiFilter
} from 'react-icons/fi';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const typeConfig = {
  offer: { icon: <FiAward />, color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', label: '🏆 Job Offer' },
  interview: { icon: <FiCheckCircle />, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: '🎙️ Interview' },
  match: { icon: <FiCpu />, color: '#00B289', bg: '#E6F7F2', border: '#A7F3D0', label: 'AI Match' },
  application: { icon: <FiLayers />, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', label: 'Application' },
  crawler: { icon: <FiGlobe />, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', label: 'Live Crawler' },
  weekly: { icon: <FiCalendar />, color: '#0D9488', bg: '#CCFBF1', border: '#99F6E4', label: 'Weekly Digest' },
  skill: { icon: <FiAward />, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: 'Skill Alert' },
  default: { icon: <FiBell />, color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', label: 'Notification' }
};

const getType = (item) => {
  const t = `${item.title || ''} ${item.type || ''} ${item.message || ''}`.toLowerCase();
  if (t.includes('offer') || t.includes('congratulations') || t.includes('selection letter') || t.includes('extended')) return typeConfig.offer;
  if (t.includes('interview') || t.includes('shortlist') || t.includes('technical round') || t.includes('scheduled')) return typeConfig.interview;
  if (t.includes('match') || t.includes('recommend') || t.includes('cosine')) return typeConfig.match;
  if (t.includes('application') || t.includes('status') || t.includes('milestone') || t.includes('saved')) return typeConfig.application;
  if (t.includes('crawler') || t.includes('scraped') || t.includes('pruned') || t.includes('discovery') || t.includes('aggregated')) return typeConfig.crawler;
  if (t.includes('weekly') || t.includes('digest')) return typeConfig.weekly;
  if (t.includes('skill') || t.includes('resume') || t.includes('pymupdf')) return typeConfig.skill;
  return typeConfig.default;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      const list = res.data?.data?.notifications || res.data?.data || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setNotifications(arr);
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleMarkOne = async (id) => {
    try {
      await markAsRead(id);
    } catch (err) {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch (err) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotice('All notifications marked as read.');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleDeleteOne = async (id) => {
    try {
      await deleteNotification(id);
    } catch (err) {}
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (err) {}
    setNotifications([]);
    setNotice('All notifications cleared.');
    setTimeout(() => setNotice(''), 3000);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const matchCount = notifications.filter((n) => {
    const t = `${n.title || ''} ${n.type || ''}`.toLowerCase();
    return t.includes('match') || t.includes('recommend');
  }).length;
  const appCount = notifications.filter((n) => {
    const t = `${n.title || ''} ${n.type || ''}`.toLowerCase();
    return t.includes('application') || t.includes('milestone') || t.includes('saved');
  }).length;
  const weeklyCount = notifications.filter((n) => {
    const t = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    return t.includes('weekly') || t.includes('digest');
  }).length;

  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !item.isRead) ||
      (filterStatus === 'read' && item.isRead);

    const t = `${item.title || ''} ${item.type || ''} ${item.message || ''}`.toLowerCase();
    const matchesType =
      filterType === 'all' ||
      (filterType === 'match' && (t.includes('match') || t.includes('recommend'))) ||
      (filterType === 'application' && (t.includes('application') || t.includes('milestone') || t.includes('saved'))) ||
      (filterType === 'crawler' && (t.includes('crawler') || t.includes('scraped') || t.includes('pruned'))) ||
      (filterType === 'weekly' && t.includes('weekly')) ||
      (filterType === 'skill' && t.includes('skill'));

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '920px' }}>

        {/* Header Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1B2533 0%, #2D3748 100%)',
          borderRadius: '20px',
          padding: '36px 32px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 10px 30px rgba(27, 37, 51, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle decorative circles */}
          <div style={{
            position: 'absolute', right: '-40px', top: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 178, 137, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px', padding: '4px 14px', marginBottom: '12px',
                fontSize: '0.8rem', fontWeight: 600, color: '#6EE7B7'
              }}>
                <span className="pulse-dot" style={{ backgroundColor: '#00B289' }}></span>
                <span>Real-Time Career Intelligence</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Notification Center
              </h1>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', maxWidth: '540px', lineHeight: 1.5 }}>
                Personalized AI semantic matches, automated weekly alert digests, and application tracker milestones.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  style={{
                    background: '#00B289',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 178, 137, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 178, 137, 0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 178, 137, 0.3)'; }}
                >
                  <FiCheckCircle size={15} />
                  <span>Mark All Read ({unreadCount})</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; e.currentTarget.style.borderColor = '#EF4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
                >
                  <FiTrash2 size={14} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards Inside Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '28px'
          }}>
            {[
              { label: 'Unread Alerts', value: unreadCount, color: '#6EE7B7', icon: '🔔' },
              { label: 'AI Matches', value: matchCount, color: '#00B289', icon: '🧠' },
              { label: 'Weekly Digests', value: weeklyCount, color: '#A7F3D0', icon: '📅' },
              { label: 'Total Tracked', value: notifications.length, color: '#ffffff', icon: '📬' },
            ].map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {m.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action / Success Banner */}
        {notice && (
          <div
            style={{
              backgroundColor: '#E6F7F2',
              border: '1px solid #00B289',
              color: '#008C6B',
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiCheckCircle />
            <span>{notice}</span>
          </div>
        )}

        {/* Sophisticated Control & Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px 20px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '24px'
        }}>
          {/* Top row: search + status buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 14px',
              flex: '1 1 240px',
              maxWidth: '380px'
            }}>
              <FiSearch style={{ color: 'var(--text-light)', fontSize: '1rem' }} />
              <input
                type="text"
                placeholder="Filter by keyword or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.9rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Read / Unread Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              {[
                { id: 'all', label: `All (${notifications.length})` },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'read', label: `Read (${notifications.length - unreadCount})` }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  style={{
                    background: filterStatus === st.id ? '#ffffff' : 'transparent',
                    color: filterStatus === st.id ? 'var(--secondary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: filterStatus === st.id ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: Type category filter chips - Swipeable on Android */}
          <div
            className="mobile-swipe-tabs"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              alignItems: 'center',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9'
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <FiFilter size={12} /> Category:
            </span>
            {[
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'match', label: `🧠 AI Matches (${matchCount})` },
              { id: 'application', label: `📋 Pipeline (${appCount})` },
              { id: 'crawler', label: '🌐 Live Discoveries' },
              { id: 'weekly', label: `📅 Digests (${weeklyCount})` },
              { id: 'skill', label: '🎯 Skill Insights' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                style={{
                  background: filterType === cat.id ? '#00B289' : '#F1F5F9',
                  color: filterType === cat.id ? '#ffffff' : '#334155',
                  border: `1px solid ${filterType === cat.id ? '#00B289' : '#E2E8F0'}`,
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <LoadingSpinner text="Loading notification alerts..." />
        ) : filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px dashed var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(224,122,95,0.1)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 16px'
            }}>
              🔔
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '8px' }}>
              No notifications match your filter
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Try switching your filter tabs or clear search terms to view all incoming digests and AI match vectors.
            </p>
            <button
              onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchQuery(''); }}
              className="btn btn-outline btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredNotifications.map((item) => {
              const cfg = getType(item);
              return (
                <div
                  key={item._id}
                  style={{
                    padding: '22px 24px',
                    borderRadius: '14px',
                    backgroundColor: item.isRead ? '#ffffff' : '#F0FDF4',
                    border: `1.5px solid ${item.isRead ? '#E5E7EB' : '#A7F3D0'}`,
                    boxShadow: item.isRead
                      ? '0 1px 3px rgba(0,0,0,0.03)'
                      : '0 4px 14px rgba(0, 178, 137, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '18px',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'perspective(1000px) rotateX(0deg)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'perspective(1000px) translateY(-3px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 16px 36px rgba(61,64,91,0.12), 0 4px 10px rgba(224,122,95,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'perspective(1000px) translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = item.isRead
                      ? '0 4px 14px rgba(61,64,91,0.05)'
                      : '0 8px 24px rgba(224,122,95,0.14), 0 2px 6px rgba(61,64,91,0.06)';
                  }}
                >
                  {/* Left Vertical Accent Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '16px',
                      bottom: '16px',
                      width: '4px',
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: item.isRead ? 'rgba(61,64,91,0.2)' : cfg.color
                    }}
                  />

                  <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0, paddingLeft: '8px' }}>
                    {/* Category Type Icon Badge */}
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                        border: `1px solid ${cfg.color}35`
                      }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Content Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: cfg.color,
                            backgroundColor: cfg.bg,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {cfg.label}
                        </span>

                        {!item.isRead && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              backgroundColor: 'var(--primary)',
                              color: '#ffffff',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 800,
                              letterSpacing: '0.5px'
                            }}
                          >
                            NEW
                          </span>
                        )}

                        <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                          <FiClock size={12} /> {timeAgo(item.sentAt)}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: item.isRead ? 600 : 800,
                          color: 'var(--secondary)',
                          marginBottom: '6px',
                          lineHeight: 1.35
                        }}
                      >
                        {item.title || 'System Notification'}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(item._id)}
                          className="btn btn-ghost btn-sm"
                          title="Mark as read"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#008C6B',
                            backgroundColor: '#E6F7F2',
                            border: '1px solid #A7F3D0',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiCheck size={13} strokeWidth={3} />
                          <span>Mark read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteOne(item._id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete notification"
                        style={{
                          padding: '6px 8px',
                          color: '#94A3B8',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#FECACA'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>

                    {/* Action Route Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const t = `${item.title || ''} ${item.message || ''}`.toLowerCase();
                        if (t.includes('match') || t.includes('recommend')) {
                          navigate('/recommendations');
                        } else if (t.includes('application') || t.includes('milestone') || t.includes('saved')) {
                          navigate('/applications');
                        } else {
                          navigate('/internships');
                        }
                      }}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '8px',
                        backgroundColor: '#00B289'
                      }}
                    >
                      <span>
                        {(() => {
                          const t = `${item.title || ''} ${item.message || ''}`.toLowerCase();
                          if (t.includes('match') || t.includes('recommend')) return 'View In AI Matches';
                          if (t.includes('application') || t.includes('milestone') || t.includes('saved')) return 'Open In Live Tracker';
                          return 'Explore Openings';
                        })()}
                      </span>
                      <FiArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
