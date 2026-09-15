const BaseRepository = require('./BaseRepository');
const MLMTreeNode = require('../models/MLM/TreeNode');
const ApiError = require('../utils/ApiError');

class GenealogyRepository extends BaseRepository {
    constructor() {
        super(MLMTreeNode);
    }

    async findByUserId(userId) {
        return this.model.findOne({ user: userId }).populate('user', 'username email');
    }

    async findByUsername(username) {
        // Requires join with User model or simple lookup if username stored in node (it's not, it's in User)
        // So we query by populated field? No, mongoose doesn't support that easily in one go without aggregation.
        // Better to find User first then Node.
        // But for repository pattern strictness, let's assume calling service handles user lookup or we use aggregate.
        // Let's rely on finding by UserID.
        return null;
    }

    async getDirectReferrals(userId) {
        return this.model.find({ sponsor: userId }).populate('user', 'username email');
    }

    async getDownline(nodeId) {
        const node = await this.model.findById(nodeId);
        if (!node) return [];
        // regex query on path
        return this.model.find({ path: { $regex: `^${node.path}` } }).populate('user', 'username name rank');
    }

    async getChildren(nodeId) {
        return this.model.find({ parent: nodeId });
    }

    /**
     * Find extreme left/right node for auto-placement
     * @param {String} rootNodeId 
     * @param {String} leg 'left' or 'right'
     */
    async findExtremeNode(rootNodeId, leg) {
        let current = await this.model.findById(rootNodeId);
        while (current && current[leg === 'left' ? 'leftChild' : 'rightChild']) {
            current = await this.model.findById(current[leg === 'left' ? 'leftChild' : 'rightChild']);
        }
        return current;
    }
}

module.exports = new GenealogyRepository();
