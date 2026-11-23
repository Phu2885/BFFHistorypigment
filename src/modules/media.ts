// Адреса медиа: ключи из БД лежат в бакете MinIO historypigments,
// а Vite проксирует /minio -> http://localhost:9000 (второй маршрут прокси для S3).
export const MINIO_BUCKET = "historypigments";
export const DEFAULT_IMAGE = "/assets/images/placeholder.svg";

export const mediaUrl = (key?: string | null): string | null => {
  if (!key) return null;
  if (key.startsWith("http") || key.startsWith("/")) return key; // mock-данные и уже готовые URL
  return `/minio/${MINIO_BUCKET}/${key}`;
};
