import { describe, expect, it, vi } from 'vitest';
import { createTaskService } from '../src/domain/task-service.js';

describe('serviço de tarefas', () => {
  it('cria tarefa com título limpo', async () => {
    const repository = { create: vi.fn(async (title) => ({ id: 1, title })), list: vi.fn(), complete: vi.fn() };
    const service = createTaskService(repository);
    await expect(service.create('  Estudar  ')).resolves.toEqual({ id: 1, title: 'Estudar' });
    expect(repository.create).toHaveBeenCalledWith('Estudar');
  });
  it('rejeita título vazio', async () => {
    const service = createTaskService({ create: vi.fn(), list: vi.fn(), complete: vi.fn() });
    await expect(service.create('   ')).rejects.toThrow('O título é obrigatório.');
  });
  it('rejeita título longo', async () => {
    const service = createTaskService({ create: vi.fn(), list: vi.fn(), complete: vi.fn() });
    await expect(service.create('x'.repeat(201))).rejects.toThrow('no máximo 200');
  });
  it('avisa quando a tarefa não existe', async () => {
    const service = createTaskService({ create: vi.fn(), list: vi.fn(), complete: vi.fn(async () => null) });
    await expect(service.complete(999)).rejects.toThrow('Tarefa não encontrada.');
  });
});
