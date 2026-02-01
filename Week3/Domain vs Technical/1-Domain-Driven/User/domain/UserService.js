// Domain Service - User Management Business Logic
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateUserProfile(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Business validation
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateData.email);
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }

        return await this.userRepository.update(userId, updateData);
    }

    async deleteUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.delete(userId);
    }
}

module.exports = UserService;
