import { describe, expect, it, vi } from 'vitest';
import { createTaskService } from '../src/domain/task-service.js';

function setup() {
  const repository = {
    create: vi.fn(async (title) => ({ id: '1', title, done: false })),
    list: vi.fn(async () => []),
    complete: vi.fn(async (id) => ({ id, title: 'Estudar', done: true }))
  };
  return { repository, service: createTaskService(repository) };
}

describe('limites do domínio', () => {
  it.each([undefined, null, 42, false, {}, [], '', '   ', '\n\t'])('rejeita título inválido: %j', async (title) => {
    const { service, repository } = setup();
    await expect(service.create(title)).rejects.toThrow('O título é obrigatório.');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it.each([1, 200])('aceita título com %i caracteres', async (length) => {
    const { service } = setup();
    const title = 'a'.repeat(length);
    await expect(service.create(title)).resolves.toMatchObject({ title, done: false });
  });

  it('remove espaços antes de avaliar o limite', async () => {
    const { service, repository } = setup();
    await service.create(`  ${'a'.repeat(200)}  `);
    expect(repository.create).toHaveBeenCalledWith('a'.repeat(200));
  });

  it('rejeita 201 caracteres sem chamar a persistência', async () => {
    const { service, repository } = setup();
    await expect(service.create('a'.repeat(201))).rejects.toThrow('no máximo 200');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('retorna lista vazia quando não há tarefas', async () => {
    const { service, repository } = setup();
    await expect(service.list()).resolves.toEqual([]);
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it('retorna a tarefa concluída', async () => {
    const { service, repository } = setup();
    await expect(service.complete(1)).resolves.toMatchObject({ id: 1, done: true });
    expect(repository.complete).toHaveBeenCalledWith(1);
  });
});
