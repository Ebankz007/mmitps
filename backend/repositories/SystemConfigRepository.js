const BaseRepository = require('./BaseRepository');
const SystemConfig = require('../models/System/SystemConfig');

class SystemConfigRepository extends BaseRepository {
    constructor() {
        super(SystemConfig);
    }

    async findByKey(key) {
        return this.model.findOne({ key });
    }

    async findByCategory(category) {
        return this.model.find({ category });
    }
}

module.exports = new SystemConfigRepository();
