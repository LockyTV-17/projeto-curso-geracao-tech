export function createTaskService(repository) {
  return {
    async create(title) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        throw new Error('O título é obrigatório.');
      }
      if (title.trim().length > 200) {
        throw new Error('O título deve ter no máximo 200 caracteres.');
      }
      return repository.create(title.trim());
    },
    list() {
      return repository.list();
    },
    async complete(id) {
      const task = await repository.complete(id);
      if (!task) throw new Error('Tarefa não encontrada.');
      return task;
    }
  };
}
