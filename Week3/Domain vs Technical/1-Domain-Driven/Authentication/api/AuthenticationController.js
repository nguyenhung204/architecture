// API Layer - HTTP Controllers
class AuthenticationController {
    constructor(authenticationService) {
        this.authService = authenticationService;
    }

    async register(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const user = await this.authService.register(email, password, firstName, lastName);
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName
                    },
                    token: result.token
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AuthenticationController;
