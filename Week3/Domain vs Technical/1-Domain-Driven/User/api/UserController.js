// API Layer - User Profile Controllers
class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id; // From auth middleware
            const user = await this.userService.getUserProfile(userId);
            
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            const user = await this.userService.updateUserProfile(userId, updateData);
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteAccount(req, res) {
        try {
            const userId = req.user.id;
            await this.userService.deleteUser(userId);
            
            res.status(200).json({
                success: true,
                message: 'Account deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = UserController;
