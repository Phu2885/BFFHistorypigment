import "./Forms.css";
import { useState, type FC, type FormEvent } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../Routes";
import { api } from "../api";
import { loginRequest, registerRequest, TOKEN_KEY } from "../modules/authApi";
import { setUser } from "../slices/userSlice";
import { useAppDispatch } from "../store";

// Страница аутентификации: запрос через axios, состояние в Redux передаётся вручную
export const LoginPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async (mode: "login" | "register") => {
    if (!login || !password) {
      setError("Введите логин и пароль");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { access_token } =
        mode === "login" ? await loginRequest(login, password) : await registerRequest(login, password);
      localStorage.setItem(TOKEN_KEY, access_token); // JWT виден во вкладке Application
      api.setSecurityData(access_token); // для secure-методов сгенерированного API
      dispatch(setUser(login));
      navigate(ROUTES.TILES);
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? "Сервис авторизации недоступен");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    authenticate("login");
  };

  return (
    <div className="form-page">
      <h2 className="section-title">Вход</h2>
      <Form className="form-card" onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="login">
          <div className="form-label-gold">Логин</div>
          <Form.Control value={login} onChange={(e) => setLogin(e.target.value)} disabled={loading} autoComplete="username" />
        </Form.Group>
        <Form.Group controlId="password">
          <div className="form-label-gold">Пароль</div>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
        </Form.Group>
        <Button type="submit" className="searchBtn" disabled={loading}>
          {loading ? "ВХОД..." : "ВОЙТИ"}
        </Button>
        <button type="button" className="link-btn" disabled={loading} onClick={() => authenticate("register")}>
          Зарегистрироваться
        </button>
      </Form>
    </div>
  );
};

export default LoginPage;
