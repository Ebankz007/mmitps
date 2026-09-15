// backend/repositories/pg/NewsRepository.js — news_articles (News)
const BaseRepository = require('./BaseRepository');
const { newsArticles } = require('../../../db/schema/news');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');

class NewsRepository extends BaseRepository {
  constructor() {
    super(newsArticles, {
      relations: {
        author: { table: users, on: eq(newsArticles.authorId, users.id) },
      },
    });
  }

  async findBySlug(slug) {
    return this.findOne({ slug }, { populate: 'author' });
  }

  async findPublished(filters = {}, options = {}) {
    return this.findAll({ ...filters, isPublished: true }, { sort: '-publishedAt', ...options });
  }
}

module.exports = new NewsRepository();