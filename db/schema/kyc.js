// db/schema/kyc.js — KYC domain tables
// Migrated from: backend/models/KYC/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, integer, jsonb, index } = require('drizzle-orm/pg-core');
const { users } = require('./core');
const { transactions } = require('./financial');

// ─── Enums ────────────────────────────────────────────────────────────
const kycType = pgEnum('kyc_type', [
  'passport', 'national_id', 'drivers_license', 'residence_permit',
  'utility_bill', 'bank_statement', 'selfie', 'selfie_with_id',
  'proof_of_address', 'tax_document', 'company_registration', 'other',
]);
const kycStatus = pgEnum('kyc_status', ['pending', 'approved', 'rejected', 'expired']);
const amlCheckType = pgEnum('aml_check_type', [
  'sanctions', 'pep', 'adverse_media', 'transaction_monitoring', 'enhanced_due_diligence',
]);
const amlStatus = pgEnum('aml_status', ['pending', 'clear', 'match', 'potential_match', 'error']);
const amlRiskLevel = pgEnum('aml_risk_level', ['low', 'medium', 'high', 'critical']);
const amlAction = pgEnum('aml_action', ['none', 'flagged', 'blocked', 'reported']);

// ─── KYC Documents ────────────────────────────────────────────────────
const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: kycType('type').notNull(),
  documentNumber: text('document_number'),
  issuingCountry: text('issuing_country'),
  issuedDate: timestamp('issued_date', { withTimezone: true }),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  status: kycStatus('status').default('pending'),
  verifiedById: uuid('verified_by_id').references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  extractedData: jsonb('extracted_data').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_kyc_docs_user_type').on(t.userId, t.type),
  index('idx_kyc_docs_status').on(t.status),
]);

// ─── AML Checks ───────────────────────────────────────────────────────
const amlChecks = pgTable('aml_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  checkType: amlCheckType('check_type').notNull(),
  provider: text('provider'),
  reference: text('reference'),
  status: amlStatus('status').default('pending'),
  riskScore: integer('risk_score'),
  riskLevel: amlRiskLevel('risk_level'),
  matches: jsonb('matches').default([]),
  result: jsonb('result').default({}),
  reviewRequired: boolean('review_required').default(false),
  reviewedById: uuid('reviewed_by_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  action: amlAction('action').default('none'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_aml_checks_user').on(t.userId),
  index('idx_aml_checks_transaction').on(t.transactionId),
  index('idx_aml_checks_status_review').on(t.status, t.reviewRequired),
]);

module.exports = {
  kycType, kycStatus, amlCheckType, amlStatus, amlRiskLevel, amlAction,
  kycDocuments, amlChecks,
};