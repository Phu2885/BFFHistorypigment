import type { FC } from "react";
import { Spinner } from "react-bootstrap";
import "./LoadingOverlay.css";

export const LoadingOverlay: FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <div className="loadingOverlay" role="status" aria-live="polite">
      <Spinner animation="border" style={{ color: "var(--gold)" }} />
      <span>Загрузка…</span>
    </div>
  ) : null;

export default LoadingOverlay;
