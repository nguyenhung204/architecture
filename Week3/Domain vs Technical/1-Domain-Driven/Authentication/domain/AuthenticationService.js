// Domain Service - Authentication Business Logic
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthenticationService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(email, password, firstName, lastName) {
        // Business logic validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Check if user exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });

        return user;
    }

    async login(email, password) {
        // Find user
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        return { user, token };
    }
}

module.exports = AuthenticationService;
