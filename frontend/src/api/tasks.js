const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Could not reach the API at ${API_URL}. Check that the backend is running.`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export function getTasks() {
  return request('/tasks');
}

export function createTask({ title, status }) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, status }),
  });
}

export function updateTask(id, changes) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
