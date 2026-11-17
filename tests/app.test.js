import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('API de tarefas', () => {
  const logger = { info: vi.fn(), error: vi.fn() };
  it('cria e lista uma tarefa', async () => {
    const rows = [];
    const service = {
      create: vi.fn(async (title) => { const task = { id: 1, title, done: false }; rows.push(task); return task; }),
      list: vi.fn(async () => rows),
      complete: vi.fn(async (id) => rows.find((task) => task.id === id) ?? null)
    };
    const app = createApp(service, logger);
    await request(app).post('/tasks').send({ title: 'Ler' }).expect(201).expect(({ body }) => expect(body.title).toBe('Ler'));
    await request(app).get('/tasks').expect(200).expect(({ body }) => expect(body).toHaveLength(1));
  });
  it('valida o identificador ao concluir', async () => {
    const app = createApp({ create: vi.fn(), list: vi.fn(), complete: vi.fn() }, logger);
    await request(app).patch('/tasks/abc/complete').expect(400);
  });
});
