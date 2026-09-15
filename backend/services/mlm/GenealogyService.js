const GenealogyRepository = require('../../repositories/GenealogyRepository');
const UserRepository = require('../../repositories/UserRepository');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');

class GenealogyService {

    async getBinaryTree(userId) {
        const rootNode = await GenealogyRepository.findByUserId(userId);
        if (!rootNode) return null;

        const nodes = await GenealogyRepository.getDownline(rootNode._id);
        return nodes;
    }

    async getSponsorTree(userId) {
        // Fetch all nodes where this user is the sponsor or in the sponsor lineage
        // For simplicity and performance, we'll fetch direct and indirect referrals
        // In a production app, we might use a materialized path for sponsors (sponsorPath)
        // For now, we'll do a recursive-like fetch or a broad search if architecture allows.
        // Actually, let's use the 'sponsor' field to find all descendants.

        const allNodes = await GenealogyRepository.model.find().populate('user', 'username name rank');
        const tree = [];
        const visited = new Set();

        const buildSponsorTree = (currentId) => {
            if (visited.has(currentId.toString())) return;
            visited.add(currentId.toString());

            const directReferrals = allNodes.filter(n => n.sponsor && n.sponsor.toString() === currentId.toString());
            directReferrals.forEach(node => {
                tree.push(node);
                buildSponsorTree(node.user._id || node.user);
            });
        };

        buildSponsorTree(userId);
        return tree;
    }

    async createRoot(userId) {
        // Check if tree is empty? Or just allow creating a root if doesn't exist
        const existingNode = await GenealogyRepository.findByUserId(userId);
        if (existingNode) throw new ApiError(400, 'User already in tree');

        return GenealogyRepository.create({
            user: userId,
            position: 'root',
            path: userId,
            depth: 0,
            sponsor: null, // Root has no sponsor in tree context usually, or system user
            parent: null
        });
    }

    /**
     * Place a new user in the binary tree
     * @param {String} newUserId 
     * @param {String} sponsorId 
     * @param {String} strategy 'left', 'right', 'auto', 'manual'
     * @param {String} manualParentId (optional)
     * @param {String} manualPosition (optional)
     */
    async placeUser(newUserId, sponsorId, strategy = 'auto', manualParentId = null, manualPosition = null) {
        // 1. Validate Sponsor
        const sponsorNode = await GenealogyRepository.findByUserId(sponsorId);
        if (!sponsorNode) {
            // Create root node for sponsor if not exists (e.g. first user)
            // Or throw error. For now, assume sponsor must be in tree.
            // If sponsor is root admin, maybe they are already there.
            throw new ApiError(404, 'Sponsor not found in tree');
        }

        let parentNode = null;
        let position = null;

        if (strategy === 'manual') {
            console.log('Manual placement searching for parent:', manualParentId);
            parentNode = await GenealogyRepository.findById(manualParentId, { lean: false });
            console.log('Parent node found:', parentNode ? parentNode._id : 'null');
            position = manualPosition;
            if (!parentNode) {
                throw new ApiError(404, 'Parent node not found');
            }
            if (parentNode[position === 'left' ? 'leftChild' : 'rightChild']) {
                throw new ApiError(400, 'Position already occupied');
            }
        } else if (strategy === 'left' || strategy === 'right') {
            // Find extreme node
            let current = sponsorNode;
            while (current[strategy === 'left' ? 'leftChild' : 'rightChild']) {
                const nextId = current[strategy === 'left' ? 'leftChild' : 'rightChild'];
                current = await GenealogyRepository.findById(nextId);
            }
            parentNode = current;
            position = strategy;
        } else {
            // Use Sponsor's preferred placement if strategy is auto
            const placementPreference = sponsorNode.preferredPlacement || 'left';

            let current = sponsorNode;
            while (current[placementPreference === 'left' ? 'leftChild' : 'rightChild']) {
                const nextId = current[placementPreference === 'left' ? 'leftChild' : 'rightChild'];
                current = await GenealogyRepository.findById(nextId);
            }
            parentNode = current;
            position = placementPreference;
        }

        // Create Node
        const newNode = await GenealogyRepository.create({
            user: newUserId,
            sponsor: sponsorId,
            parent: parentNode._id,
            position: position,
            path: `${parentNode.path || parentNode._id}.${newUserId}`,
            depth: (parentNode.depth || 0) + 1
        });

        // Update Parent
        if (position === 'left') {
            parentNode.leftChild = newNode._id;
        } else {
            parentNode.rightChild = newNode._id;
        }
        await parentNode.save();

        return newNode;
    }

    async getLegSettings(userId) {
        const node = await GenealogyRepository.findByUserId(userId);
        if (!node) {
            // Return default settings for users not yet in the tree
            return {
                preferredPlacement: 'left',
                stats: {
                    leftLegVolume: 0,
                    rightLegVolume: 0,
                    leftMembers: 0,
                    rightMembers: 0
                }
            };
        }
        return {
            preferredPlacement: node.preferredPlacement || 'left',
            stats: {
                leftLegVolume: node.leftLegVolume || 0,
                rightLegVolume: node.rightLegVolume || 0,
                leftMembers: node.leftDescendantCount || 0,
                rightMembers: node.rightDescendantCount || 0
            }
        };
    }

    async updateLegSettings(userId, preferredPlacement) {
        const node = await GenealogyRepository.findByUserId(userId, { lean: false });
        if (!node) throw new ApiError(404, 'You must be in the genealogy tree to update placement settings');

        node.preferredPlacement = preferredPlacement;
        await node.save();
        return { preferredPlacement: node.preferredPlacement };
    }
}

module.exports = new GenealogyService();
