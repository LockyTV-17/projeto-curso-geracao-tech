import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTaskService } from '../src/domain/task-service.js';

function setup() {
  const rows = [];
  const repository = {
    async create(title) {
      const task = { id: String(rows.length + 1), title, done: false };
      rows.push(task);
      return task;
    },
    async list() { return rows; },
    async complete(id) {
      const task = rows.find((row) => row.id === String(id));
      if (!task) return null;
      task.done = true;
      return task;
    }
  };
  return createApp(createTaskService(repository), { info: vi.fn(), error: vi.fn() });
}

describe('integração HTTP com o domínio real', () => {
  it('cria, lista e conclui; repetir conclusão mantém o resultado', async () => {
    const app = setup();
    const created = await request(app).post('/tasks').send({ title: '  Estudar  ' }).expect(201);
    expect(created.body).toEqual({ id: '1', title: 'Estudar', done: false });
    await request(app).get('/tasks').expect(200).expect(({ body }) => expect(body).toEqual([created.body]));
    for (let attempt = 0; attempt < 2; attempt++) {
      await request(app).patch('/tasks/1/complete').expect(200).expect(({ body }) => expect(body.done).toBe(true));
    }
  });

  it.each([{}, { title: null }, { title: ' ' }, { title: 'a'.repeat(201) }])('rejeita criação inválida: %j', async (payload) => {
    const app = setup();
    const response = await request(app).post('/tasks').send(payload).expect(400);
    expect(response.body.error).toEqual(expect.any(String));
    await request(app).get('/tasks').expect(200).expect(({ body }) => expect(body).toEqual([]));
  });

  it.each(['abc', '0', '-1', '1.5', '9007199254740992'])('rejeita ID fora dos limites: %s', async (id) => {
    await request(setup()).patch(`/tasks/${id}/complete`).expect(400).expect({ error: 'ID inválido.' });
  });

  it('responde 404 para tarefa inexistente', async () => {
    await request(setup()).patch('/tasks/123/complete').expect(404).expect({ error: 'Tarefa não encontrada.' });
  });

  it('rejeita JSON malformado', async () => {
    const response = await request(setup()).post('/tasks').set('Content-Type', 'application/json').send('{').expect(400);
    expect(response.body.error).toEqual(expect.any(String));
  });
});
