const ContentBlock = require('../../models/ContentBlock');

class SearchService {
    async globalSearch(query) {
        if (!query) return [];

        // Search in content blocks
        const blocks = await ContentBlock.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);

        // Add other models (Users, Signals, etc.) as needed
        return {
            content: blocks,
            assets: [], // Mock search results for assets
            traders: []
        };
    }
}

module.exports = new SearchService();
