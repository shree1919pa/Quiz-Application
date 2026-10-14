const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
export const baseUrl = API_BASE_URL;

export const apiFetch = async (path, options = {}) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = localStorage.getItem("token");

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });

  const data = await response.json().catch(() => null);

  // Unauthorized
  if (response.status === 401) {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.href = "/";

    throw new Error(
      data?.message ||
      "Your session has expired. Please login again."
    );

  }

  // Forbidden
  if (response.status === 403) {

    throw new Error(
      data?.message ||
      "You do not have permission to access this resource."
    );

  }

  if (!response.ok) {

    throw new Error(
      data?.message ||
      response.statusText ||
      "Request failed"
    );

  }

  return data;

};