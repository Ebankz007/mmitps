// db/test-phase5-routes.js — integration test: Phase 5 routes on the PG stack
// Boots the real route files on a minimal express app, issues real JWTs via
// pg TokenService, exercises endpoints over HTTP. Cleans up all created rows.
const express = require('express');
const http = require('http');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('../backend/repositories/pg/UserRepository');
const TokenService = require('../backend/services/pg/TokenService');
const SiteContentRepository = require('../backend/repositories/pg/SiteContentRepository');
const ContentBlockRepository = require('../backend/repositories/pg/ContentBlockRepository');
const MenuRepository = require('../backend/repositories/pg/MenuRepository');
const PageRepository = require('../backend/repositories/pg/PageRepository');
const MediaRepository = require('../backend/repositories/pg/MediaRepository');
const CourseRepository = require('../backend/repositories/pg/CourseRepository');
const CourseProgressRepository = require('../backend/repositories/pg/CourseProgressRepository');
const CertificateRepository = require('../backend/repositories/pg/CertificateRepository');
const SupportTicketRepository = require('../backend/repositories/pg/SupportTicketRepository');
const NewsletterRepository = require('../backend/repositories/pg/NewsletterRepository');
const NewsRepository = require('../backend/repositories/pg/NewsRepository');
const NotificationRepository = require('../backend/repositories/pg/NotificationRepository');
const ActivityLogRepository = require('../backend/repositories/pg/ActivityLogRepository');
const { pool } = require('./index');

const helpCenterRoutes = require('../backend/routes/helpCenterRoutes');
const siteContentRoutes = require('../backend/routes/siteContentRoutes');
const cmsRoutes = require('../backend/routes/cmsRoutes');
const adminCMSRoutes = require('../backend/routes/adminCMSRoutes');
const educationRoutes = require('../backend/routes/educationRoutes');
const certificationRoutes = require('../backend/routes/certificationRoutes');
const supportRoutes = require('../backend/routes/supportRoutes');
const newsRoutes = require('../backend/routes/newsRoutes');
const newsletterRoutes = require('../backend/routes/newsletterRoutes');
const systemRoutes = require('../backend/routes/systemRoutes');

let failures = 0;
const check = (label, cond, extra = '') => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${label}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
};

const app = express();
app.use(express.json());
app.use('/api/v1/help-center', helpCenterRoutes);
app.use('/api/v1/site-content', siteContentRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/admin/cms', adminCMSRoutes);
app.use('/api/v1/education', educationRoutes);
app.use('/api/v1/certification', certificationRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/system', systemRoutes);
// error handler (mirrors server.js behavior)
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
});

const server = http.createServer(app);
let BASE = '';

async function api(method, p, { token, body } = {}) {
  const res = await fetch(`${BASE}${p}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch (_) {}
  return { status: res.status, json };
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  BASE = `http://127.0.0.1:${server.address().port}`;

  const salt = await bcrypt.genSalt(10);
  const pw = await bcrypt.hash('TestPass@123', salt);

  const admin = await UserRepository.create({
    email: `p5_admin_${Date.now()}@test.local`, username: 'p5_admin', password: pw, role: 'admin', isActive: true,
  });
  const user = await UserRepository.create({
    email: `p5_user_${Date.now()}@test.local`, username: 'p5_user', password: pw, role: 'user', isActive: true,
  });
  const adminToken = await TokenService.generateToken(admin.id, new Date(Date.now() + 3600 * 1000), 'access');
  const userToken = await TokenService.generateToken(user.id, new Date(Date.now() + 3600 * 1000), 'access');

  // Track created rows for cleanup
  const created = { siteContent: [], blocks: [], menus: [], pages: [], media: [], courses: [], progresses: [], certs: [], tickets: [], newsletters: [], news: [], notifications: [], logs: [] };
  const track = (arr, obj) => { if (obj && obj.id) arr.push(obj.id); };

  console.log('=== AUTH GATE ===');
  let r = await api('GET', '/api/v1/education/courses');
  check('public courses list 200', r.status === 200);

  console.log('=== HELP CENTER (public) ===');
  r = await api('GET', '/api/v1/help-center/categories');
  check('categories 200 + array', r.status === 200 && Array.isArray(r.json.data));
  r = await api('GET', '/api/v1/help-center/articles');
  check('articles 200 + array', r.status === 200 && Array.isArray(r.json.data));
  r = await api('GET', '/api/v1/help-center/articles/search?q=bitcoin');
  check('search 200', r.status === 200 && Array.isArray(r.json.data));
  r = await api('GET', '/api/v1/help-center/articles/s/nonexistent');
  check('404 on missing article', r.status === 404);

  console.log('=== HELP CENTER (admin CRUD) ===');
  r = await api('POST', '/api/v1/help-center/admin/categories', { token: adminToken, body: { name: 'Test Cat', slug: `test-cat-${Date.now()}`, icon: 'HelpCircle', order: 1 } });
  check('create category 201', r.status === 201 && r.json.data.name === 'Test Cat');
  const catId = r.json.data.id;
  r = await api('POST', '/api/v1/help-center/admin/articles', { token: adminToken, body: { title: 'Test Article', slug: `test-art-${Date.now()}`, content: 'Bitcoin trading guide', categoryId: catId, status: 'published' } });
  check('create article 201', r.status === 201 && r.json.data.title === 'Test Article');
  const artId = r.json.data.id;
  r = await api('GET', '/api/v1/help-center/articles/search?q=bitcoin');
  check('search finds new article', r.status === 200 && r.json.data.some((a) => a.id === artId));
  r = await api('PUT', `/api/v1/help-center/admin/articles/${artId}`, { token: adminToken, body: { title: 'Updated Title' } });
  check('update article', r.status === 200 && r.json.data.title === 'Updated Title');
  r = await api('DELETE', `/api/v1/help-center/admin/articles/${artId}`, { token: adminToken });
  check('delete article', r.status === 200);
  r = await api('DELETE', `/api/v1/help-center/admin/categories/${catId}`, { token: adminToken });
  check('delete category', r.status === 200);

  console.log('=== SITE CONTENT ===');
  r = await api('GET', '/api/v1/site-content/page/landing');
  check('public page content: 14 sections', r.status === 200 && r.json.data.length === 14);
  r = await api('GET', '/api/v1/site-content/slug/landing-hero');
  check('public slug lookup', r.status === 200 && r.json.data.type === 'hero');
  r = await api('GET', '/api/v1/site-content/', { token: adminToken });
  check('admin list 200', r.status === 200 && r.json.data.length >= 19);
  r = await api('POST', '/api/v1/site-content/', { token: adminToken, body: { slug: `rt-sc-${Date.now()}`, page: 'test', section: 'test', type: 'hero', data: { title: 'RT' } } });
  check('admin create 201', r.status === 201);
  track(created.siteContent, r.json.data);
  const scId = r.json.data.id;
  r = await api('PUT', `/api/v1/site-content/${scId}`, { token: adminToken, body: { data: { title: 'RT2' } } });
  check('admin update', r.status === 200 && r.json.data.data.title === 'RT2');
  r = await api('POST', '/api/v1/site-content/bulk/test', { token: adminToken, body: [{ slug: `rt-b1-${Date.now()}`, section: 'a', type: 'text', data: {} }, { slug: `rt-b2-${Date.now()}`, section: 'b', type: 'text', data: {} }] });
  check('bulk upsert 200', r.status === 200 && r.json.data.length === 2);
  r.json.data.forEach((s) => track(created.siteContent, s));
  r = await api('DELETE', `/api/v1/site-content/${scId}`, { token: adminToken });
  check('admin delete', r.status === 200);

  console.log('=== CMS BLOCKS ===');
  r = await api('GET', '/api/v1/cms/');
  check('list blocks 200: 9', r.status === 200 && r.json.data.length === 9);
  const firstBlock = r.json.data[0];
  r = await api('GET', `/api/v1/cms/${firstBlock.slug}`);
  check('get block by slug', r.status === 200 && r.json.data.id === firstBlock.id);
  r = await api('POST', '/api/v1/cms/', { token: adminToken, body: { slug: `rt-block-${Date.now()}`, title: 'RT Block', content: {} } });
  check('create block 201', r.status === 201);
  track(created.blocks, r.json.data);
  r = await api('PUT', `/api/v1/cms/${r.json.data.id}`, { token: adminToken, body: { title: 'RT Block 2' } });
  check('update block', r.status === 200);
  r = await api('DELETE', `/api/v1/cms/${r.json.data.id}`, { token: adminToken });
  check('delete block', r.status === 200);

  console.log('=== ADMIN CMS ===');
  r = await api('GET', '/api/v1/admin/cms/menus', { token: adminToken });
  check('menus 200', r.status === 200);
  r = await api('POST', '/api/v1/admin/cms/menus', { token: adminToken, body: { name: 'RT Menu', location: 'top', items: [{ label: 'Home', href: '/' }] } });
  check('upsert menu 200', r.status === 200 && r.json.data.location === 'top');
  track(created.menus, r.json.data);
  r = await api('GET', '/api/v1/admin/cms/pages', { token: adminToken });
  check('pages 200', r.status === 200);
  r = await api('POST', '/api/v1/admin/cms/pages', { token: adminToken, body: { title: 'RT Page', slug: `rt-page-${Date.now()}`, layout: 'default' } });
  check('create page 201', r.status === 201);
  track(created.pages, r.json.data);
  const pageId = r.json.data.id;
  r = await api('GET', `/api/v1/admin/cms/pages/${pageId}`, { token: adminToken });
  check('get page by id', r.status === 200 && r.json.data.id === pageId);
  r = await api('PUT', `/api/v1/admin/cms/pages/${pageId}`, { token: adminToken, body: { title: 'RT Page 2' } });
  check('update page', r.status === 200 && r.json.data.title === 'RT Page 2');
  r = await api('DELETE', `/api/v1/admin/cms/pages/${pageId}`, { token: adminToken });
  check('delete page', r.status === 200);
  r = await api('GET', '/api/v1/admin/cms/status', { token: adminToken });
  check('site status 200', r.status === 200 && r.json.data.version);
  r = await api('POST', '/api/v1/admin/cms/anneal', { token: adminToken });
  check('annealing 200 + health', r.status === 200 && r.json.data.health && r.json.data.health.status);
  r = await api('PUT', '/api/v1/admin/cms/maintenance', { token: adminToken, body: { enabled: true, message: 'Test maintenance' } });
  check('maintenance on', r.status === 200 && r.json.data.isMaintenanceMode === true);
  r = await api('PUT', '/api/v1/admin/cms/maintenance', { token: adminToken, body: { enabled: false } });
  check('maintenance off', r.status === 200 && r.json.data.isMaintenanceMode === false);
  r = await api('GET', '/api/v1/admin/cms/news', { token: adminToken });
  check('admin news list 200', r.status === 200 && r.json.data.length >= 2);
  r = await api('GET', '/api/v1/admin/cms/blocks', { token: adminToken });
  check('admin blocks list 200', r.status === 200 && r.json.data.length === 9);

  console.log('=== EDUCATION ===');
  r = await api('GET', '/api/v1/education/courses');
  check('list courses: >=2 with content', r.status === 200 && r.json.data.length >= 2 && r.json.data[0].modules && r.json.data[0].modules.length >= 1);
  r = await api('GET', '/api/v1/education/courses/crypto-trading-101', { token: userToken });
  check('get course by slug', r.status === 200 && r.json.data.title === 'Crypto Trading 101');
  r = await api('POST', '/api/v1/education/courses', { token: adminToken, body: { title: `RT Course ${Date.now()}`, description: 'Route test course' } });
  check('create course 201', r.status === 201 && r.json.data.isPublished === false);
  const courseId = r.json.data.id;
  track(created.courses, r.json.data);
  r = await api('PATCH', `/api/v1/education/courses/${courseId}/publish`, { token: adminToken });
  check('publish course', r.status === 200 && r.json.data.isPublished === true);
  r = await api('POST', `/api/v1/education/courses/${courseId}/enroll`, { token: userToken });
  check('enroll 201', r.status === 201);
  track(created.progresses, r.json.data);
  r = await api('GET', '/api/v1/education/my-learning', { token: userToken });
  check('my-learning lists course', r.status === 200 && r.json.data.some((p) => p.course && p.course.id === courseId));
  r = await api('GET', '/api/v1/education/stats', { token: userToken });
  check('stats 200', r.status === 200 && r.json.data.enrolledCourses >= 1);

  console.log('=== CERTIFICATION ===');
  r = await api('POST', '/api/v1/certification/issue', { token: adminToken, body: { recipientId: user.id, courseId, title: 'RT Cert' } });
  check('issue certificate 201', r.status === 201 && r.json.data && r.json.data.code);
  const certCode = (r.json.data && r.json.data.code) || null;
  track(created.certs, r.json.data);
  r = await api('GET', `/api/v1/certification/verify/${certCode}`);
  check('verify certificate (public)', r.status === 200 && r.json.data.code === certCode);
  r = await api('GET', '/api/v1/certification/my', { token: userToken });
  check('my certificates', r.status === 200 && r.json.data.length >= 1);
  r = await api('GET', '/api/v1/certification/all', { token: adminToken });
  check('all certificates', r.status === 200 && Array.isArray(r.json.data));

  console.log('=== SUPPORT ===');
  r = await api('POST', '/api/v1/support/', { token: userToken, body: { subject: 'RT Ticket', category: 'general', priority: 'normal', message: 'Help me' } });
  check('create ticket 201', r.status === 201 && r.json.data.ticketNumber && r.json.data.ticketNumber.startsWith('TKT-'));
  const ticketId = r.json.data.id;
  track(created.tickets, r.json.data);
  r = await api('GET', '/api/v1/support/', { token: userToken });
  check('my tickets', r.status === 200 && r.json.data.length >= 1);
  r = await api('GET', `/api/v1/support/${ticketId}`, { token: userToken });
  check('get ticket', r.status === 200 && r.json.data.id === ticketId);
  r = await api('POST', `/api/v1/support/${ticketId}/reply`, { token: userToken, body: { message: 'More detail' } });
  check('reply (user)', r.status === 200 && r.json.data.messages.length === 2);
  r = await api('PUT', `/api/v1/support/${ticketId}/close`, { token: userToken });
  check('close ticket', r.status === 200 && r.json.data.status === 'closed');
  r = await api('GET', '/api/v1/support/admin/all', { token: adminToken });
  check('admin all tickets', r.status === 200 && Array.isArray(r.json.data));
  r = await api('POST', `/api/v1/support/admin/${ticketId}/reply`, { token: adminToken, body: { message: 'Admin response' } });
  check('admin reply', r.status === 200 && r.json.data.messages.length === 3);
  r = await api('PUT', `/api/v1/support/admin/${ticketId}/status`, { token: adminToken, body: { status: 'resolved' } });
  check('admin status → resolved', r.status === 200 && r.json.data.status === 'resolved' && !!r.json.data.resolvedAt);
  r = await api('POST', `/api/v1/support/admin/${ticketId}/note`, { token: adminToken, body: { note: 'Internal note' } });
  check('admin internal note', r.status === 200 && r.json.data.internalNotes.length === 1);

  console.log('=== NEWS ===');
  r = await api('GET', '/api/v1/news/');
  check('latest news: 2', r.status === 200 && r.json.data.length === 2);
  r = await api('GET', '/api/v1/news/federal-reserve-meeting-impact-398125');
  check('get article by slug', r.status === 200 && r.json.data.title.includes('Federal Reserve'));
  r = await api('POST', '/api/v1/news/', { token: adminToken, body: { title: `RT News ${Date.now()}`, content: 'Breaking story' } });
  check('create article 201', r.status === 201);
  const newsId = r.json.data.id;
  track(created.news, r.json.data);
  r = await api('PATCH', `/api/v1/news/${newsId}/publish`, { token: adminToken });
  check('publish article', r.status === 200 && r.json.data.isPublished === true && !!r.json.data.publishedAt);

  console.log('=== NEWSLETTER ===');
  r = await api('POST', '/api/v1/newsletter/subscribe', { body: { email: `rt_nl_${Date.now()}@test.local` } });
  check('subscribe 201', r.status === 201 && r.json.data.status === 'active');
  track(created.newsletters, r.json.data);
  r = await api('POST', '/api/v1/newsletter/subscribe', { body: { email: r.json.data.email } });
  check('duplicate subscribe → 400', r.status === 400);
  r = await api('POST', '/api/v1/newsletter/unsubscribe', { body: { email: `rt_nl_${Date.now()}@test.local` } });
  check('unsubscribe 404 (wrong email)', r.status === 404);

  console.log('=== SYSTEM ===');
  r = await api('GET', '/api/v1/system/geo-restrictions');
  check('geo-restrictions (public)', r.status === 200 && r.json.data.value && r.json.data.value.global && r.json.data.value.global.enabled === true);

  console.log('=== CLEANUP ===');
  for (const id of created.siteContent) await SiteContentRepository.delete(id).catch(() => {});
  for (const id of created.blocks) await ContentBlockRepository.delete(id).catch(() => {});
  for (const id of created.menus) await MenuRepository.delete(id).catch(() => {});
  for (const id of created.pages) await PageRepository.delete(id).catch(() => {});
  for (const id of created.media) await MediaRepository.delete(id).catch(() => {});
  for (const id of created.progresses) await CourseProgressRepository.delete(id).catch(() => {});
  for (const id of created.certs) await CertificateRepository.delete(id).catch(() => {});
  for (const id of created.tickets) await SupportTicketRepository.delete(id).catch(() => {});
  for (const id of created.newsletters) await NewsletterRepository.delete(id).catch(() => {});
  for (const id of created.news) await NewsRepository.delete(id).catch(() => {});
  for (const id of created.notifications) await NotificationRepository.delete(id).catch(() => {});
  for (const id of created.logs) await ActivityLogRepository.delete(id).catch(() => {});
  for (const id of created.courses) await CourseRepository.delete(id).catch(() => {});
  await UserRepository.delete(user.id);
  await UserRepository.delete(admin.id);
  server.close();
  console.log('Cleanup done');

  console.log(`\n=== PHASE 5 ROUTE SUITE: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} ===`);
  process.exit(failures);
})().catch((e) => { console.error('SUITE ERROR:', e); process.exit(1); });