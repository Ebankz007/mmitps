const BaseRepository = require('./BaseRepository');
const NewsArticle = require('../models/News/NewsArticle');

class NewsRepository extends BaseRepository {
    constructor() {
        super(NewsArticle);
    }

    async findPublished(filters = {}) {
        return this.model.find({ ...filters, isPublished: true }).sort('-publishedAt').limit(20);
    }

    async findBySlug(slug) {
        return this.model.findOne({ slug, isPublished: true });
    }
}

module.exports = new NewsRepository();
