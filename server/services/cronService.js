const cron = require('node-cron');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const MonitoringRun = require('../models/MonitoringRun');
const { matchStudentWithInternships } = require('./matchingService');
const { sendInternshipAlert } = require('./emailService');
const internshipAggregator = require('./internshipAggregator');
const supabaseService = require('./supabaseService');
const emailSyncService = require('./emailSyncService');

/**
 * Initialize all cron jobs.
 */
const initCronJobs = () => {
  // Weekly monitoring job: runs every Sunday at 8:00 AM
  cron.schedule('0 8 * * 0', async () => {
    console.log('[CRON] Weekly monitoring job started');
    try {
      await weeklyMonitoringJob();
    } catch (error) {
      console.error('[CRON] Weekly monitoring job error:', error.message);
    }
  });

  // ─── DAILY INTERNSHIP REFRESH ────────────────────────────────────────────
  // Every day at 6:00 AM IST: prune expired internships and log catalogue freshness
  cron.schedule('0 6 * * *', async () => {
    console.log('[CRON] 🌅 Daily internship refresh started...');
    try {
      // 1. Prune expired from in-memory aggregator catalogue
      const prunedMemory = internshipAggregator.pruneExpiredFromCatalogue();

      // 2. Prune expired from Supabase DB
      let prunedDB = 0;
      try {
        prunedDB = await supabaseService.pruneExpiredInternships();
      } catch (e) {
        console.warn('[CRON] Supabase prune warning:', e.message);
      }

      const stats = internshipAggregator.getCatalogueStats();
      console.log(`[CRON] ✅ Daily refresh complete: ${prunedMemory} in-memory + ${prunedDB} DB listings pruned. Active: ${stats.activeListings} across ${stats.platforms.length} platforms.`);
    } catch (err) {
      console.error('[CRON] Daily refresh error:', err.message);
    }
  });

  // ─── MIDDAY EXPIRY CHECK ─────────────────────────────────────────────────
  // Every day at 12:00 PM: re-check for newly expired internships
  cron.schedule('0 12 * * *', async () => {
    try {
      const prunedMemory = internshipAggregator.pruneExpiredFromCatalogue();
      if (prunedMemory > 0) {
        console.log(`[CRON] 🕛 Midday prune: ${prunedMemory} internships passed their deadline. Feed updated.`);
      }
    } catch (err) {
      console.error('[CRON] Midday prune error:', err.message);
    }
  });

  // ─── 8-HOUR AUTOMATED MAILBOX SYNC & AI LEGITIMACY SCANNER ───────────────
  // Every 8 hours (00:00, 08:00, 16:00): inspect inboxes, filter fraud, and sync Live Tracker
  cron.schedule('0 */8 * * *', async () => {
    console.log('[CRON] 📬 8-Hour Career Mailbox Sync & AI Legitimacy Scan starting...');
    try {
      await emailSyncService.run8HourSyncCycle();
    } catch (err) {
      console.error('[CRON] 8-Hour Mailbox Sync error:', err.message);
    }
  });

  // Start in-memory 8-hour scheduler daemon
  try {
    emailSyncService.start8HourScheduler();
  } catch (schedErr) {
    console.warn('[EmailSync] Scheduler warning:', schedErr.message);
  }

  console.log('[CRON] Cron jobs initialized:');
  console.log('  → 8-Hour Mailbox Sync: Every 8 hours (00:00, 08:00, 16:00)');
  console.log('  → Weekly monitoring: Sunday 8:00 AM');
  console.log('  → Daily internship refresh: Every day 6:00 AM');
  console.log('  → Midday expiry check: Every day 12:00 PM');
};

/**
 * Weekly monitoring job:
 * 1. Create MonitoringRun record
 * 2. Get all active internships posted in the last 7 days
 * 3. Get all student profiles
 * 4. Match each student against new internships
 * 5. Create notifications for high matches (score > 60)
 * 6. Send emails where enabled
 * 7. Update MonitoringRun with results
 */
const weeklyMonitoringJob = async () => {
  const startTime = Date.now();

  // 1. Create monitoring run record
  const monitoringRun = await MonitoringRun.create({
    source: 'weekly-cron',
    startedAt: new Date(),
    status: 'running',
  });

  const errors = [];
  let newListingCount = 0;
  let matchedStudentCount = 0;

  try {
    // 2. Get active internships from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newInternships = await Internship.find({
      isActive: true,
      postedAt: { $gte: sevenDaysAgo },
    });

    newListingCount = newInternships.length;
    console.log(`[CRON] Found ${newListingCount} new internships in the last 7 days`);

    if (newInternships.length === 0) {
      // No new internships, complete early
      await MonitoringRun.findByIdAndUpdate(monitoringRun._id, {
        completedAt: new Date(),
        status: 'completed',
        newListingCount: 0,
        matchedStudentCount: 0,
        errors,
        duration: Date.now() - startTime,
      });
      console.log('[CRON] No new internships found. Job completed.');
      return;
    }

    // 3. Get all student profiles
    const studentProfiles = await StudentProfile.find({}).populate('userId');
    console.log(`[CRON] Processing ${studentProfiles.length} student profiles`);

    // 4. Match each student against new internships
    for (const profile of studentProfiles) {
      try {
        if (!profile.userId) continue;

        const user = profile.userId;

        // Skip if user has no skills set up
        if (!profile.skills || profile.skills.length === 0) continue;

        const matchResults = await matchStudentWithInternships(profile, newInternships);

        // 5. Filter for high matches (score > 60)
        const highMatches = matchResults.filter((result) => result.matchScore > 60);

        if (highMatches.length > 0) {
          matchedStudentCount++;

          for (const match of highMatches) {
            try {
              const internship = newInternships.find(
                (i) => i._id.toString() === match.internshipId
              );

              if (!internship) continue;

              // Create in-app notification
              await Notification.create({
                userId: user._id,
                internshipId: internship._id,
                channel: 'in-app',
                title: `New Match: ${internship.title}`,
                message: `You have a ${match.matchScore}% match with "${internship.title}" at ${internship.organization}. Skills matched: ${match.matchedSkills.join(', ') || 'General match'}.`,
                sentAt: new Date(),
                deliveryStatus: 'sent',
                isRead: false,
              });

              // 6. Send email if user has email notifications enabled
              if (
                user.notificationSettings &&
                user.notificationSettings.emailEnabled &&
                user.notificationSettings.weeklyDigest
              ) {
                try {
                  const emailResult = await sendInternshipAlert(
                    user,
                    internship,
                    match.matchScore
                  );

                  // Create email notification record
                  await Notification.create({
                    userId: user._id,
                    internshipId: internship._id,
                    channel: 'email',
                    title: `Email Alert: ${internship.title}`,
                    message: `Email notification sent for "${internship.title}" at ${internship.organization} (${match.matchScore}% match).`,
                    sentAt: new Date(),
                    deliveryStatus: emailResult.success ? 'sent' : 'failed',
                    isRead: false,
                  });
                } catch (emailError) {
                  errors.push(
                    `Email failed for user ${user._id}: ${emailError.message}`
                  );
                }
              }
            } catch (matchError) {
              errors.push(
                `Match processing error for user ${user._id}: ${matchError.message}`
              );
            }
          }
        }
      } catch (profileError) {
        errors.push(
          `Profile processing error for profile ${profile._id}: ${profileError.message}`
        );
      }
    }

    // 7. Update monitoring run with success
    await MonitoringRun.findByIdAndUpdate(monitoringRun._id, {
      completedAt: new Date(),
      status: 'completed',
      newListingCount,
      matchedStudentCount,
      errors,
      duration: Date.now() - startTime,
    });

    console.log(
      `[CRON] Weekly monitoring completed. New listings: ${newListingCount}, Matched students: ${matchedStudentCount}, Errors: ${errors.length}`
    );
  } catch (error) {
    errors.push(`Fatal error: ${error.message}`);

    await MonitoringRun.findByIdAndUpdate(monitoringRun._id, {
      completedAt: new Date(),
      status: 'failed',
      newListingCount,
      matchedStudentCount,
      errors,
      duration: Date.now() - startTime,
    });

    console.error('[CRON] Weekly monitoring job failed:', error.message);
  }
};

module.exports = {
  initCronJobs,
  weeklyMonitoringJob,
};
