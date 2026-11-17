import pg from 'pg';
import pino from 'pino';
import { createApp } from './app.js';
import { createTaskService } from './domain/task-service.js';
import { createPostgresTaskRepository } from './infra/postgres-task-repository.js';

const { Pool } = pg;
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = createApp(createTaskService(createPostgresTaskRepository(pool)), logger);
const port = Number(process.env.PORT || 3000);

app.listen(port, () => logger.info({ port }, 'API de tarefas pronta'));
