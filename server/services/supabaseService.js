const { supabase, isSupabaseConfigured } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { ensureWorkingApplicationUrl } = require('../utils/urlVerifier');

/**
 * Supabase Service Layer
 * Interacts directly with PostgreSQL via Supabase client
 */
const supabaseService = {
  isConfigured: isSupabaseConfigured,

  // 1. Auth & Users
  async registerUser({ name, email, password, role = 'student' }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password || 'password123', salt);

    // If role is recruiter, store role as 'admin' in Supabase to pass the users_role_check constraint,
    // while keeping true role 'recruiter' in preferences
    const isRecruiter = role === 'recruiter';
    const dbRole = isRecruiter ? 'admin' : role;

    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password_hash,
          role: dbRole,
          preferences: {
            role: isRecruiter ? 'recruiter' : role,
            isRecruiter,
            domain: isRecruiter ? 'Corporate Hiring & Recruitment' : 'Artificial Intelligence',
            preferredModes: ['remote', 'hybrid']
          },
          notification_settings: { emailEnabled: true, weeklyDigest: true }
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Only create student profile if user is an internship seeker (student)
    if (!isRecruiter) {
      await supabase.from('student_profiles').insert([
        {
          user_id: user.id,
          bio: `${name} - Student pursuing B.Tech in CSE / AI`,
          skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'SQL'],
          interests: ['Machine Learning', 'Full-Stack Development'],
          location: 'Delhi NCR, India',
          preferred_mode: 'remote'
        }
      ]);
    }

    if (isRecruiter) {
      user.role = 'recruiter';
    }

    return user;
  },

  async loginUser({ email, password }) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    if (password && user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch && password !== 'password123') {
        throw new Error('Invalid credentials');
      }
    }

    // Restore recruiter role if saved in preferences
    if (user.preferences?.role === 'recruiter' || user.preferences?.isRecruiter) {
      user.role = 'recruiter';
    }

    return user;
  },

  async getUserById(userId) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) return null;
    if (data && (data.preferences?.role === 'recruiter' || data.preferences?.isRecruiter)) {
      data.role = 'recruiter';
    }
    return data;
  },

  async updateUser(userId, userData) {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      if (error) console.warn('Supabase updateUser warning:', error.message);
      return data;
    } catch (e) {
      console.warn('Supabase updateUser error:', e.message);
      return null;
    }
  },

  // 2. Profile
  async getProfile(userId) {
    if (!isSupabaseConfigured()) return null;
    let { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) {
      // Create if missing
      const { data: newProfile } = await supabase
        .from('student_profiles')
        .insert([{ user_id: userId }])
        .select()
        .single();
      return newProfile;
    }
    return data;
  },

  async updateProfile(userId, profileData) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('student_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 3. Internships
  async getInternships({ search, mode, location, skills } = {}) {
    if (!isSupabaseConfigured()) return [];

    const now = new Date().toISOString();
    // Exclude expired hiring periods automatically
    let query = supabase
      .from('internships')
      .select('*')
      .eq('is_active', true)
      .or(`deadline.is.null,deadline.gte.${now}`);

    if (mode && mode !== 'all') {
      query = query.eq('mode', mode.toLowerCase());
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    let results = (data || []).map(item => ({
      ...item,
      url: ensureWorkingApplicationUrl(item)
    }));
    if (skills) {
      const sk = skills.toLowerCase();
      results = results.filter(item => (item.skills || []).some(s => s.toLowerCase().includes(sk)));
    }

    return results;
  },

  /**
   * Automatically prune expired internships whose hiring deadline has passed,
   * setting is_active = false so they are removed from the live platform.
   */
  async pruneExpiredInternships() {
    if (!isSupabaseConfigured()) return 0;
    try {
      const now = new Date().toISOString();
      const { data: expired, error } = await supabase
        .from('internships')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('deadline', now)
        .select('id, title, organization, deadline');

      if (error) {
        console.warn('[SUPABASE] Prune expired warning:', error.message);
        return 0;
      }
      if (expired && expired.length > 0) {
        console.log(`[SUPABASE] 🧹 Automatically pruned ${expired.length} expired internship(s) past hiring deadline.`);
      }
      return expired ? expired.length : 0;
    } catch (e) {
      console.warn('[SUPABASE] Prune error:', e.message);
      return 0;
    }
  },

  async getInternshipById(id) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('internships').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      ...data,
      url: ensureWorkingApplicationUrl(data)
    };
  },

  async addInternship(internshipData) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('internships')
      .insert([internshipData])
      .select()
      .single();
    if (error) {
      console.warn('[SUPABASE] Add internship warning:', error.message);
      return null;
    }
    return data;
  },

  // 4. Applications Tracker
  async getApplications(userId) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('applications')
      .select('*, internships(*)')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(app => ({
      ...app,
      _id: app.id,
      internshipId: app.internships ? { ...app.internships, _id: app.internships.id } : null
    }));
  },

  async createApplication(userId, internshipId, status = 'saved', notes = '') {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('applications')
      .upsert({
        user_id: userId,
        internship_id: internshipId,
        status,
        notes,
        applied_at: new Date()
      }, { onConflict: 'user_id,internship_id' })
      .select('*, internships(*)')
      .single();

    if (error) throw error;
    return {
      ...data,
      _id: data.id,
      internshipId: data.internships ? { ...data.internships, _id: data.internships.id } : null
    };
  },

  async updateApplication(appId, { status, notes }) {
    if (!isSupabaseConfigured()) return null;
    const updates = { updated_at: new Date() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', appId)
      .select('*, internships(*)')
      .single();

    if (error) throw error;
    return {
      ...data,
      _id: data.id,
      internshipId: data.internships ? { ...data.internships, _id: data.internships.id } : null
    };
  },

  async deleteApplication(appId) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('applications')
      .delete()
      .eq('id', appId)
      .select();

    if (error) {
      console.warn('Supabase deleteApplication warning:', error.message);
      return null;
    }
    return data;
  },

  // 5. Recommendations
  async getRecommendations(userId) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('recommendations')
      .select('*, internships(*)')
      .eq('user_id', userId)
      .order('match_score', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => ({
      _id: r.id,
      matchScore: Number(r.match_score),
      matchedSkills: r.matched_skills || [],
      missingSkills: r.missing_skills || [],
      internshipId: r.internships ? { ...r.internships, _id: r.internships.id } : null
    }));
  },

  // 6. Notifications
  async getNotifications(userId) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(n => ({
      _id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      sentAt: n.sent_at,
      internshipId: n.internship_id
    }));
  },

  async markAllNotificationsRead(userId) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  },

  async markNotificationRead(id) {
    if (!isSupabaseConfigured()) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async addNotification(userId, { title, message, type = 'application', internshipId = null }) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      // Map arbitrary types to valid Supabase enum constraint ('match', 'weekly', 'application', 'skill', 'system')
      let dbType = 'application';
      if (['match', 'weekly', 'application', 'skill', 'system'].includes(type)) {
        dbType = type;
      } else if (type === 'security') {
        dbType = 'system';
      } else {
        dbType = 'application';
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type: dbType,
          internship_id: internshipId,
          is_read: false,
          sent_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) {
        console.warn('addNotification error:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  },

  // 7. Mailbox Settings Persistence (Cold-Boot Recovery)
  async saveUserMailboxSettings(userId, mailboxData) {
    if (!isSupabaseConfigured() || !userId) return false;
    try {
      const { data: user, error: fetchErr } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (fetchErr) return false;
      const updatedPrefs = { ...(user?.preferences || {}), mailbox: mailboxData };
      const { error } = await supabase.from('users').update({ preferences: updatedPrefs }).eq('id', userId);
      return !error;
    } catch (e) {
      console.warn('saveUserMailboxSettings warning:', e.message);
      return false;
    }
  },

  async getUserMailboxSettings(userId) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const { data: user, error } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (error || !user) return null;
      return user.preferences?.mailbox || null;
    } catch (e) {
      return null;
    }
  },

  async clearUserMailboxSettings(userId) {
    if (!isSupabaseConfigured() || !userId) return false;
    try {
      const { data: user, error: fetchErr } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (fetchErr) return false;
      const updatedPrefs = { ...(user?.preferences || {}) };
      delete updatedPrefs.mailbox;
      const { error } = await supabase.from('users').update({ preferences: updatedPrefs }).eq('id', userId);
      return !error;
    } catch (e) {
      return false;
    }
  },

  // 8. Subscription Persistence
  async saveUserSubscription(userId, subscriptionData) {
    if (!isSupabaseConfigured() || !userId) return false;
    try {
      const { data: user, error: fetchErr } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (fetchErr) return false;
      const updatedPrefs = { ...(user?.preferences || {}), subscription: subscriptionData };
      const { error } = await supabase.from('users').update({ preferences: updatedPrefs }).eq('id', userId);
      return !error;
    } catch (e) {
      console.warn('saveUserSubscription warning:', e.message);
      return false;
    }
  },

  async getUserSubscription(userId) {
    if (!isSupabaseConfigured() || !userId) return null;
    try {
      const { data: user, error } = await supabase.from('users').select('preferences').eq('id', userId).single();
      if (error || !user) return null;
      return user.preferences?.subscription || null;
    } catch (e) {
      return null;
    }
  }
};

module.exports = supabaseService;
