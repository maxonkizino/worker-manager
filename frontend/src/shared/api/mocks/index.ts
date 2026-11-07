export async function enableMocking() {
  if (import.meta.env.PROD) {
    return;
  }

  // Моки отключены - просто возвращаемся
  return;
}
