const API_BASE_URL = "https://audrina-subultimate-ghostily.ngrok-free.dev";

// Global AJAX defaults (requires jQuery)
$.ajaxSetup({
  xhrFields: {
    withCredentials: true,
  },
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${API_BASE_URL}${normalizedPath}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

