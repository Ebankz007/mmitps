// backend/services/pg/NewsService.js — news articles on the PG stack
const NewsRepository = require('../../repositories/pg/NewsRepository');
const ApiError = require('../../utils/ApiError');
const sanitizeHtmlContent = require('../../utils/sanitizeHtml');

class NewsService {
  _slugify(title) {
    return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  async createArticle(data, authorId) {
    const slug = this._slugify(data.title);
    const existing = await NewsRepository.findOne({ slug });
    // Sanitize HTML on write — article content renders via dangerouslySetInnerHTML
    if (data.content) data.content = sanitizeHtmlContent(data.content);
    return NewsRepository.create({
      ...data,
      slug: existing ? `${slug}-${Date.now()}` : slug,
      authorId,
      isPublished: false,
    });
  }

  async publishArticle(id) {
    const article = await NewsRepository.update(id, {
      isPublished: true,
      publishedAt: new Date(),
    });
    if (!article) throw new ApiError(404, 'Article not found');
    return article;
  }

  async getLatest(limit = 10) {
    return NewsRepository.findPublished({}, { limit, sort: '-publishedAt' });
  }

  async getBySlug(slug) {
    const article = await NewsRepository.findBySlug(slug);
    if (!article || !article.isPublished) throw new ApiError(404, 'Article not found');
    return article;
  }
}

module.exports = new NewsService();