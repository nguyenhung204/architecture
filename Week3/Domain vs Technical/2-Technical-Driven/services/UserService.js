// Service Layer - User Management Business Logic
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Remove sensitive data
        delete user.password;
        return user;
    }

    async getUserByEmail(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        
        delete user.password;
        return user;
    }

    async updateUser(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate email uniqueness
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(updateData.email);
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }

        const updatedUser = await this.userRepository.update(userId, updateData);
        delete updatedUser.password;
        return updatedUser;
    }

    async deleteUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.userRepository.delete(userId);
    }

    async getAllUsers() {
        const users = await this.userRepository.findAll();
        // Remove passwords
        return users.map(user => {
            delete user.password;
            return user;
        });
    }
}

module.exports = UserService;
