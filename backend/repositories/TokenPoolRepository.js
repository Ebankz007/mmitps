const BaseRepository = require('./BaseRepository');
const TokenPool = require('../models/Tokenization/TokenPool');

class TokenPoolRepository extends BaseRepository {
    constructor() {
        super(TokenPool);
    }

    async findActive() {
        return this.model.find({ status: 'open' }).sort('-createdAt');
    }
}

module.exports = new TokenPoolRepository();
