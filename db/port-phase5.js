// db/port-phase5.js — port Phase 5 (CMS/Education/Support/System/News) data: Mongo → PostgreSQL
// Orphan principle: skip + log user-owned docs whose users exist nowhere;
// content docs with nullable user refs (instructor/author) port with the ref NULLed + logged.
// Skipped: 1 courseprogress, 1 supportticket (user-owned, phantom users).
const { MongoClient } = require('mongodb');
const { pool } = require('./index');
const fs = require('fs');
const path = require('path');

const oidToUuid = (oid) => `00000000-${oid.slice(0, 4)}-${oid.slice(4, 8)}-${oid.slice(8, 12)}-${oid.slice(12)}`;
const asJson = (v) => (v === undefined || v === null ? null : JSON.stringify(v));
const asNum = (v) => (v === undefined || v === null ? null : Number(v));
const stripIds = (arr) => (Array.isArray(arr) ? arr.map((x) => { const { _id, __v, ...rest } = x || {}; return rest; }) : arr);
// Mongo email categories → PG email_category enum
const EMAIL_CAT_MAP = {
  auth: 'auth', kyc: 'kyc', support: 'support', system: 'system',
  finance: 'transactional', subscription: 'transactional', trading: 'transactional',
  marketing: 'marketing', security: 'security',
};
const mapEmailCat = (c) => EMAIL_CAT_MAP[c] || 'system';

const orphans = [];
const logOrphan = (collection, docId, reason) => {
  orphans.push({ collection, docId, reason });
};

(async () => {
  const c = new MongoClient('mongodb://127.0.0.1:27017');
  await c.connect();
  const db = c.db('mmitps');

  const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
  const userIds = new Set(users.map((u) => String(u._id)));
  const userUuid = (id) => (id && userIds.has(String(id)) ? oidToUuid(String(id)) : null);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`TRUNCATE TABLE
      activity_logs, email_preferences, email_templates, newsletters, notifications,
      site_statuses, system_configs, support_tickets, certificates, course_progresses,
      course_lessons, course_modules, courses, pages, menus, media,
      help_articles, help_categories, content_blocks, site_contents
      RESTART IDENTITY CASCADE`);

    // ─── site_contents (19, no user refs) ───────────────────────────────
    const sc = await db.collection('sitecontents').find({}).toArray();
    for (const d of sc) {
      await client.query(
        `INSERT INTO site_contents (id, slug, page, section, type, data, sort_order, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [oidToUuid(d._id.toString()), d.slug, d.page, d.section, d.type || 'text',
         asJson(d.data), asNum(d.sortOrder) ?? 0, d.isActive !== false,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── content_blocks (9, no author refs) ─────────────────────────────
    const cb = await db.collection('contentblocks').find({}).toArray();
    for (const d of cb) {
      await client.query(
        `INSERT INTO content_blocks (id, slug, type, title, content, data, is_active, author_id, tags, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [oidToUuid(d._id.toString()), d.slug, d.type || 'article', d.title, d.content || '',
         asJson(d.data), d.isActive !== false, null,
         d.tags && d.tags.length ? `{${d.tags.map((t) => `"${String(t).replace(/"/g, '""')}"`).join(',')}}` : '{}',
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── help_categories / help_articles / media / menus / pages: 0 ─────

    // ─── courses (2, instructor phantom → NULL + log) + modules/lessons ─
    const courses = await db.collection('courses').find({}).toArray();
    let courseCount = 0, moduleCount = 0, lessonCount = 0;
    for (const d of courses) {
      const instructorUuid = userUuid(d.instructor);
      if (d.instructor && !instructorUuid) {
        logOrphan('courses', d._id.toString(), `phantom instructor ref instructor=${d.instructor.toString()} → NULLed`);
      }
      await client.query(
        `INSERT INTO courses (id, title, slug, description, thumbnail, instructor_id, level, category,
          price, currency, is_published, allowed_plans, tags, total_duration, enrolled_count, rating, rating_count, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [oidToUuid(d._id.toString()), d.title, d.slug, d.description, d.thumbnail || null,
         instructorUuid, d.level || 'beginner', d.category || 'trading',
         asNum(d.price) ?? 0, d.currency || 'USD', d.isPublished === true,
         d.allowedPlans && d.allowedPlans.length ? `{${d.allowedPlans.map((p) => oidToUuid(String(p))).join(',')}}` : '{}',
         d.tags && d.tags.length ? `{${d.tags.map((t) => `"${String(t).replace(/"/g, '""')}"`).join(',')}}` : '{}',
         asNum(d.totalDuration) ?? 0, asNum(d.enrolledCount) ?? 0,
         asNum(d.rating) ?? 0, asNum(d.ratingCount) ?? 0,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
      courseCount++;

      for (const m of (d.modules || [])) {
        await client.query(
          `INSERT INTO course_modules (id, course_id, title, description, "order", created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [oidToUuid(m._id.toString()), oidToUuid(d._id.toString()), m.title, m.description || null,
           asNum(m.order) ?? 0, d.createdAt || new Date(), d.updatedAt || new Date()]
        );
        moduleCount++;
        for (const l of (m.lessons || [])) {
          await client.query(
            `INSERT INTO course_lessons (id, module_id, title, content, video_url, pdf_url, duration, is_free, "order", created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [oidToUuid(l._id.toString()), oidToUuid(m._id.toString()), l.title, l.content || null,
             l.videoUrl || null, l.pdfUrl || null, asNum(l.duration), l.isFree === true,
             asNum(l.order) ?? 0, d.createdAt || new Date(), d.updatedAt || new Date()]
          );
          lessonCount++;
        }
      }
    }

    // ─── course_progresses (1, phantom user → skip) ─────────────────────
    const cps = await db.collection('courseprogresses').find({}).toArray();
    for (const d of cps) {
      if (!userIds.has(String(d.user))) {
        logOrphan('courseprogresses', d._id.toString(), `phantom user ref user=${d.user.toString()}`);
      }
    }

    // ─── support_tickets (1, phantom user → skip) ───────────────────────
    const tickets = await db.collection('supporttickets').find({}).toArray();
    for (const d of tickets) {
      if (!userIds.has(String(d.user))) {
        logOrphan('supporttickets', d._id.toString(), `phantom user ref user=${d.user.toString()}`);
      }
    }

    // ─── system_configs (9; lastModifiedBy phantom → NULL + log) ────────
    const scfg = await db.collection('systemconfigs').find({}).toArray();
    for (const d of scfg) {
      const modUuid = userUuid(d.lastModifiedBy);
      if (d.lastModifiedBy && !modUuid) {
        logOrphan('systemconfigs', d._id.toString(), `phantom lastModifiedBy ref → NULLed`);
      }
      await client.query(
        `INSERT INTO system_configs (id, key, value, category, description, is_public, last_modified_by_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [oidToUuid(d._id.toString()), d.key, asJson(d.value), d.category || 'general',
         d.description || null, d.isPublic === true, modUuid,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── site_statuses (1) ──────────────────────────────────────────────
    const ss = await db.collection('sitestatuses').find({}).toArray();
    for (const d of ss) {
      await client.query(
        `INSERT INTO site_statuses (id, is_maintenance_mode, maintenance_message, version, last_build, health, annealing_reports, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [oidToUuid(d._id.toString()), d.isMaintenanceMode === true,
         d.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back shortly.',
         d.version || '2.0.0', d.lastBuild ? new Date(d.lastBuild) : null,
         asJson(d.health), asJson(stripIds(d.annealingReports)),
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── newsletters (1) ────────────────────────────────────────────────
    const nl = await db.collection('newsletters').find({}).toArray();
    for (const d of nl) {
      await client.query(
        `INSERT INTO newsletters (id, email, status, subscribed_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [oidToUuid(d._id.toString()), d.email, d.status || 'active',
         d.subscribedAt ? new Date(d.subscribedAt) : new Date(),
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── email_templates (20; lastModifiedBy nullable) ──────────────────
    const et = await db.collection('emailtemplates').find({}).toArray();
    for (const d of et) {
      const modUuid = userUuid(d.lastModifiedBy);
      if (d.lastModifiedBy && !modUuid) {
        logOrphan('emailtemplates', d._id.toString(), `phantom lastModifiedBy ref → NULLed`);
      }
      await client.query(
        `INSERT INTO email_templates (id, key, name, category, description, subject, html_body, variables, is_active, last_modified_by_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [oidToUuid(d._id.toString()), d.key, d.name, mapEmailCat(d.category),
         d.description || null, d.subject, d.htmlBody,
         asJson(d.variables), d.isActive !== false, modUuid,
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    // ─── activity_logs (7, phantom users → user_id NULL + log) ──────────
    const al = await db.collection('activitylogs').find({}).toArray();
    let alCount = 0;
    for (const d of al) {
      const userU = userUuid(d.user);
      if (d.user && !userU) {
        logOrphan('activitylogs', d._id.toString(), `phantom user ref user=${d.user.toString()} → NULLed`);
      }
      await client.query(
        `INSERT INTO activity_logs (id, user_id, action, category, description, details, status, error_message, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [oidToUuid(d._id.toString()), userU, d.action, d.category || 'system',
         d.description || null, asJson(d.details), d.status || 'success',
         d.errorMessage || null, d.createdAt || new Date(), d.updatedAt || new Date()]
      );
      alCount++;
    }

    // ─── news_articles (2; 1 phantom author → NULL + log) ───────────────
    const na = await db.collection('newsarticles').find({}).toArray();
    for (const d of na) {
      const authorU = userUuid(d.author);
      if (d.author && !authorU) {
        logOrphan('newsarticles', d._id.toString(), `phantom author ref author=${d.author.toString()} → NULLed`);
      }
      await client.query(
        `INSERT INTO news_articles (id, title, slug, content, summary, thumbnail, category, source, author_id, is_published, published_at, tags, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [oidToUuid(d._id.toString()), d.title, d.slug || null, d.content, d.summary || null,
         d.thumbnail || null, d.category || 'general', asJson(d.source), authorU,
         d.isPublished === true, d.publishedAt ? new Date(d.publishedAt) : null,
         d.tags && d.tags.length ? `{${d.tags.map((t) => `"${String(t).replace(/"/g, '""')}"`).join(',')}}` : '{}',
         d.createdAt || new Date(), d.updatedAt || new Date()]
      );
    }

    await client.query('COMMIT');
    console.log(`Ported: site_contents ${sc.length}, content_blocks ${cb.length}, courses ${courseCount} (${moduleCount} modules, ${lessonCount} lessons), system_configs ${scfg.length}, site_statuses ${ss.length}, newsletters ${nl.length}, email_templates ${et.length}, activity_logs ${alCount}, news_articles ${na.length}`);
    console.log(`Skipped: course_progresses ${cps.length}, support_tickets ${tickets.length} (phantom users)`);
    console.log(`Orphans logged: ${orphans.length}`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  fs.writeFileSync(path.join(__dirname, 'port-log-phase5.json'), JSON.stringify({ orphans }, null, 2));
  console.log('Orphan log → db/port-log-phase5.json');

  await c.close();
  await pool.end();
})().catch((e) => { console.error('PORT FAILED:', e.message); process.exit(1); });