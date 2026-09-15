// db/schema/index.js — Aggregated schema exports
// All 64 PostgreSQL tables across 11 domains.
const core = require('./core');
const financial = require('./financial');
const trading = require('./trading');
const mlm = require('./mlm');
const cms = require('./cms');
const education = require('./education');
const kyc = require('./kyc');
const support = require('./support');
const system = require('./system');
const tokenization = require('./tokenization');
const news = require('./news');

module.exports = {
  ...core,
  ...financial,
  ...trading,
  ...mlm,
  ...cms,
  ...education,
  ...kyc,
  ...support,
  ...system,
  ...tokenization,
  ...news,
};