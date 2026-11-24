import "./PigmentsListPage.css";
import { useEffect, type FC } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { InputField } from "../components/InputField";
import { PigmentCard } from "../components/PigmentCard";
import { ROUTES } from "../Routes";
import { useAppDispatch, useAppSelector } from "../store";
import { deletePigment, fetchPigmentsList } from "../slices/pigmentsSlice";
import { IS_PAGES } from "../modules/env";

export const PigmentsListPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, loading, isMock, error } = useAppSelector((s) => s.pigments);
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);

  useEffect(() => {
    dispatch(fetchPigmentsList()); // thunk с текущим фильтром из Redux
  }, [dispatch, isAuthenticated]);

  return (
    <div className="tiles-page">
      <h2 className="section-title">Каталог пигментов</h2>

      <InputField />

      {/* на GitHub Pages mock-данные — обычный режим, плашку не показываем */}
      {isMock && !IS_PAGES && (
        <Alert variant="dark" className="mock-alert">
          Сервис недоступен — показаны mock-данные
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="tiles-grid">
        {list.map((item) => (
          <PigmentCard
            key={item.id}
            {...item}
            canDelete={isAuthenticated && item.is_creator === 1}
            disabled={loading}
            onClick={() => navigate(`${ROUTES.FEED}/${item.id}`)}
            onDelete={() => dispatch(deletePigment(item.id))}
          />
        ))}
      </div>

      {!loading && !list.length && <p className="empty-text">Пигменты не найдены</p>}
    </div>
  );
};

export default PigmentsListPage;
