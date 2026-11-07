export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  // USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === "true" || true, // по умолчанию моки включены для разработки
};
