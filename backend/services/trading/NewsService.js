const NewsRepository = require('../../repositories/NewsRepository');
const ApiError = require('../../utils/ApiError');

class NewsService {
    async createArticle(data, userId) {
        data.author = userId;
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return NewsRepository.create(data);
    }

    async publishArticle(id) {
        return NewsRepository.update(id, {
            isPublished: true,
            publishedAt: new Date()
        });
    }

    async getLatestNews(filters = {}) {
        return NewsRepository.findPublished(filters);
    }

    async getArticle(slug) {
        const article = await NewsRepository.findBySlug(slug);
        if (!article) throw new ApiError(404, 'Article not found');
        return article;
    }
}

module.exports = new NewsService();
