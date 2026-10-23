-- Run this script once against the kanban_board database.
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'To Do',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_title_not_blank CHECK (BTRIM(title) <> ''),
  CONSTRAINT tasks_status_valid CHECK (status IN ('To Do', 'In Progress', 'Done'))
);

CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks (created_at, id);
