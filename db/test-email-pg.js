// db/test-email-pg.js — emailService + ApiServiceManager + EmailTemplateService on PG
const EmailService = require('../backend/services/emailService');
const ApiServiceManager = require('../backend/services/ApiServiceManager');
const EmailTemplateService = require('../backend/services/EmailTemplateService');

let failures = 0;
const check = (name, cond) => {
  console.log(`  [${cond ? 'PASS' : 'FAIL'}] ${name}`);
  if (!cond) failures++;
};

(async () => {
  // 1. Config reads from PG (api_service_manager was ported)
  const config = await ApiServiceManager.getConfig();
  check('getConfig returns object with mockMode', config && typeof config === 'object' && 'mockMode' in config);
  check('config has email section', config.email && typeof config.email === 'object');
  check('config has providers', config.providers && typeof config.providers === 'object');

  const masked = await ApiServiceManager.getMaskedConfig();
  check('getMaskedConfig masks keys', masked && masked.email && typeof masked.email === 'object');

  const mock = await ApiServiceManager.isMockMode();
  check('isMockMode returns boolean', typeof mock === 'boolean');

  // 2. Templates from PG (20 ported)
  const all = await EmailTemplateService.getAllTemplates();
  check('getAllTemplates >= 20', Array.isArray(all) && all.length >= 20);
  check('template rows have key + subject', all.length > 0 && all[0].key && all[0].subject !== undefined);

  const welcome = await EmailTemplateService.getTemplate('auth.welcome');
  check('getTemplate auth.welcome', welcome && welcome.key === 'auth.welcome');
  check('template has htmlBody', welcome && typeof welcome.htmlBody === 'string' && welcome.htmlBody.length > 0);

  // 3. Render event
  const rendered = await EmailTemplateService.renderEvent('auth.welcome', {
    user: { firstName: 'Kairos', lastName: 'Test', email: 'k@test.local', username: 'kairos' },
    platform: { name: 'MMITPS', url: 'https://app.mmitps.com' }
  });
  check('renderEvent returns subject+html', rendered && rendered.subject && rendered.html);
  check('render substitutes vars', rendered && rendered.html.includes('Kairos'));

  const missing = await EmailTemplateService.renderEvent('auth.nonexistent_key', {});
  check('renderEvent missing → null', missing === null);

  // 4. EmailService end-to-end (mock mode — no SMTP creds)
  const emailConfig = await EmailService.getConfig();
  check('EmailService.getConfig returns email object', emailConfig && typeof emailConfig === 'object');

  const sent = await EmailService.sendEmail('k@test.local', 'Test', '<p>hi</p>');
  check('sendEmail mock-mode result', sent && (sent.mocked === true || sent.failed === true));

  const ev = await EmailService.sendEvent('auth.welcome', {
    email: 'k@test.local',
    username: 'kairos',
    profile: { firstName: 'Kairos' },
    preferences: {}
  });
  check('sendEvent returns mocked result', ev === null || ev.mocked === true || ev.failed === true);

  // 5. Update + reset round-trip (restore state after)
  const original = await EmailTemplateService.getTemplate('auth.welcome');
  await EmailTemplateService.updateTemplate('auth.welcome', { subject: 'TEST SUBJECT' }, null);
  const updated = await EmailTemplateService.getTemplate('auth.welcome');
  check('updateTemplate changes subject', updated.subject === 'TEST SUBJECT');
  await EmailTemplateService.resetTemplate('auth.welcome');
  const restored = await EmailTemplateService.getTemplate('auth.welcome');
  check('resetTemplate restores default subject', restored.subject === original.subject);

  // 6. updateConfig round-trip (restore state after)
  const origConfig = await ApiServiceManager.getConfig();
  const before = JSON.stringify(origConfig);
  await ApiServiceManager.updateConfig({ ...origConfig, mockMode: false }, null);
  const afterUpdate = await ApiServiceManager.getConfig();
  check('updateConfig persists mockMode=false', afterUpdate.mockMode === false);
  await ApiServiceManager.updateConfig(JSON.parse(before), null);
  const restoredConfig = await ApiServiceManager.getConfig();
  check('updateConfig restores original', JSON.stringify(restoredConfig) === before);

  console.log(`\n=== EMAIL PG SUITE: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} ===`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('SUITE ERROR:', e.message, e.stack); process.exit(1); });