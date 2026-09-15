// backend/repositories/pg/HelpCenterRepository.js — help_categories + help_articles (CMS)
// Full-text search uses the tsvector search_vector column (maintained by the
// trg_help_articles_search trigger) + GIN index — PG's answer to Mongo $text.
const BaseRepository = require('./BaseRepository');
const { db, pool } = require('../../../db');
const { eq, and, desc, asc, sql } = require('drizzle-orm');
const { helpCategories, helpArticles } = require('../../../db/schema/cms');

class HelpCategoryRepository extends BaseRepository {
  constructor() {
    super(helpCategories);
  }

  async countArticles(categoryId) {
    const rows = await db
      .select({ n: sql`count(*)::int` })
      .from(helpArticles)
      .where(eq(helpArticles.categoryId, categoryId));
    return rows[0]?.n ?? 0;
  }
}

class HelpArticleRepository extends BaseRepository {
  constructor() {
    super(helpArticles, {
      relations: {
        category: { table: helpCategories, on: eq(helpArticles.categoryId, helpCategories.id) },
      },
    });
  }

  async findBySlug(slug) {
    return this.findOne({ slug }, { populate: 'category' });
  }

  /** Published article by slug, increments viewCount (Mongo $inc equivalent). */
  async findPublishedBySlugAndCount(slug) {
    const rows = await db
      .update(helpArticles)
      .set({ viewCount: sql`${helpArticles.viewCount} + 1` })
      .where(and(eq(helpArticles.slug, slug), eq(helpArticles.status, 'published')))
      .returning();
    if (!rows.length) return null;
    const category = await db
      .select()
      .from(helpCategories)
      .where(eq(helpCategories.id, rows[0].categoryId));
    const out = { ...rows[0], category: category[0] || null };
    return this._transform([out], 'category')[0];
  }

  /** tsvector full-text search over published articles, ranked by relevance. */
  async search(q, limit = 10) {
    const res = await pool.query(
      `SELECT ha.id, ha.title, ha.slug, ha.content, ha.category_id, ha.status, ha."order",
              ha.view_count, ha.tags, ha.created_at, ha.updated_at,
              ts_rank(ha.search_vector, plainto_tsquery('english', $1)) AS rank,
              hc.id AS hc_id, hc.name AS hc_name, hc.icon AS hc_icon
       FROM help_articles ha
       LEFT JOIN help_categories hc ON hc.id = ha.category_id
       WHERE ha.status = 'published' AND ha.search_vector @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [q, limit]
    );
    return res.rows.map((r) => ({
      id: r.id, title: r.title, slug: r.slug, content: r.content, categoryId: r.category_id,
      status: r.status, order: r.order, viewCount: r.view_count, tags: r.tags,
      createdAt: r.created_at, updatedAt: r.updated_at,
      category: r.hc_id ? { id: r.hc_id, name: r.hc_name, icon: r.hc_icon } : null,
    }));
  }
}

module.exports = { HelpCategoryRepository: new HelpCategoryRepository(), HelpArticleRepository: new HelpArticleRepository() };