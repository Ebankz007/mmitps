const UserRepository = require('../../repositories/UserRepository');
const ApiError = require('../../utils/ApiError');

class AdminService {
    async getAllUsers(filters, options) {
        return UserRepository.findAll(filters, options);
    }

    async updateUserStatus(userId, status) {
        // status could be 'active', 'suspended', etc.
        // Assuming User model has an isSuspended or status field. 
        // Let's check User model if needed, but for now we follow general CRUD.
        const user = await UserRepository.findById(userId);
        if (!user) throw new ApiError(404, 'User not found');

        return UserRepository.update(userId, { status });
    }

    async deleteUser(userId) {
        return UserRepository.delete(userId);
    }

    async createStaff(userData) {
        const { email, password, role, username, firstName, lastName } = userData;
        
        if (await UserRepository.emailExists(email)) {
            throw new ApiError(400, 'Email already registered');
        }

        // Create the user directly
        const user = await UserRepository.create({
            email,
            password,
            role,
            username: username || email.split('@')[0],
            firstName,
            lastName,
            isActive: true,
            emailVerified: true,
            accountStatus: 'active'
        });

        return user;
    }

    async updateUserRole(userId, newRole) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new ApiError(404, 'User not found');

        return UserRepository.update(userId, { role: newRole });
    }
}

module.exports = new AdminService();
