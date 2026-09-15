const BaseRepository = require('./BaseRepository');
const Analysis = require('../models/Trading/Analysis');

class AnalysisRepository extends BaseRepository {
    constructor() {
        super(Analysis);
    }

    async findActive() {
        return this.model.find().populate('author', 'firstName lastName username').sort('-createdAt');
    }

    async findByPair(pair) {
        return this.model.find({ pair }).populate('author', 'firstName lastName username');
    }
}

module.exports = new AnalysisRepository();
