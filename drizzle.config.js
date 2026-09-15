// drizzle.config.js — Drizzle Kit configuration
// Generates SQL migrations from db/schema/*.js
const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  dialect: 'postgresql',
  schema: './db/schema/*.js',
  out: './db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://mmitps_user:mmitps_dev_pass_2026@localhost:5433/mmitps_dev',
  },
  strict: true,
  verbose: true,
});