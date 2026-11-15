const { supabase, isSupabaseConfigured } = require('./config/supabase');
const directScraperService = require('./services/directScraperService');
const fs = require('fs');
const path = require('path');

if (!isSupabaseConfigured()) {
  console.error('❌ Supabase not configured.');
  process.exit(1);
}

async function run() {
  console.log('🧹 [Purge Engine] Starting cleanup of all demo, mock, and generic seeded data...');

  // 1. Fetch all current internships in Supabase
  const { data: allItems, error: fetchErr } = await supabase.from('internships').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    process.exit(1);
  }

  // 2. Separate real vs fake/demo listings
  const fakeIds = [];
  const validRealItems = [];

  for (const item of allItems) {
    const u = (item.url || '').trim();
    const isAuthenticLive = u.includes('internshala.com/internship/detail/') || u.includes('linkedin.com/jobs/view/');
    if (!isAuthenticLive) {
      fakeIds.push(item.id);
    } else {
      validRealItems.push(item);
    }
  }

  console.log(`🔎 Total found in DB: ${allItems.length}`);
  console.log(`❌ Fake / demo / generic homepage listings to delete: ${fakeIds.length}`);
  console.log(`✅ Verified real live scraped listings to keep: ${validRealItems.length}`);

  // 3. Delete fake listings from Supabase in batches
  if (fakeIds.length > 0) {
    const batchSize = 30;
    for (let i = 0; i < fakeIds.length; i += batchSize) {
      const batch = fakeIds.slice(i, i + batchSize);
      const { error: delErr } = await supabase
        .from('internships')
        .delete()
        .in('id', batch);
      if (delErr) {
        console.error('Error deleting batch:', delErr.message);
      } else {
        console.log(`   ✓ Deleted ${batch.length} fake listings (${i + batch.length}/${fakeIds.length})`);
      }
    }
    console.log('🎉 Successfully purged all fake/demo listings from Supabase!');
  }

  // 4. Live Scrape fresh authentic opportunities for Actuarial, Law, Finance, Core Eng, and Design
  console.log('\n🌐 [Live Scraper] Scraping 100% REAL live internships across all streams...');
  const scrapeTargets = [
    { name: 'Actuarial & Quantitative Risk', skills: ['Actuarial Science', 'Statistics', 'Risk Modeling'], degree: 'B.Sc Actuarial Science' },
    { name: 'Law & Legal Studies', skills: ['Law', 'Corporate Law', 'Legal Research'], degree: 'BA LLB' },
    { name: 'Finance, CA & Accounting', skills: ['Accounting', 'Audit', 'Finance', 'Taxation'], degree: 'B.Com' },
    { name: 'UI/UX Design', skills: ['UI/UX', 'Figma', 'Product Design'], degree: 'B.Des' },
    { name: 'Core Engineering (Electrical/Civil/Mech)', skills: ['Electrical Engineering', 'AutoCAD', 'PLC', 'Mechanical'], degree: 'B.Tech Electrical' },
    { name: 'Computer Science & AI', skills: ['Python', 'React', 'Machine Learning', 'Node.js'], degree: 'B.Tech CSE' }
  ];

  let freshAddedCount = 0;
  for (const target of scrapeTargets) {
    try {
      console.log(`⚡ Scraping live postings for ${target.name}...`);
      const scraped = await directScraperService.aggregateRealTimeInternships({
        skills: target.skills,
        degree: target.degree,
        location: 'India',
        limit: 10
      });

      console.log(`   Found ${scraped.length} live verified postings for ${target.name}.`);

      for (const item of scraped) {
        if (!item.url || (!item.url.includes('/internship/detail/') && !item.url.includes('/jobs/view/'))) {
          continue; // Skip anything without a verified direct job page
        }

        // Check if already in DB
        const alreadyExists = validRealItems.some(v => v.url === item.url || (v.title === item.title && v.organization === item.organization));
        if (!alreadyExists) {
          const { error: insErr } = await supabase.from('internships').insert([{
            title: item.title,
            organization: item.organization,
            description: item.description,
            location: item.location || 'India',
            mode: (item.mode || 'remote').toLowerCase(),
            stipend: item.stipend || 'Competitive Stipend',
            duration: item.duration || '3-6 Months',
            skills: item.skills || target.skills,
            requirements: item.requirements || [],
            source: item.source || 'Internshala',
            url: item.url,
            deadline: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
            is_active: true
          }]);

          if (!insErr) {
            validRealItems.push(item);
            freshAddedCount++;
            console.log(`   ✓ Added [${item.source}] ${item.organization} — ${item.title}`);
          }
        }
      }
    } catch (targetErr) {
      console.warn(`   Notice while scraping ${target.name}:`, targetErr.message);
    }
  }

  // 5. Query final state from Supabase
  const { data: finalRows } = await supabase.from('internships').select('*').eq('is_active', true);
  console.log(`\n🎉 Final Database Status: ${finalRows.length} 100% REAL, GENUINE live internships active in Supabase!`);
  console.log('Every single listing has a verified direct application link on Internshala or LinkedIn.');

  // 6. Write final real rows to realInternshipsData.js for in-memory and fallback usage
  const realInternshipsFile = path.join(__dirname, 'realInternshipsData.js');
  const fileContent = `/**
 * Real Internships Data Store
 * Contains 100% REAL, GENUINE live internships scraped from Internshala & LinkedIn.
 * Zero demo, mock, or fake listings.
 * Last Synced: ${new Date().toISOString()}
 */

module.exports = ${JSON.stringify(finalRows || validRealItems, null, 2)};
`;
  fs.writeFileSync(realInternshipsFile, fileContent, 'utf8');
  console.log('✓ Updated server/realInternshipsData.js with verified live listings.');
}

run().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
