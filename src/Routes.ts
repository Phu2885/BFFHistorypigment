// Адреса страниц по теме — как в ЛР2 (SSR-шаблоны pigments-database*)
export const ROUTES = {
  TILES: "/pigments-database",
  FEED: "/pigments-database-reconstruction",
  ADD: "/pigment-database-analysis",
  LOGIN: "/pigments-database-login",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: Record<RouteKeyType, string> = {
  TILES: "Плитка",
  FEED: "Лента",
  ADD: "Добавление",
  LOGIN: "Вход",
};
