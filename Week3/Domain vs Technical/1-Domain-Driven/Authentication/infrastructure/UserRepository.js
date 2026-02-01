// Infrastructure Layer - Data Access
class UserRepository {
    constructor(database) {
        this.db = database;
    }

    async findByEmail(email) {
        // Database query logic
        return await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    async findById(id) {
        return await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    }

    async create(userData) {
        const { email, password, firstName, lastName } = userData;
        const result = await this.db.query(
            'INSERT INTO users (email, password, first_name, last_name, created_at) VALUES (?, ?, ?, ?, NOW())',
            [email, password, firstName, lastName]
        );
        return { id: result.insertId, ...userData };
    }

    async update(id, userData) {
        await this.db.query('UPDATE users SET ? WHERE id = ?', [userData, id]);
        return await this.findById(id);
    }

    async delete(id) {
        await this.db.query('DELETE FROM users WHERE id = ?', [id]);
    }
}

module.exports = UserRepository;
