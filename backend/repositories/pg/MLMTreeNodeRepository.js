/**
 * MLMTreeNodeRepository — PostgreSQL edition (binary tree via ltree).
 * Mirrors the Mongo GenealogyRepository.
 *
 * Semantic note: the PG schema keys the tree by USER id (userId is unique;
 * parentId/leftChildId/rightChildId reference users.id, and the ltree path is
 * built from user ids). The Mongo model used node ids for parent/children —
 * callers here pass user ids, not node ids.
 */
const BaseRepository = require('./BaseRepository');
const { mlmTreeNodes } = require('../../../db/schema/mlm');
const { users } = require('../../../db/schema/core');
const { eq } = require('drizzle-orm');
const { uuidToLtree } = require('../../utils/ltree');

class MLMTreeNodeRepository extends BaseRepository {
  constructor() {
    super(mlmTreeNodes, {
      relations: {
        user: { table: users, on: eq(mlmTreeNodes.userId, users.id) },
      },
    });
  }

  async findByUserId(userId, options = {}) {
    return this.findOne({ userId }, { populate: 'user', ...options });
  }

  async getDirectReferrals(userId, options = {}) {
    return this.findAll({ sponsorId: userId }, { populate: 'user', ...options });
  }

  /**
   * All nodes whose path is a descendant of (or equal to) the given path.
   * Replaces the Mongo `path: { $regex: ^node.path }` query with ltree `<@`.
   */
  async getDownline(path, options = {}) {
    return this.findAll({ path: { $ltree: path } }, { populate: 'user', sort: 'depth', ...options });
  }

  /** Direct binary children — parentId is a USER id in the PG schema. */
  async getChildren(userId, options = {}) {
    return this.findAll({ parentId: userId }, options);
  }

  /** Walk the left/right child chain (user ids) to the extreme node for auto-placement. */
  async findExtremeNode(userId, leg) {
    let current = await this.findByUserId(userId);
    const childKey = leg === 'left' ? 'leftChildId' : 'rightChildId';
    while (current && current[childKey]) {
      current = await this.findByUserId(current[childKey]);
    }
    return current;
  }

  async createRoot(userId) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.create({
      userId,
      position: 'root',
      path: uuidToLtree(userId),
      depth: 0,
      sponsorId: null,
      parentId: null,
    });
  }
}

module.exports = new MLMTreeNodeRepository();