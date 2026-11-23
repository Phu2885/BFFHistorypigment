import axios from "axios";

// Авторизация и деавторизация — только axios, без кодогенерации и thunk.
// Результат вручную передаётся в Redux (userSlice) из компонентов.
export const TOKEN_KEY = "access_token";

export interface AuthResult {
  access_token: string;
  user_id?: number;
}

export const loginRequest = async (login: string, password: string) => {
  const { data } = await axios.post<AuthResult>("/api/users/login", { login, password });
  return data;
};

export const registerRequest = async (login: string, password: string) => {
  const { data } = await axios.post<AuthResult>("/api/users/register", {
    login,
    password,
    name: login,
  });
  return data;
};

export const logoutRequest = async (token: string) => {
  await axios.post("/api/users/logout", null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
