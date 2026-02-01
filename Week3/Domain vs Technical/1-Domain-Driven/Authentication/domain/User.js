// Domain Model - User Entity
class User {
    constructor(id, email, password, firstName, lastName, createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdAt = createdAt;
    }

    // Domain logic
    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}

module.exports = User;
