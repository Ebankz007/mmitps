// db/schema/news.js — News domain tables
// Migrated from: backend/models/News/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, index } = require('drizzle-orm/pg-core');
const { users } = require('./core');

// ─── Enums ────────────────────────────────────────────────────────────
const newsCategory = pgEnum('news_category', ['crypto', 'forex', 'stocks', 'economy', 'general']);

// ─── News Articles ────────────────────────────────────────────────────
const newsArticles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  content: text('content').notNull(),
  summary: text('summary'),
  thumbnail: text('thumbnail'),
  category: newsCategory('category').default('general'),
  source: jsonb('source').default({}), // {name, url}
  authorId: uuid('author_id').references(() => users.id),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_news_articles_published').on(t.isPublished),
  index('idx_news_articles_category_published').on(t.category, t.isPublished),
]);

module.exports = {
  newsCategory,
  newsArticles,
};