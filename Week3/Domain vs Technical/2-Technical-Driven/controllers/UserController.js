// Controller Layer - User Profile
class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await this.userService.getUserById(userId);
            
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
            const user = await this.userService.updateUser(userId, updateData);
            
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

    async deleteProfile(req, res) {
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
