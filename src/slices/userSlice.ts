import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Состояние интерфейса после авторизации. Заполняется вручную (без thunk)
// после запросов axios в modules/authApi.ts.
interface UserState {
  login: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  login: "",
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<string>) {
      state.login = action.payload;
      state.isAuthenticated = true;
    },
    resetUser() {
      return initialState;
    },
  },
});

export const { setUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
