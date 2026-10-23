import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import pg from 'pg';

const { Pool } = pg;

const PORT = Number(process.env.PORT) || 5000;
const TASK_STATUSES = ['To Do', 'In Progress', 'Done'];
const TASK_FIELDS = 'id, title, status, created_at';

if (!process.env.DATABASE_URL) {
  console.error(
    'Missing DATABASE_URL. Copy backend/.env.example to backend/.env and configure it.',
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

const app = express();

const configuredOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: configuredOrigins?.length ? configuredOrigins : '*',
  }),
);
app.use(express.json());

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getRequestBody(request) {
  if (
    !request.body ||
    typeof request.body !== 'object' ||
    Array.isArray(request.body)
  ) {
    throw httpError(400, 'A JSON object body is required.');
  }

  return request.body;
}

function parseId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw httpError(400, 'Task id must be a positive integer.');
  }

  return id;
}

function parseTitle(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw httpError(400, 'Title is required.');
  }

  const title = value.trim();

  if (title.length > 255) {
    throw httpError(400, 'Title must be 255 characters or fewer.');
  }

  return title;
}

function parseStatus(value) {
  if (!TASK_STATUSES.includes(value)) {
    throw httpError(400, `Status must be one of: ${TASK_STATUSES.join(', ')}.`);
  }

  return value;
}

app.get('/tasks', async (request, response) => {
  const { rows } = await pool.query(
    `SELECT ${TASK_FIELDS}
     FROM tasks
     ORDER BY created_at ASC, id ASC`,
  );

  response.json(rows);
});

app.get('/tasks/:id', async (request, response) => {
  const id = parseId(request.params.id);
  const { rows } = await pool.query(
    `SELECT ${TASK_FIELDS}
     FROM tasks
     WHERE id = $1`,
    [id],
  );

  if (!rows[0]) {
    throw httpError(404, 'Task not found.');
  }

  response.json(rows[0]);
});

app.post('/tasks', async (request, response) => {
  const body = getRequestBody(request);
  const title = parseTitle(body.title);
  const status = body.status === undefined ? 'To Do' : parseStatus(body.status);

  const { rows } = await pool.query(
    `INSERT INTO tasks (title, status)
     VALUES ($1, $2)
     RETURNING ${TASK_FIELDS}`,
    [title, status],
  );

  response.status(201).location(`/tasks/${rows[0].id}`).json(rows[0]);
});

app.put('/tasks/:id', async (request, response) => {
  const id = parseId(request.params.id);
  const body = getRequestBody(request);
  const assignments = [];
  const values = [];

  if (body.title !== undefined) {
    values.push(parseTitle(body.title));
    assignments.push(`title = $${values.length}`);
  }

  if (body.status !== undefined) {
    values.push(parseStatus(body.status));
    assignments.push(`status = $${values.length}`);
  }

  if (assignments.length === 0) {
    throw httpError(400, 'Provide at least one of "title" or "status".');
  }

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE tasks
     SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING ${TASK_FIELDS}`,
    values,
  );

  if (!rows[0]) {
    throw httpError(404, 'Task not found.');
  }

  response.json(rows[0]);
});

app.delete('/tasks/:id', async (request, response) => {
  const id = parseId(request.params.id);
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    throw httpError(404, 'Task not found.');
  }

  response.status(204).send();
});

app.use((request, response) => {
  response.status(404).json({
    error: `Route not found: ${request.method} ${request.originalUrl}`,
  });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'Request body must be valid JSON.' });
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({
    error: status >= 500 ? 'Internal server error.' : error.message,
  });
});

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    console.error('Could not connect to PostgreSQL:', error.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Kanban API listening on http://localhost:${PORT}`);
  });

  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`\n${signal} received. Closing the API...`);

    const forceExitTimer = setTimeout(() => {
      console.error('Shutdown timed out.');
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    server.close(async (error) => {
      if (error) {
        console.error('Failed to close the HTTP server:', error);
        process.exit(1);
      }

      try {
        await pool.end();
        process.exit(0);
      } catch (poolError) {
        console.error('Failed to close PostgreSQL pool:', poolError);
        process.exit(1);
      }
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
