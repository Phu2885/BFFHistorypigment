import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { TabBar } from "./components/TabBar";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { useAppSelector } from "./store";
import "./MobileApp.css";

export const AppLayout: FC = () => {
  const pigmentsLoading = useAppSelector((s) => s.pigments.loading);
  const draftLoading = useAppSelector((s) => s.pigmentDraft.loading);

  return (
    <div className="appShell">
      <main className="appContent">
        <Outlet />
      </main>
      <TabBar />
      {/* Анимация во время запроса блокирует все кнопки пользователя */}
      <LoadingOverlay show={pigmentsLoading || draftLoading} />
    </div>
  );
};
