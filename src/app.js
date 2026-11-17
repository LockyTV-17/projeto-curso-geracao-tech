import express from 'express';

export function createApp(taskService, logger) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => logger.info({ method: req.method, path: req.path, status: res.statusCode, duration_ms: Date.now() - started }, 'request'));
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/metrics', (_req, res) => res.type('text/plain').send('api_up 1\n'));
  app.get('/tasks', async (_req, res, next) => {
    try { res.json(await taskService.list()); } catch (error) { next(error); }
  });
  app.post('/tasks', async (req, res, next) => {
    try { res.status(201).json(await taskService.create(req.body?.title)); } catch (error) { next(error); }
  });
  app.patch('/tasks/:id/complete', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido.' });
    try { res.json(await taskService.complete(id)); } catch (error) { next(error); }
  });
  app.use((error, _req, res, _next) => {
    const status = error.message === 'Tarefa não encontrada.' ? 404 : 400;
    logger.error({ err: error }, 'request failed');
    res.status(status).json({ error: error.message || 'Erro interno.' });
  });
  return app;
}
