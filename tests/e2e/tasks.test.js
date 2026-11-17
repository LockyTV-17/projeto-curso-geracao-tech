import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import { URL } from 'node:url';
import pino from 'pino';
import { createApp } from '../../src/app.js';
import { createTaskService } from '../../src/domain/task-service.js';
import { createPostgresTaskRepository } from '../../src/infra/postgres-task-repository.js';

const insertedIds = [];
let pool;
let server;
let baseUrl;

async function call(path, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

describe('ponta a ponta: HTTP, domínio e PostgreSQL reais', () => {
  beforeAll(async () => {
    const connectionString = process.env.TEST_DATABASE_URL;
    if (!connectionString) throw new Error('Use o Docker Compose de testes ou informe TEST_DATABASE_URL para tarefas_test.');
    if (new URL(connectionString).pathname !== '/tarefas_test') throw new Error('O E2E exige o banco isolado tarefas_test.');
    pool = new pg.Pool({ connectionString });
    const db = await pool.query('SELECT current_database() AS name');
    expect(db.rows[0].name).toBe('tarefas_test');
    const app = createApp(createTaskService(createPostgresTaskRepository(pool)), pino({ level: 'silent' }));
    server = await new Promise((resolve) => {
      const listener = app.listen(0, '0.0.0.0', () => resolve(listener));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    if (insertedIds.length) {
      await pool.query('DELETE FROM tasks WHERE id = ANY($1::bigint[])', [insertedIds.splice(0)]);
    }
  });

  afterAll(async () => {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (pool) await pool.end();
  });

  it('cria, lista, conclui e confirma persistência por SQL', async () => {
    expect(await call('/health')).toEqual({ status: 200, body: { status: 'ok' } });
    const created = await call('/tasks', 'POST', { title: '  Tarefa E2E  ' });
    if (created.body.id) insertedIds.push(created.body.id);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ title: 'Tarefa E2E', done: false });
    expect(Number.isNaN(Date.parse(created.body.created_at))).toBe(false);
    const listed = await call('/tasks');
    expect(listed.status).toBe(200);
    expect(listed.body).toContainEqual(created.body);
    for (let attempt = 0; attempt < 2; attempt++) {
      const completed = await call(`/tasks/${created.body.id}/complete`, 'PATCH');
      expect(completed.status).toBe(200);
      expect(completed.body).toMatchObject({ id: created.body.id, done: true });
    }
    const saved = await pool.query('SELECT title, done FROM tasks WHERE id = $1', [created.body.id]);
    expect(saved.rows).toEqual([{ title: 'Tarefa E2E', done: true }]);
  });

  it('aceita 200 caracteres e rejeita 201 sem gravar no banco', async () => {
    const created = await call('/tasks', 'POST', { title: 'x'.repeat(200) });
    if (created.body.id) insertedIds.push(created.body.id);
    expect(created.status).toBe(201);
    expect(created.body.title).toHaveLength(200);
    const before = await pool.query('SELECT count(*) AS total FROM tasks');
    const invalid = await call('/tasks', 'POST', { title: 'x'.repeat(201) });
    expect(invalid.status).toBe(400);
    const after = await pool.query('SELECT count(*) AS total FROM tasks');
    expect(after.rows).toEqual(before.rows);
  });

  it('retorna 404 para um ID confirmado como inexistente no banco', async () => {
    const missing = '922337203685477';
    const found = await pool.query('SELECT id FROM tasks WHERE id = $1', [missing]);
    expect(found.rows).toEqual([]);
    expect(await call(`/tasks/${missing}/complete`, 'PATCH')).toEqual({
      status: 404, body: { error: 'Tarefa não encontrada.' }
    });
  });
});
