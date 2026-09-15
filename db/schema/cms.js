// db/schema/cms.js — CMS domain tables
// Migrated from: backend/models/CMS/*.js
const { pgTable, pgEnum, uuid, text, timestamp, boolean, integer, numeric, jsonb, index, customType } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');
const { users } = require('./core');

// ─── Custom tsvector type ─────────────────────────────────────────────
const tsvector = customType({ dataType() { return 'tsvector'; } });

// ─── Enums ────────────────────────────────────────────────────────────
const articleStatus = pgEnum('article_status', ['draft', 'published']);
const mediaCategory = pgEnum('media_category', ['image', 'video', 'icon', 'document']);
const menuLocation = pgEnum('menu_location', ['top', 'footer', 'dashboard_sidebar', 'admin_sidebar', 'mobile']);
const itemVisibility = pgEnum('item_visibility', ['public', 'authenticated', 'admin', 'super_admin']);

// ─── Help Categories ──────────────────────────────────────────────────
const helpCategories = pgTable('help_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon').default('HelpCircle'),
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Help Articles (with full-text search) ────────────────────────────
const helpArticles = pgTable('help_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(), // HTML
  categoryId: uuid('category_id').notNull().references(() => helpCategories.id),
  status: articleStatus('status').default('draft'),
  order: integer('order').default(0),
  viewCount: integer('view_count').default(0),
  tags: text('tags').array().default([]),
  searchVector: tsvector('search_vector'), // maintained by trigger (see migration SQL)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_help_articles_search').using('gin', sql`${t.searchVector}`),
  index('idx_help_articles_category').on(t.categoryId, t.status),
]);

// ─── Media ────────────────────────────────────────────────────────────
const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  originalname: text('originalname').notNull(),
  mimetype: text('mimetype').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  category: mediaCategory('category').default('image'),
  alt: text('alt'),
  dimensions: jsonb('dimensions').default({}), // {width, height}
  duration: numeric('duration', { precision: 10, scale: 2, mode: 'number' }),
  uploadedById: uuid('uploaded_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Menus (recursive structure stored as JSONB) ──────────────────────
const menus = pgTable('menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  location: menuLocation('location').notNull().unique(),
  items: jsonb('items').default([]), // recursive [{label, href, icon, order, visibility, serviceKey, submenu: [...]}]
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Pages ────────────────────────────────────────────────────────────
const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  seo: jsonb('seo').default({}), // {title, description, keywords, ogImage}
  layout: text('layout').default('default'),
  content: uuid('content').array().default([]), // refs → content_blocks (core.js)
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

module.exports = {
  articleStatus, mediaCategory, menuLocation, itemVisibility,
  helpCategories, helpArticles, media, menus, pages,
};