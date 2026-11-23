import { Api } from "./Api";

// Экземпляр сгенерированного клиента (axios). baseURL "/" — запросы идут
// на тот же origin, а Vite проксирует /api на бэкенд (обход CORS).
export const api = new Api<string>({
  baseURL: "/",
  // securityWorker подставляет JWT в методы с пометкой secure
  securityWorker: (token) =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
});
