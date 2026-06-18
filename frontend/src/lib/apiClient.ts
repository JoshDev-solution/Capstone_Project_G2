export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("vcms_token");

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const response = await fetch(`${baseUrl}/api${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized (e.g., redirect to login)
    localStorage.removeItem("vcms_token");
    localStorage.removeItem("vcms_user");
    window.location.href = "/login";
  }

  return response;
};
