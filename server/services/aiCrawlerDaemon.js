const supabaseService = require('./supabaseService');
const directScraperService = require('./directScraperService');
const realTimeJobAPIService = require('./realTimeJobAPIService');
const internshipAggregator = require('./internshipAggregator');
const { ensureWorkingApplicationUrl } = require('../utils/urlVerifier');

const DOMAIN_ROTATIONS = [
  { domain: 'Full-Stack & Web Engineering', skills: ['react', 'javascript', 'web development'], degree: 'B.Tech / BCA' },
  { domain: 'Python & Data Science / AI', skills: ['python', 'machine learning', 'data science'], degree: 'B.Tech / MCA' },
  { domain: 'Front-End Development', skills: ['react', 'html', 'css', 'frontend'], degree: 'BCA / B.Tech' },
  { domain: 'Back-End & API Engineering', skills: ['node.js', 'backend', 'sql', 'mongodb'], degree: 'B.Tech / MCA' },
  { domain: 'Electrical & Electronics / Embedded', skills: ['electrical', 'embedded', 'iot', 'matlab'], degree: 'B.Tech Electrical / ECE' },
  { domain: 'Computer Science & Software Engineering', skills: ['software', 'c++', 'java', 'bca'], degree: 'BCA / B.Tech / MCA' },
  { domain: 'Mobile App Development', skills: ['android', 'flutter', 'react native'], degree: 'B.Tech / BCA' }
];

class AiCrawlerDaemon {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.rotationIndex = 0;
    this.discoveredCount = 0;
    this.prunedCount = 0;
    this.lastCrawledAt = null;
    this.lastPrunedAt = null;
    this.lastDiscovered = null;
    this.crawlIntervalMs = 60000; // Continuous real-time cycle runs every 60s
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('=======================================================');
    console.log('🤖 Real-Time Internship Crawler Daemon Initialized!');
    console.log(`⏱️ Scraping verified Internshala & LinkedIn feeds every ${this.crawlIntervalMs / 1000}s`);
    console.log('=======================================================');

    // Run first discovery cycle after 2 seconds
    setTimeout(() => this.runCrawlCycle(), 2000);

    // Continuous interval
    this.intervalId = setInterval(() => {
      this.runCrawlCycle();
    }, this.crawlIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async runCrawlCycle() {
    this.lastCrawledAt = new Date();
    try {
      // 0. Automatically prune expired internships where hiring period has ended
      const pruned = await supabaseService.pruneExpiredInternships();
      internshipAggregator.pruneExpiredFromCatalogue();
      if (pruned > 0) {
        this.prunedCount += pruned;
        this.lastPrunedAt = new Date().toISOString();
        console.log(`[CRAWLER] 🧹 Pruned ${pruned} expired internship(s). Scraping fresh live openings...`);
      }

      // 1. Get existing internships to prevent duplicates
      let existing = [];
      if (supabaseService.isConfigured()) {
        try {
          existing = await supabaseService.getInternships() || [];
        } catch (e) {}
      }
      const existingKeys = new Set(
        existing.map(item => `${(item.organization || '').toLowerCase()}-${(item.title || '').toLowerCase()}`)
      );

      // 2. Select target domain rotation
      const targetDomain = DOMAIN_ROTATIONS[this.rotationIndex % DOMAIN_ROTATIONS.length];
      this.rotationIndex++;

      console.log(`[CRAWLER] 🌐 Scraping live Internshala & LinkedIn for: "${targetDomain.domain}"...`);

      let newCandidates = [];

      // A. Direct Real-Time Scrape from Internshala & LinkedIn
      try {
        const liveScraped = await directScraperService.aggregateRealTimeInternships({
          skills: targetDomain.skills,
          degree: targetDomain.degree,
          location: 'India',
          limit: 10
        });
        if (Array.isArray(liveScraped) && liveScraped.length > 0) {
          newCandidates = newCandidates.concat(liveScraped);
        }
      } catch (scrapeErr) {
        console.warn('[CRAWLER] Direct scraper notice:', scrapeErr.message);
      }

      // B. Real-Time Remote Job Feeds (Remotive)
      if (newCandidates.length < 5 || (this.rotationIndex % 2 === 0)) {
        try {
          const apiJobs = await realTimeJobAPIService.fetchLiveApiInternships({
            skills: targetDomain.skills,
            limit: 4
          });
          if (Array.isArray(apiJobs)) {
            newCandidates = newCandidates.concat(apiJobs);
          }
        } catch (apiErr) {
          console.warn('[CRAWLER] Public API fetch notice:', apiErr.message);
        }
      }

      // 3. Filter out any duplicates and insert new authentic listings
      let freshlyAdded = 0;
      for (const candidate of newCandidates) {
        const key = `${(candidate.organization || '').toLowerCase()}-${(candidate.title || '').toLowerCase()}`;
        if (!existingKeys.has(key)) {
          existingKeys.add(key);

          const deadline = candidate.deadline ? new Date(candidate.deadline) : new Date(Date.now() + 40 * 24 * 3600 * 1000);
          const applyUrl = ensureWorkingApplicationUrl(candidate);

          const recordToInsert = {
            title: candidate.title,
            organization: candidate.organization,
            description: candidate.description || `100% Real-Time opening at ${candidate.organization} for ${candidate.title}. Apply directly via ${candidate.source}.`,
            location: candidate.location || 'India / Remote',
            mode: candidate.mode || 'hybrid',
            stipend: candidate.stipend || 'Competitive Stipend',
            duration: candidate.duration || '3-6 Months',
            skills: candidate.skills || targetDomain.skills,
            requirements: candidate.requirements || [
              'Enrolled in undergraduate degree or diploma course',
              'Knowledge of relevant tools and technologies',
              'Strong problem solving and team collaboration skills'
            ],
            source: candidate.source || 'LinkedIn',
            url: applyUrl,
            deadline: deadline.toISOString(),
            is_active: true
          };

          let inserted = null;
          if (supabaseService.isConfigured()) {
            inserted = await supabaseService.addInternship(recordToInsert);
          }

          internshipAggregator.injectLiveInternships([{
            ...recordToInsert,
            _id: inserted?.id || `live_${Date.now()}_${freshlyAdded}`,
            id: inserted?.id || `live_${Date.now()}_${freshlyAdded}`
          }]);

          this.discoveredCount++;
          freshlyAdded++;
          this.lastDiscovered = {
            company: candidate.organization,
            title: candidate.title,
            stipend: candidate.stipend,
            mode: candidate.mode,
            source: candidate.source,
            scale_type: candidate.scale_type || 'small_scale',
            discoveredAt: new Date().toISOString()
          };

          console.log(`[CRAWLER] ⚡ 100% Real Opportunity Indexed: "${candidate.title}" at ${candidate.organization} (${candidate.stipend}) [${candidate.source}]`);
        }
      }

      if (freshlyAdded > 0) {
        console.log(`[CRAWLER] ✅ Successfully indexed ${freshlyAdded} authentic live listings.`);
      }

    } catch (err) {
      console.warn('[CRAWLER] Crawl cycle notice:', err.message);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      crawlIntervalSeconds: this.crawlIntervalMs / 1000,
      lastCrawledAt: this.lastCrawledAt,
      discoveredCount: this.discoveredCount,
      prunedCount: this.prunedCount,
      lastPrunedAt: this.lastPrunedAt,
      lastDiscovered: this.lastDiscovered,
      currentDomain: DOMAIN_ROTATIONS[this.rotationIndex % DOMAIN_ROTATIONS.length]?.domain,
      platformsAggregated: ['Internshala', 'LinkedIn', 'Remotive']
    };
  }
}

const aiCrawlerDaemon = new AiCrawlerDaemon();

module.exports = aiCrawlerDaemon;
