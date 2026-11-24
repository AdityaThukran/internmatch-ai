import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheck,
  FiX,
  FiCpu,
  FiCalendar,
  FiAward,
  FiTrash2,
  FiArrowRight,
  FiGlobe,
  FiLayers,
  FiShield,
  FiMail,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  clearAllNotifications
} from '../../services/api';

/**
 * Category styling config matching HelloBonsai palette
 */
const typeConfig = {
  match: {
    icon: <FiCpu size={15} />,
    color: '#00B289',
    bg: '#E6F7F2',
    border: '#A7F3D0',
    label: 'AI Match'
  },
  application: {
    icon: <FiLayers size={15} />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    label: 'Pipeline'
  },
  crawler: {
    icon: <FiGlobe size={15} />,
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    label: 'Live Crawler'
  },
  weekly: {
    icon: <FiCalendar size={15} />,
    color: '#0D9488',
    bg: '#CCFBF1',
    border: '#99F6E4',
    label: 'Weekly Digest'
  },
  skill: {
    icon: <FiAward size={15} />,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    label: 'Skill Insight'
  },
  offer: {
    icon: <FiAward size={15} />,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: 'Offer Letter'
  },
  interview: {
    icon: <FiCalendar size={15} />,
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    label: 'Interview Round'
  },
  security: {
    icon: <FiShield size={15} />,
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    label: 'Scam Blocked'
  },
  email: {
    icon: <FiMail size={15} />,
    color: '#00B289',
    bg: '#E6F7F2',
    border: '#A7F3D0',
    label: 'Email Sync'
  },
  default: {
    icon: <FiBell size={15} />,
    color: '#475569',
    bg: '#F1F5F9',
    border: '#E2E8F0',
    label: 'Notice'
  }
};

const getTypeConfig = (item) => {
  const t = `${item.title || ''} ${item.type || ''} ${item.message || ''}`.toLowerCase();
  if (t.includes('scam') || t.includes('fraud') || t.includes('blocked') || t.includes('security') || item.type === 'security') return typeConfig.security;
  if (t.includes('offer letter') || t.includes('offer extended') || item.type === 'offer') return typeConfig.offer;
  if (t.includes('interview') || item.type === 'interview') return typeConfig.interview;
  if (t.includes('sync') || t.includes('mailbox') || item.type === 'email') return typeConfig.email;
  if (t.includes('match') || t.includes('recommend') || t.includes('cosine')) return typeConfig.match;
  if (t.includes('application') || t.includes('status') || t.includes('milestone') || t.includes('saved')) return typeConfig.application;
  if (t.includes('crawler') || t.includes('scraped') || t.includes('pruned') || t.includes('discovery') || t.includes('aggregated')) return typeConfig.crawler;
  if (t.includes('weekly') || t.includes('digest') || t.includes('weekend')) return typeConfig.weekly;
  if (t.includes('skill') || t.includes('pymupdf') || t.includes('resume')) return typeConfig.skill;
  return typeConfig.default;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
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

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'match' | 'application'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      const count = res.data?.data?.unreadCount || res.data?.unreadCount || 0;
      setUnreadCount(Number(count) || 0);
    } catch {}
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      const list = res.data?.data?.notifications || res.data?.data || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setNotifications(arr);
      setUnreadCount(arr.filter((n) => !n.isRead).length);
    } catch (err) {
      console.warn('Notification fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const iv = setInterval(fetchUnread, 25000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchList();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkOne = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDeleteOne = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
    } catch {}
    const itemToDelete = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (itemToDelete && !itemToDelete.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch {}
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleItemClick = (item) => {
    if (!item.isRead) {
      handleMarkOne(item._id);
    }
    const t = `${item.title || ''} ${item.message || ''}`.toLowerCase();
    setIsOpen(false);
    if (t.includes('match') || t.includes('recommend')) {
      navigate('/recommendations');
    } else if (t.includes('application') || t.includes('status') || t.includes('milestone') || t.includes('saved') || t.includes('interview')) {
      navigate('/applications');
    } else {
      navigate('/internships');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'match') {
      const t = `${n.title || ''} ${n.message || ''}`.toLowerCase();
      return t.includes('match') || t.includes('recommend');
    }
    if (activeTab === 'application') {
      const t = `${n.title || ''} ${n.message || ''}`.toLowerCase();
      return t.includes('application') || t.includes('status') || t.includes('milestone') || t.includes('saved');
    }
    return true;
  });

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={dropdownRef}>
      {/* ── Bell Trigger Button (HelloBonsai Signature) ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="bonsai-bell-btn"
        style={{
          position: 'relative',
          backgroundColor: isOpen ? '#E6F7F2' : (unreadCount > 0 ? '#F0FDF4' : '#FFFFFF'),
          border: isOpen ? '1.5px solid #00B289' : (unreadCount > 0 ? '1.5px solid #A7F3D0' : '1.5px solid #E2E8F0'),
          borderRadius: '12px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? '#008C6B' : (unreadCount > 0 ? '#00B289' : '#1B2533'),
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isOpen
            ? '0 4px 16px rgba(0, 178, 137, 0.28)'
            : (unreadCount > 0 ? '0 2px 8px rgba(0, 178, 137, 0.16)' : '0 1px 4px rgba(0, 0, 0, 0.04)'),
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#00B289';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 178, 137, 0.18)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = unreadCount > 0 ? '#A7F3D0' : '#E2E8F0';
            e.currentTarget.style.boxShadow = unreadCount > 0 ? '0 2px 8px rgba(0, 178, 137, 0.16)' : '0 1px 4px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <FiBell
          size={19}
          style={{
            animation: unreadCount > 0 ? 'bellSwing 3.5s ease-in-out infinite' : 'none',
            color: isOpen ? '#008C6B' : (unreadCount > 0 ? '#00B289' : '#334155')
          }}
        />

        {/* Unread Glowing Pulse Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '19px',
              height: '19px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)',
              animation: 'bellRadarPulse 2.2s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification Dropdown Panel ── */}
      {isOpen && (
        <div
          className="notification-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '390px',
            maxHeight: '540px',
            background: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.14), 0 4px 14px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'bellDropIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: '16px 18px 0',
              background: 'linear-gradient(135deg, #00B289 0%, #008C6B 100%)',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBell size={17} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.01em' }}>
                  Live Notifications
                </span>
                {unreadCount > 0 ? (
                  <span
                    style={{
                      background: '#FFFFFF',
                      color: '#008C6B',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '200px'
                    }}
                  >
                    {unreadCount} new
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '200px'
                    }}
                  >
                    All caught up
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAll}
                    title="Mark all notifications as read"
                    style={{
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
                  >
                    <FiCheck size={12} />
                    <span>Read all</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FiX size={15} />
                </button>
              </div>
            </div>

            {/* Filter Tabs Strip */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: `All (${notifications.length})` },
                { id: 'unread', label: `Unread (${notifications.filter((n) => !n.isRead).length})` },
                { id: 'match', label: 'Matches' },
                { id: 'application', label: 'Pipeline' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: activeTab === t.id ? '#FFFFFF' : 'transparent',
                    color: activeTab === t.id ? '#008C6B' : 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    padding: '7px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List Scroll Area */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '380px' }}>
            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '3px solid #E6F7F2',
                    borderTopColor: '#00B289',
                    margin: '0 auto 10px',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0 }}>
                  Synchronizing notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <p style={{ fontWeight: 800, color: '#1B2533', marginBottom: '4px', fontSize: '0.94rem' }}>
                  {activeTab === 'unread' ? 'All caught up!' : 'No notifications found'}
                </p>
                <p style={{ fontSize: '0.80rem', color: '#64748B', maxWidth: '280px', margin: '0 auto' }}>
                  {activeTab === 'unread'
                    ? 'You have addressed all active alerts and updates.'
                    : 'Real-time job discoveries and application milestones will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item, idx) => {
                const cfg = getTypeConfig(item);
                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: idx < filteredNotifications.length - 1 ? '1px solid #F1F5F9' : 'none',
                      backgroundColor: item.isRead ? '#FFFFFF' : '#F0FDF9',
                      transition: 'background 0.15s ease',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = item.isRead ? '#FFFFFF' : '#F0FDF9')
                    }
                  >
                    {/* Unread Left Border Highlight */}
                    {!item.isRead && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '12px',
                          bottom: '12px',
                          width: '3.5px',
                          borderRadius: '0 3px 3px 0',
                          backgroundColor: '#00B289'
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {/* Category Icon */}
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                color: cfg.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                marginBottom: '2px'
                              }}
                            >
                              {cfg.label}
                            </span>
                            <h4
                              style={{
                                fontSize: '0.86rem',
                                fontWeight: item.isRead ? 600 : 800,
                                color: '#1B2533',
                                margin: '0 0 3px',
                                lineHeight: 1.3
                              }}
                            >
                              {item.title}
                            </h4>
                          </div>

                          {/* Quick Item Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            {!item.isRead && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkOne(item._id, e)}
                                title="Mark as read"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#00B289',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  borderRadius: '6px'
                                }}
                              >
                                <FiCheck size={13} strokeWidth={3} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDeleteOne(item._id, e)}
                              title="Delete notification"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '6px'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: '0.78rem',
                            color: '#475569',
                            lineHeight: 1.45,
                            margin: '2px 0 6px'
                          }}
                        >
                          {item.message}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#94A3B8' }}>
                          <span>{timeAgo(item.sentAt)}</span>

                          <span style={{ color: '#008C6B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <span>Action</span>
                            <FiArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel Footer */}
          <div
            style={{
              padding: '12px 18px',
              borderTop: '1px solid #F1F5F9',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
              >
                Clear all
              </button>
            ) : (
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                Refreshes every 25s
              </span>
            )}

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#008C6B',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Full Notification Center</span>
              <FiArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Modern Keyframe Animations */}
      <style>{`
        @keyframes bellRadarPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        @keyframes bellSwing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-14deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(6deg); }
          75% { transform: rotate(-2deg); }
        }
        @keyframes bellDropIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 640px) {
          .notification-dropdown-panel {
            position: fixed !important;
            top: 66px !important;
            right: 12px !important;
            left: 12px !important;
            width: auto !important;
            max-width: 390px !important;
            margin: 0 0 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
