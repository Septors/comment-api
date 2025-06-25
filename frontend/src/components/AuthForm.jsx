import React, { useState } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthForm() {
  const { login, logout, user } = useAuth();

  const [mode, setMode] = useState("login"); // login или register
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const url = mode === "login" ? "/user/login" : "/user/register";
      const dataToSend =
        mode === "register"
          ? { userName, email, password, confirmPassword }
          : { email, password };

      const res = await api.post(url, dataToSend);

      login({
        accessToken: res.data.accessToken,
        userName: res.data.user.userName,
        email: res.data.user.email,
      });

      setUserName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка");
    }
  }

  if (user) {
    return (
      <div className="comment">
        <p>Привет, <b>{user.userName}</b>!</p>
        <p>Email: {user.email}</p>
        <button onClick={logout} type="button">Выйти</button>
        <hr />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="comment">
      {mode === "register" && (
        <input
          placeholder="User name"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {mode === "register" && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      )}
      {error && <div className="error">{error}</div>}
      <button type="submit">{mode === "login" ? "Войти" : "Зарегистрироваться"}</button>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
      </button>
    </form>
  );
}
