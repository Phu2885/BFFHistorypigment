// Адреса медиа: ключи из БД лежат в бакете MinIO historypigments,
// а Vite проксирует /minio -> http://localhost:9000 (второй маршрут прокси для S3).
import { assetUrl } from "./env";

export const MINIO_BUCKET = "historypigments";
export const DEFAULT_IMAGE = assetUrl("assets/images/placeholder.svg");

export const mediaUrl = (key?: string | null): string | null => {
  if (!key) return null;
  if (key.startsWith("/assets/")) return assetUrl(key); // локальные файлы mock-данных (с учётом base на Pages)
  if (key.startsWith("http") || key.startsWith("/")) return key; // уже готовые URL
  return `/minio/${MINIO_BUCKET}/${key}`;
};
