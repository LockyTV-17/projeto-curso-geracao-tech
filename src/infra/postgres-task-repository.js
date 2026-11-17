export function createPostgresTaskRepository(pool) {
  return {
    async create(title) {
      const { rows } = await pool.query(
        'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done, created_at', [title]
      );
      return rows[0];
    },
    async list() {
      const { rows } = await pool.query(
        'SELECT id, title, done, created_at FROM tasks ORDER BY id DESC'
      );
      return rows;
    },
    async complete(id) {
      const { rows } = await pool.query(
        'UPDATE tasks SET done = TRUE WHERE id = $1 RETURNING id, title, done, created_at', [id]
      );
      return rows[0] ?? null;
    }
  };
}
