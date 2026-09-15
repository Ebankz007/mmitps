// db/schema/support.js — Support domain tables
// Migrated from: backend/models/Support/*.js
const { pgTable, pgEnum, uuid, text, timestamp, integer, jsonb, index } = require('drizzle-orm/pg-core');
const { users } = require('./core');
const { transactions } = require('./financial');

// ─── Enums ────────────────────────────────────────────────────────────
const ticketCategory = pgEnum('ticket_category', [
  'general', 'account', 'deposit', 'withdrawal', 'trading', 'mlm', 'kyc',
  'technical', 'billing', 'other',
]);
const ticketPriority = pgEnum('ticket_priority', ['low', 'normal', 'high', 'urgent']);
const ticketStatus = pgEnum('ticket_status', [
  'open', 'in_progress', 'waiting_customer', 'waiting_internal',
  'resolved', 'closed', 'liquidated',
]);
const senderType = pgEnum('sender_type', ['user', 'agent', 'system']);

// ─── Support Tickets ──────────────────────────────────────────────────
const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  ticketNumber: text('ticket_number').unique(), // TKT-XXXX generated in service layer
  subject: text('subject').notNull(),
  category: ticketCategory('category').default('general'),
  priority: ticketPriority('priority').default('normal'),
  status: ticketStatus('status').default('open'),
  messages: jsonb('messages').default([]), // [{sender, senderType, message, attachments, isInternal, createdAt}]
  internalNotes: jsonb('internal_notes').default([]), // [{agent, note, createdAt}]
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  relatedTransactionId: uuid('related_transaction_id').references(() => transactions.id),
  tags: text('tags').array().default([]),
  rating: jsonb('rating').default({}), // {score, feedback, ratedAt}
  firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_support_tickets_user_status').on(t.userId, t.status),
  index('idx_support_tickets_status_priority').on(t.status, t.priority),
]);

module.exports = {
  ticketCategory, ticketPriority, ticketStatus, senderType,
  supportTickets,
};