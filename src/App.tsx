import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { ROUTES } from "./Routes";
import { BASE_URL } from "./modules/env";
import PigmentsListPage from "./pages/PigmentsListPage";
import FeedPage from "./pages/FeedPage";
import AddPigmentPage from "./pages/AddPigmentPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    // basename: на GitHub Pages приложение открывается по адресу /BFFHistorypigment/
    <BrowserRouter basename={BASE_URL.replace(/\/$/, "") || "/"}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.TILES} element={<PigmentsListPage />} />
          <Route path={ROUTES.FEED} element={<FeedPage />} />
          <Route path={`${ROUTES.FEED}/:id`} element={<FeedPage />} />
          <Route path={ROUTES.ADD} element={<AddPigmentPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          {/* корень и неизвестные адреса ведут на плитку пигментов */}
          <Route path="*" element={<Navigate to={ROUTES.TILES} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
