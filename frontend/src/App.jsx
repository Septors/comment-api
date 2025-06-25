import React from "react";
import { useAuth } from "./context/AuthContext.jsx";
import AuthForm from "./components/AuthForm.jsx";
import CommentForm from "./components/CommentForm.jsx";
import CommentList from "./components/CommentList.jsx";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: 20 }}>
      {!user && (
        <div style={{ marginBottom: 20 }}>
          <AuthForm />
        </div>
      )}

      {user && (
        <div style={{ marginBottom: 20 }}>
          <p>👋 Привіт, <b>{user.userName}</b> ({user.email})</p>
          <button onClick={logout}>Вийти</button>
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <CommentForm />
      </div>

      <CommentList />
    </div>
  );
}
