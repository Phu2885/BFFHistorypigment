import type { FC } from "react";
import { Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchPigmentsList, setAbsorptionFilter } from "../slices/pigmentsSlice";
import "./InputField.css";

// Фильтр по коэффициенту поглощения: значение хранится в Redux
export const InputField: FC = () => {
  const dispatch = useAppDispatch();
  const { absorptionFilter, loading } = useAppSelector((s) => s.pigments);
  const currentVal = absorptionFilter ? parseFloat(absorptionFilter) : 1.0;

  return (
    <div className="inputField">
      <div className="inputFieldHeader">
        <span className="inputFieldLabel">ФИЛЬТР ПОГЛОЩЕНИЯ (A ≤ {currentVal.toFixed(2)})</span>
      </div>

      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.02"
        className="filterSlider"
        value={currentVal}
        disabled={loading}
        onChange={(e) => dispatch(setAbsorptionFilter(e.target.value))}
      />

      <Button disabled={loading} className="searchBtn" onClick={() => dispatch(fetchPigmentsList())}>
        {loading ? "ПОИСК..." : "ПРИМЕНИТЬ ФИЛЬТР"}
      </Button>
    </div>
  );
};

export default InputField;
