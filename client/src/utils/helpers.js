export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return formatDate(dateString);
};

export const getMatchColor = (score) => {
  if (score >= 70) return '#00B289';
  if (score >= 40) return '#D97706';
  return '#64748B';
};

export const getStatusColor = (status) => {
  const colors = {
    saved: '#64748B',
    applied: '#00B289',
    interviewing: '#D97706',
    offered: '#059669',
    rejected: '#EF4444',
    withdrawn: '#9CA3AF',
  };
  return colors[status?.toLowerCase()] || '#9CA3AF';
};

export const getStatusLabel = (status) => {
  const labels = {
    saved: 'Saved',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offered: 'Offered',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[status?.toLowerCase()] || status;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatStipend = (amount) => {
  if (!amount || amount === 0) return 'Unpaid';
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K/mo`;
  return `₹${amount}/mo`;
};

export const getRandomWarmColor = () => {
  const colors = ['#00B289', '#008C6B', '#1B2533', '#4D5C6D', '#D97706', '#059669'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const calculateProfileCompletion = (user) => {
  if (!user) return 0;
  let score = 0;
  const total = 6;
  if (user.name) score++;
  if (user.email) score++;
  if (user.skills && user.skills.length > 0) score++;
  if (user.education && user.education.length > 0) score++;
  if (user.interests && user.interests.length > 0) score++;
  if (user.resume) score++;
  return Math.round((score / total) * 100);
};
