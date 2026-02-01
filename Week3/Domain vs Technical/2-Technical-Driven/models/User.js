// Model - User Entity
class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.firstName = data.firstName || data.first_name;
        this.lastName = data.lastName || data.last_name;
        this.createdAt = data.createdAt || data.created_at;
    }

    // Helper methods
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            createdAt: this.createdAt
        };
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }
}

module.exports = User;
