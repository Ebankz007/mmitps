/**
 * GenealogyService — PostgreSQL edition.
 * Mirrors the Mongo services/mlm/GenealogyService.
 * PG adaptations: tree keyed by user id (parentId/leftChildId/rightChildId are
 * USER ids, not node ids); ltree path labels are hyphen-stripped UUIDs.
 */
const MLMTreeNodeRepository = require('../../repositories/pg/MLMTreeNodeRepository');
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');
const { uuidToLtree } = require('../../utils/ltree');

class GenealogyService {
  async getBinaryTree(userId) {
    const rootNode = await MLMTreeNodeRepository.findByUserId(userId);
    if (!rootNode) return null;
    return MLMTreeNodeRepository.getDownline(rootNode.path);
  }

  async getSponsorTree(userId) {
    const allNodes = await MLMTreeNodeRepository.findAll({}, { populate: 'user' });
    const tree = [];
    const visited = new Set();

    const buildSponsorTree = (currentId) => {
      if (visited.has(currentId.toString())) return;
      visited.add(currentId.toString());

      const directReferrals = allNodes.filter((n) => n.sponsorId && n.sponsorId.toString() === currentId.toString());
      directReferrals.forEach((node) => {
        tree.push(node);
        buildSponsorTree(node.user?.id || node.userId);
      });
    };

    buildSponsorTree(userId);
    return tree;
  }

  async createRoot(userId) {
    return MLMTreeNodeRepository.createRoot(userId);
  }

  /**
   * Place a new user in the binary tree.
   * @param {String} newUserId
   * @param {String} sponsorId
   * @param {String} strategy 'left', 'right', 'auto', 'manual'
   * @param {String} manualParentId (USER id in the PG schema)
   * @param {String} manualPosition (optional)
   */
  async placeUser(newUserId, sponsorId, strategy = 'auto', manualParentId = null, manualPosition = null) {
    const sponsorNode = await MLMTreeNodeRepository.findByUserId(sponsorId);
    if (!sponsorNode) {
      throw new ApiError(404, 'Sponsor not found in tree');
    }

    let parentNode = null;
    let position = null;

    if (strategy === 'manual') {
      parentNode = await MLMTreeNodeRepository.findByUserId(manualParentId);
      position = manualPosition;
      if (!parentNode) {
        throw new ApiError(404, 'Parent node not found');
      }
      if (parentNode[position === 'left' ? 'leftChildId' : 'rightChildId']) {
        throw new ApiError(400, 'Position already occupied');
      }
    } else if (strategy === 'left' || strategy === 'right') {
      parentNode = await MLMTreeNodeRepository.findExtremeNode(sponsorNode.userId, strategy);
      position = strategy;
    } else {
      const placementPreference = sponsorNode.preferredPlacement || 'left';
      parentNode = await MLMTreeNodeRepository.findExtremeNode(sponsorNode.userId, placementPreference);
      position = placementPreference;
    }

    // Create node (path labels are hyphen-stripped UUIDs for ltree)
    const newNode = await MLMTreeNodeRepository.create({
      userId: newUserId,
      sponsorId,
      parentId: parentNode.userId,
      position,
      path: `${parentNode.path}.${uuidToLtree(newUserId)}`,
      depth: (parentNode.depth || 0) + 1,
    });

    // Update parent's child pointer
    if (position === 'left') {
      await MLMTreeNodeRepository.update(parentNode.id, { leftChildId: newUserId });
    } else {
      await MLMTreeNodeRepository.update(parentNode.id, { rightChildId: newUserId });
    }

    return newNode;
  }

  async getLegSettings(userId) {
    const node = await MLMTreeNodeRepository.findByUserId(userId);
    if (!node) {
      return {
        preferredPlacement: 'left',
        stats: {
          leftLegVolume: 0,
          rightLegVolume: 0,
          leftMembers: 0,
          rightMembers: 0,
        },
      };
    }
    return {
      preferredPlacement: node.preferredPlacement || 'left',
      stats: {
        leftLegVolume: node.leftLegVolume || 0,
        rightLegVolume: node.rightLegVolume || 0,
        leftMembers: node.leftDescendantCount || 0,
        rightMembers: node.rightDescendantCount || 0,
      },
    };
  }

  async updateLegSettings(userId, preferredPlacement) {
    const node = await MLMTreeNodeRepository.findByUserId(userId);
    if (!node) throw new ApiError(404, 'You must be in the genealogy tree to update placement settings');

    await MLMTreeNodeRepository.update(node.id, { preferredPlacement });
    return { preferredPlacement };
  }
}

module.exports = new GenealogyService();