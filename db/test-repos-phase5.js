// db/test-repos-phase5.js — Phase 5 repositories + service logic against PostgreSQL
// Ported data tests use read-only exact counts on clean ported data.
// CRUD tests create fresh rows and clean up at the end.
const SiteContentRepository = require('../backend/repositories/pg/SiteContentRepository');
const ContentBlockRepository = require('../backend/repositories/pg/ContentBlockRepository');
const { HelpCategoryRepository, HelpArticleRepository } = require('../backend/repositories/pg/HelpCenterRepository');
const MediaRepository = require('../backend/repositories/pg/MediaRepository');
const MenuRepository = require('../backend/repositories/pg/MenuRepository');
const PageRepository = require('../backend/repositories/pg/PageRepository');
const CourseRepository = require('../backend/repositories/pg/CourseRepository');
const CourseProgressRepository = require('../backend/repositories/pg/CourseProgressRepository');
const CertificateRepository = require('../backend/repositories/pg/CertificateRepository');
const SupportTicketRepository = require('../backend/repositories/pg/SupportTicketRepository');
const SiteStatusRepository = require('../backend/repositories/pg/SiteStatusRepository');
const NotificationRepository = require('../backend/repositories/pg/NotificationRepository');
const NewsletterRepository = require('../backend/repositories/pg/NewsletterRepository');
const EmailTemplateRepository = require('../backend/repositories/pg/EmailTemplateRepository');
const EmailPreferenceRepository = require('../backend/repositories/pg/EmailPreferenceRepository');
const ActivityLogRepository = require('../backend/repositories/pg/ActivityLogRepository');
const NewsRepository = require('../backend/repositories/pg/NewsRepository');
const SystemConfigRepository = require('../backend/repositories/pg/SystemConfigRepository');
const UserRepository = require('../backend/repositories/pg/UserRepository');
const AnnealingService = require('../backend/services/pg/AnnealingService');
const ProgressService = require('../backend/services/pg/ProgressService');
const { pool } = require('./index');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const stamp = Date.now();
let testUser, testAdmin;

(async () => {
  console.log('=== SETUP ===');
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash('x', salt);
  testUser = await UserRepository.create({ email: `p5_user_${stamp}@test.local`, username: 'p5_user', password: pw, role: 'user', isActive: true });
  testAdmin = await UserRepository.create({ email: `p5_admin_${stamp}@test.local`, username: 'p5_admin', password: pw, role: 'admin', isActive: true });
  check('test users created', !!testUser.id && !!testAdmin.id);

  // ─── SiteContent ─────────────────────────────────────────────────────
  console.log('=== SITE CONTENT ===');
  const landing = await SiteContentRepository.findByPage('landing');
  check('findByPage(landing): 14 sections (ported)', landing.length === 14);
  check('landing[0] has type + data', !!landing[0].type && !!landing[0].data);
  const sc = await SiteContentRepository.create({ slug: 'test-sc-slug', page: 'test', section: 'test', type: 'text', data: { text: 'hello' } });
  check('SiteContent create with data', !!sc.id && sc.data.text === 'hello');
  await SiteContentRepository.delete(sc.id);

  // CRUD round-trip
  const created = await SiteContentRepository.create({ slug: `sc-test-${stamp}`, page: 'test', section: 'test', type: 'hero', data: { title: 'Hi' } });
  check('SiteContent create', !!created.id && created.page === 'test');
  const found = await SiteContentRepository.findBySlug(`sc-test-${stamp}`);
  check('findBySlug after create', found && found.data.title === 'Hi');
  const updated = await SiteContentRepository.update(created.id, { data: { title: 'Hello' } });
  check('SiteContent update', updated.data.title === 'Hello');
  const upserted = await SiteContentRepository.upsertBySlug(`sc-test-${stamp}`, { data: { title: 'Upserted' }, page: 'test', section: 'test', type: 'hero' });
  check('upsertBySlug update path', upserted.data.title === 'Upserted');
  const newSlug = await SiteContentRepository.upsertBySlug(`sc-new-${stamp}`, { data: { title: 'New' }, page: 'test', section: 'test', type: 'hero' });
  check('upsertBySlug create path', newSlug.data.title === 'New');
  const all = await SiteContentRepository.findAll({});
  check('site_contents total 19 + 2 test', all.length === 21);
  await SiteContentRepository.delete(created.id);
  await SiteContentRepository.delete(newSlug.id);

  // ─── ContentBlock ────────────────────────────────────────────────────
  console.log('=== CONTENT BLOCKS ===');
  const blocks = await ContentBlockRepository.findAll({});
  check('content_blocks: 9 (ported)', blocks.length === 9);
  const cb = await ContentBlockRepository.findBySlug(blocks[0].slug);
  check('findBySlug', !!cb && cb.id === blocks[0].id);

  // ─── HelpCenter ──────────────────────────────────────────────────────
  console.log('=== HELP CENTER ===');
  const cats = await HelpCategoryRepository.findAll({});
  check('help_categories: 0 (ported empty)', cats.length === 0);
  const newCat = await HelpCategoryRepository.create({ name: 'Trading', slug: 'trading', icon: 'TrendingUp', order: 1 });
  check('category create', !!newCat.id && newCat.name === 'Trading');
  const count = await HelpCategoryRepository.countArticles(newCat.id);
  check('countArticles = 0', count === 0);
  const art = await HelpArticleRepository.create({ title: 'How to trade crypto', slug: `trade-crypto-${stamp}`, content: 'Learn to trade Bitcoin and other crypto.', categoryId: newCat.id, status: 'published' });
  check('article create', !!art.id && art.slug === `trade-crypto-${stamp}`);
  const count2 = await HelpCategoryRepository.countArticles(newCat.id);
  check('countArticles after article = 1', count2 === 1);
  const bySlug = await HelpArticleRepository.findBySlug(`trade-crypto-${stamp}`);
  check('findBySlug populates category', bySlug && bySlug.category && bySlug.category.name === 'Trading');
  const search = await HelpArticleRepository.search('Bitcoin');
  check('tsvector search: Bitcoin', search.length === 1 && search[0].id === art.id);
  const search2 = await HelpArticleRepository.search('nonexistent');
  check('tsvector search: empty result', search2.length === 0);
  await HelpArticleRepository.delete(art.id);
  await HelpCategoryRepository.delete(newCat.id);

  // ─── Media ───────────────────────────────────────────────────────────
  console.log('=== MEDIA ===');
  const mediaList = await MediaRepository.findAll({});
  check('media: 0 (ported empty)', mediaList.length === 0);
  const m = await MediaRepository.create({ filename: 'test.jpg', originalname: 'test.jpg', mimetype: 'image/jpeg', size: 1234, path: '/uploads/test.jpg', url: '/uploads/test.jpg', uploadedById: testUser.id });
  check('media create', !!m.id && m.filename === 'test.jpg');
  await MediaRepository.delete(m.id);

  // ─── Menus ───────────────────────────────────────────────────────────
  console.log('=== MENUS ===');
  const menus = await MenuRepository.findAll({});
  check('menus: 0 (ported empty)', menus.length === 0);
  const menu = await MenuRepository.create({ name: 'Top Nav', location: 'top', items: [{ label: 'Home', href: '/' }], isActive: true });
  check('menu create', !!menu.id && menu.location === 'top');
  const foundMenu = await MenuRepository.findByLocation('top');
  check('findByLocation', foundMenu && foundMenu.items.length === 1);
  const upsertedMenu = await MenuRepository.upsertByLocation('top', { name: 'Top Nav Updated', items: [{ label: 'Home', href: '/' }, { label: 'Trade', href: '/trade' }] });
  check('upsertMenu update path', upsertedMenu.items.length === 2);
  await MenuRepository.delete(menu.id);

  // ─── Pages ───────────────────────────────────────────────────────────
  console.log('=== PAGES ===');
  const pages = await PageRepository.findAll({});
  check('pages: 0 (ported empty)', pages.length === 0);
  const page = await PageRepository.create({ title: 'Landing', slug: 'landing', layout: 'default', published: true });
  check('page create', !!page.id && page.slug === 'landing');
  const pageBySlug = await PageRepository.findBySlug('landing');
  check('findBySlug', !!pageBySlug && pageBySlug.id === page.id);
  await PageRepository.delete(page.id);

  // ─── Courses (with content tree) ─────────────────────────────────────
  console.log('=== COURSES ===');
  const course = await CourseRepository.getPublishedWithContent('crypto-trading-101');
  check('ported crypto course has content tree', !!course && course.title === 'Crypto Trading 101');
  check('1 module, 2 lessons', course.modules.length === 1 && course.modules[0].lessons.length === 2);
  check('module lessons ordered', course.modules[0].lessons[0].order <= course.modules[0].lessons[1].order);
  const lessonCount = await CourseRepository.countLessons(course.id);
  check('countLessons = 2', lessonCount === 2);
  const allCourses = await CourseRepository.findPublished({});
  check('findPublished: 2', allCourses.length === 2);
  // CRUD
  const newCourse = await CourseRepository.create({ title: `Test Course ${stamp}`, slug: `test-course-${stamp}`, description: 'Unit test', isPublished: false });
  check('course create', !!newCourse.id);
  const pub = await CourseRepository.update(newCourse.id, { isPublished: true });
  check('publish', pub.isPublished === true);
  await CourseRepository.delete(newCourse.id);

  // ─── CourseProgress ──────────────────────────────────────────────────
  console.log('=== COURSE PROGRESS ===');
  const prog = await CourseProgressRepository.create({ userId: testUser.id, courseId: course.id, progressPercent: 50, completedLessons: [] });
  check('progress create', !!prog.id);
  const foundProg = await CourseProgressRepository.findByUserAndCourse(testUser.id, course.id);
  check('findByUserAndCourse', foundProg && foundProg.progressPercent === 50);
  const userProgs = await CourseProgressRepository.findByUser(testUser.id);
  check('findByUser (populate course)', userProgs.length >= 1 && userProgs[0].course);
  // ProgressService.completeLesson
  const updatedProg = await ProgressService.completeLesson(testUser.id, course.id, course.modules[0].lessons[0].id);
  check('completeLesson', updatedProg.completedLessons.length === 1 && updatedProg.progressPercent === 50);
  await CourseProgressRepository.delete(prog.id);

  // ─── Certificates ────────────────────────────────────────────────────
  console.log('=== CERTIFICATES ===');
  const cert = await CertificateRepository.create({ recipientId: testUser.id, courseId: course.id, courseName: course.title, title: 'Mastery', code: `CERT-${stamp}`, issueDate: new Date(), status: 'active' });
  check('certificate create', !!cert.id);
  const byCode = await CertificateRepository.findByCode(`CERT-${stamp}`);
  check('findByCode populates recipient', byCode && byCode.recipient && byCode.recipient.email === `p5_user_${stamp}@test.local`);
  const byRecipient = await CertificateRepository.findByRecipient(testUser.id);
  check('findByRecipient', byRecipient.length === 1);
  const byRC = await CertificateRepository.findByRecipientAndCourse(testUser.id, course.id);
  check('findByRecipientAndCourse', !!byRC);
  const active = await CertificateRepository.findActiveByCode(`CERT-${stamp}`);
  check('findActiveByCode', !!active);
  await CertificateRepository.delete(cert.id);

  // ─── Support Tickets ─────────────────────────────────────────────────
  console.log('=== SUPPORT TICKETS ===');
  const ticket = await SupportTicketRepository.create({
    userId: testUser.id, subject: 'Test', category: 'general', priority: 'normal', status: 'open',
    ticketNumber: `TKT-${stamp}`, messages: [{ sender: testUser.id, senderType: 'user', message: 'Help', createdAt: new Date() }],
  });
  check('ticket create', !!ticket.id && ticket.messages.length === 1);
  const myTickets = await SupportTicketRepository.findByUser(testUser.id);
  check('findByUser', myTickets.length >= 1);
  const updatedTicket = await SupportTicketRepository.addMessage(ticket.id, { sender: testUser.id, senderType: 'user', message: 'Update', createdAt: new Date() });
  check('addMessage (transactional)', updatedTicket && updatedTicket.messages.length === 2);
  const note = await SupportTicketRepository.addInternalNote(ticket.id, { agent: testAdmin.id, note: 'Internal note', createdAt: new Date() });
  check('addInternalNote', note && note.internalNotes.length === 1);
  const resolved = await SupportTicketRepository.updateStatus(ticket.id, 'resolved');
  check('updateStatus resolvedAt', resolved.status === 'resolved' && !!resolved.resolvedAt);
  const closed = await SupportTicketRepository.updateStatus(ticket.id, 'closed');
  check('updateStatus closedAt', closed.status === 'closed' && !!closed.closedAt);
  await SupportTicketRepository.delete(ticket.id);

  // ─── SiteStatus ──────────────────────────────────────────────────────
  console.log('=== SITE STATUS ===');
  const status = await SiteStatusRepository.getOrCreate();
  check('getOrCreate', !!status.id && status.version);
  check('health has status', !!status.health && !!status.health.status);
  // AnnealingService (full pass)
  const afterAnnealing = await AnnealingService.runFullAnnealing();
  check('annealing: health is set', !!afterAnnealing.health && ['healthy', 'degraded', 'critical'].includes(afterAnnealing.health.status));
  check('annealing: reports capped at 50', afterAnnealing.annealingReports.length <= 50);

  // ─── Notifications ───────────────────────────────────────────────────
  console.log('=== NOTIFICATIONS ===');
  const notif1 = await NotificationRepository.create({ userId: testUser.id, type: 'system', title: 'Test', message: 'Hello', expiresAt: new Date(Date.now() + 3600000) });
  const notif2 = await NotificationRepository.create({ userId: testUser.id, type: 'system', title: 'Expired', message: 'Gone', expiresAt: new Date('2020-01-01') });
  check('notifications created', !!notif1.id && !!notif2.id);
  const userNotifs = await NotificationRepository.findByUser(testUser.id);
  check('findByUser', userNotifs.length >= 2);
  const readNotif = await NotificationRepository.markRead(notif1.id);
  check('markRead', readNotif.read === true && !!readNotif.readAt);
  const purged = await NotificationRepository.deleteExpired();
  check('deleteExpired purges 1', purged === 1);
  const remaining = await NotificationRepository.findByUser(testUser.id);
  check('1 remaining', remaining.length === 1);
  await NotificationRepository.delete(remaining[0].id);

  // ─── Newsletter ──────────────────────────────────────────────────────
  console.log('=== NEWSLETTER ===');
  const nl = await NewsletterRepository.create({ email: `nl_${stamp}@test.local`, status: 'active', subscribedAt: new Date() });
  check('newsletter subscribe', !!nl.id && nl.status === 'active');
  const foundNl = await NewsletterRepository.findByEmail(`nl_${stamp}@test.local`);
  check('findByEmail', !!foundNl);
  const unsub = await NewsletterRepository.update(nl.id, { status: 'unsubscribed', unsubscribedAt: new Date() });
  check('unsubscribe', unsub.status === 'unsubscribed');
  await NewsletterRepository.delete(nl.id);

  // ─── EmailTemplate ───────────────────────────────────────────────────
  console.log('=== EMAIL TEMPLATES ===');
  const templates = await EmailTemplateRepository.findAll({});
  check('email_templates: 20 (ported)', templates.length === 20);
  const authWelcome = await EmailTemplateRepository.findByKey('auth.welcome');
  check('findByKey(auth.welcome)', !!authWelcome && authWelcome.category === 'auth');

  // ─── EmailPreference ─────────────────────────────────────────────────
  console.log('=== EMAIL PREFERENCES ===');
  const prefs = await EmailPreferenceRepository.getSingleton();
  check('getSingleton', !!prefs.id);

  // ─── ActivityLogs ────────────────────────────────────────────────────
  console.log('=== ACTIVITY LOGS ===');
  const logs = await ActivityLogRepository.findAll({});
  check('activity_logs: 7 (ported)', logs.length === 7);
  const log = await ActivityLogRepository.create({ userId: testUser.id, action: 'test.action', category: 'admin', description: 'Test log' });
  check('activity log create', !!log.id);
  const userLogs = await ActivityLogRepository.findByUser(testUser.id);
  check('findByUser', userLogs.length >= 1);
  await ActivityLogRepository.delete(log.id);

  // ─── News ────────────────────────────────────────────────────────────
  console.log('=== NEWS ===');
  const news = await NewsRepository.findPublished({});
  check('findPublished: 2 (ported)', news.length === 2);
  check('news[0] populated author', !!news[0].author || !news[0].authorId); // author may be phantom (null)
  const newsBySlug = await NewsRepository.findBySlug('federal-reserve-meeting-impact-398125');
  check('findBySlug', !!newsBySlug && newsBySlug.title.includes('Federal Reserve'));
  const newArt = await NewsRepository.create({ title: `Test News ${stamp}`, slug: `test-news-${stamp}`, content: 'Breaking', isPublished: true, publishedAt: new Date() });
  check('news create', !!newArt.id);
  await NewsRepository.delete(newArt.id);

  // ─── SystemConfig ────────────────────────────────────────────────────
  console.log('=== SYSTEM CONFIG ===');
  const geo = await SystemConfigRepository.findByKey('geo_restrictions');
  check('geo_restrictions: fixed shape', !!geo && geo.value && geo.value.global && geo.value.global.enabled === true);

  // ─── CLEANUP ─────────────────────────────────────────────────────────
  console.log('=== CLEANUP ===');
  await UserRepository.delete(testAdmin.id);
  await UserRepository.delete(testUser.id);
  console.log('Test users deleted');

  console.log(`\n=== PHASE 5 REPO SUITE: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} ===`);
  process.exit(failures);
})().catch((e) => { console.error('SUITE ERROR:', e); process.exit(1); });