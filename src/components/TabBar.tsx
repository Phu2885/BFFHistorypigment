import "./TabBar.css";
import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { useAppDispatch, useAppSelector } from "../store";
import { resetUser } from "../slices/userSlice";
import { resetPigmentsFilter, fetchPigmentsList } from "../slices/pigmentsSlice";
import { resetPigmentDraft } from "../slices/pigmentDraftSlice";
import { logoutRequest, TOKEN_KEY } from "../modules/authApi";
import { api } from "../api";
import { IS_PAGES } from "../modules/env";

export const TabBar: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, login } = useAppSelector((s) => s.user);

  // ROUTES.TILES — префикс адреса ленты, поэтому сравниваем по сегменту пути
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  // Выход: axios без thunk, затем состояние в Redux вручную; фильтр сбрасывается
  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      if (token) await logoutRequest(token);
    } catch {
      // токен мог уже истечь — всё равно переходим в режим гостя
    }
    localStorage.removeItem(TOKEN_KEY);
    api.setSecurityData(null);
    dispatch(resetUser());
    dispatch(resetPigmentsFilter());
    dispatch(resetPigmentDraft());
    navigate(ROUTES.TILES);
    dispatch(fetchPigmentsList());
  };

  return (
    <nav className="bottom-nav">
      <button type="button" className={`nav-item ${isActive(ROUTES.FEED) ? "active" : ""}`}
        onClick={() => navigate(ROUTES.FEED)}>
        <span className="nav-icon">🎥</span>
        <span>{ROUTE_LABELS.FEED}</span>
      </button>

      {isAuthenticated && (
        <button type="button" className={`nav-item ${isActive(ROUTES.ADD) ? "active" : ""}`}
          onClick={() => navigate(ROUTES.ADD)}>
          <span className="nav-icon">➕</span>
          <span>{ROUTE_LABELS.ADD}</span>
        </button>
      )}

      <button type="button" className={`nav-item ${isActive(ROUTES.TILES) ? "active" : ""}`}
        onClick={() => navigate(ROUTES.TILES)}>
        <span className="nav-icon">📊</span>
        <span>{ROUTE_LABELS.TILES}</span>
      </button>

      {isAuthenticated ? (
        <button type="button" className="nav-item" onClick={handleLogout} title={login}>
          <span className="nav-icon">🚪</span>
          <span>Выход</span>
        </button>
      ) : (
        // На GitHub Pages нет бэкенда — вход недоступен, работают только mock-данные
        <button type="button" className={`nav-item ${isActive(ROUTES.LOGIN) ? "active" : ""} ${IS_PAGES ? "disabled" : ""}`}
          disabled={IS_PAGES} title={IS_PAGES ? "На GitHub Pages доступен только просмотр (mock)" : undefined}
          onClick={() => navigate(ROUTES.LOGIN)}>
          <span className="nav-icon">🔑</span>
          <span>{ROUTE_LABELS.LOGIN}</span>
        </button>
      )}
    </nav>
  );
};

export default TabBar;
