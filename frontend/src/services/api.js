/**
 * Resolve the API base URL cleanly:
 * - Detects localhost / local network browser sessions and points to http://localhost:5000/api
 * - Ensures the URL always ends with the /api suffix without duplicate slashes
 */
export const resolveApiBaseUrl = () => {
  let raw = (import.meta.env.VITE_API_BASE_URL || "").trim();

  const isBrowser = typeof window !== "undefined" && window.location;
  const isLocalHost = isBrowser && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("172.")
  );

  // If developing locally and VITE_API_BASE_URL is pointing to a remote Render server or unset, use local backend
  if (!raw || (isLocalHost && raw.includes("onrender.com"))) {
    raw = "http://localhost:5000/api";
  }

  let clean = raw.replace(/\/+$/, "");
  if (!clean.endsWith("/api")) {
    clean = `${clean}/api`;
  }
  return clean;
};

export const API_BASE_URL = resolveApiBaseUrl();
export const baseUrl = API_BASE_URL;

/**
 * Robust API fetch wrapper:
 * - Automatically injects JWT Bearer token from localStorage
 * - Enforces a 15-second timeout to prevent indefinite "Loading / Signing in" states
 * - Handles JSON and non-JSON error responses gracefully
 * - Handles expired sessions without breaking login error display
 */
export const apiFetch = async (path, options = {}) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Prevent /api/api path duplication if caller passed a path already containing /api
  const cleanPath = normalizedPath.startsWith("/api/")
    ? normalizedPath.substring(4)
    : normalizedPath === "/api"
    ? ""
    : normalizedPath;

  const url = `${API_BASE_URL}${cleanPath}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 15 second request timeout to guarantee button loading states never freeze
  const timeoutMs = options.timeout || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      credentials: "include"
    });

    clearTimeout(timeoutId);

    // Safely parse JSON or text error response
    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      data = text ? { message: text } : null;
    }

    // 401 Unauthorized Handling
    if (response.status === 401) {
      const isAuthRoute = cleanPath.includes("/auth/login") || cleanPath.includes("/auth/register");
      const hadToken = Boolean(localStorage.getItem("token"));

      // Only redirect if an established session token expired during a protected request
      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        if (hadToken && typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname !== "/admin/login") {
          window.location.href = "/";
        }
      }

      throw new Error(
        data?.message ||
        (isAuthRoute ? "Invalid email or password." : "Your session has expired. Please login again.")
      );
    }

    // 403 Forbidden Handling
    if (response.status === 403) {
      throw new Error(
        data?.message ||
        "You do not have permission to perform this action."
      );
    }

    // General HTTP errors
    if (!response.ok) {
      throw new Error(
        data?.message ||
        response.statusText ||
        `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check that the backend server is running.");
    }

    if (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("fetch failed"))
    ) {
      throw new Error("Unable to connect to the backend server. Please verify the server is running on http://localhost:5000");
    }

    throw error;
  }
};