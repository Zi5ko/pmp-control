const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value));

export function getBackendBaseUrl() {
  const apiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "");
  if (apiUrl) {
    return apiUrl.replace(/\/api$/i, "");
  }

  const backendUrl = trimTrailingSlash(import.meta.env.VITE_BACKEND_URL || "");
  if (backendUrl) {
    return backendUrl;
  }

  return "http://localhost:3000";
}

export function buildUploadsUrl(filePath = "") {
  if (isAbsoluteUrl(filePath)) {
    return filePath;
  }

  const normalizedPath = String(filePath)
    .replace(/^\\+/, "")
    .replace(/^\/+/, "")
    .replace(/^uploads[\\/]/, "");

  return `${getBackendBaseUrl()}/uploads/${normalizedPath}`;
}

export function buildBackendUrl(path = "") {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = String(path).replace(/^\/+/, "");
  return `${getBackendBaseUrl()}/${normalizedPath}`;
}
