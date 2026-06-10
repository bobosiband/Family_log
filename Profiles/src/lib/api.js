const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getToken() {
  try {
    const raw = localStorage.getItem('famlogs_session');
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('famlogs_session');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: (path, body, options) =>
    request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (path, options) => request(path, { method: 'DELETE', ...options }),
};
