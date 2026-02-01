// Repository Layer - Data Access for User
class UserRepository {
    constructor(database) {
        this.db = database;
    }

    async findById(id) {
        return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    }

    async findByEmail(email) {
        return await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    async findAll() {
        return await this.db.query('SELECT * FROM users');
    }

    async create(userData) {
        const { email, password, firstName, lastName } = userData;
        const result = await this.db.query(
            'INSERT INTO users (email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, NOW())',
            [email, password, firstName, lastName]
        );
        
        return {
            id: result.insertId,
            email,
            firstName,
            lastName,
            createdAt: new Date()
        };
    }

    async update(id, userData) {
        const updates = [];
        const values = [];

        if (userData.email) {
            updates.push('email = ?');
            values.push(userData.email);
        }
        if (userData.firstName) {
            updates.push('first_name = ?');
            values.push(userData.firstName);
        }
        if (userData.lastName) {
            updates.push('last_name = ?');
            values.push(userData.lastName);
        }

        if (updates.length > 0) {
            values.push(id);
            await this.db.query(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        return await this.findById(id);
    }

    async delete(id) {
        await this.db.query('DELETE FROM users WHERE id = ?', [id]);
    }
}

module.exports = UserRepository;
