import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import pigmentsReducer from "./slices/pigmentsSlice";
import pigmentDraftReducer from "./slices/pigmentDraftSlice";
import userReducer from "./slices/userSlice";

// Глобальное хранилище. redux-thunk подключён по умолчанию в configureStore.
export const store = configureStore({
  reducer: {
    pigments: pigmentsReducer,
    pigmentDraft: pigmentDraftReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
