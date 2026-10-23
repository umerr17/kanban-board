# Kanban Task Board

A deliberately small three-tier application for practicing full-stack workflows:

- **Frontend:** React, Vite, and Tailwind CSS
- **Backend:** Node.js, Express, and CORS
- **Database:** PostgreSQL accessed with `pg`

The board has three fixed columns, an add-task form, forward/backward status
movement, deletion, refresh, and visible loading/error states.

## Folder structure

```text
kanban-board/
├── backend/
│   ├── .env.example
│   ├── db/
│   │   └── init.sql
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── tasks.js
│       ├── components/
│       │   ├── KanbanColumn.jsx
│       │   ├── TaskCard.jsx
│       │   └── TaskForm.jsx
│       ├── constants/
│       │   └── taskStatuses.js
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
└── .gitignore
```

## Prerequisites

- Node.js `20.19+` (or `22.12+`)
- PostgreSQL `14+`

## 1. Prepare PostgreSQL

Create a database and apply the schema from the repository root:

```bash
createdb kanban_board
psql -d kanban_board -f backend/db/init.sql
```

If you prefer an explicit connection URL:

```bash
psql "postgresql://postgres:postgres@localhost:5432/kanban_board" \
  -f backend/db/init.sql
```

The script creates the `tasks` table and its index. It is safe to run again.

## 2. Run the backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL in .env to match your PostgreSQL credentials.
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default.

Environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | HTTP port; defaults to `5000` |
| `CORS_ORIGIN` | No | Comma-separated allowed origins; defaults to all origins |

## 3. Run the frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

`VITE_API_URL` controls the backend base URL. If it is omitted, the client
falls back to `http://localhost:5000`.

## REST API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/tasks` | List tasks, oldest first |
| `GET` | `/tasks/:id` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task's title and/or status |
| `DELETE` | `/tasks/:id` | Delete a task |

Request and response bodies use JSON.

Create a task:

```json
{
  "title": "Write the release notes",
  "status": "To Do"
}
```

`status` is optional on creation and defaults to `"To Do"`. Valid values are
`"To Do"`, `"In Progress"`, and `"Done"`. `PUT` accepts either `title`,
`status`, or both.

## Production build

```bash
cd frontend
npm run build
```

The static output is written to `frontend/dist`. Serve that directory with the
web server of your choice and point `VITE_API_URL` at the deployed API when
building.
