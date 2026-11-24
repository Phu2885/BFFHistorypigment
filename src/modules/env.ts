// Режим сборки и базовый адрес приложения.
// npm run build:pages собирает приложение с mode "pages" для GitHub Pages:
// там нет бэкенда, поэтому работают только mock-данные гостя.
export const IS_PAGES = import.meta.env.MODE === "pages";

// "/" при локальном запуске и "/BFFHistorypigment/" на GitHub Pages (vite.config.ts → base)
export const BASE_URL = import.meta.env.BASE_URL;

// Путь к файлу из public/ с учётом базового адреса
export const assetUrl = (path: string) => `${BASE_URL}${path.replace(/^\//, "")}`;
