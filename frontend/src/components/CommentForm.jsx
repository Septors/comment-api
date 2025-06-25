import React, { useState, useEffect } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CommentForm({ onCommentSent }) {
  const { user } = useAuth();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [homePage, setHomePage] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); 

  const [captchaKey, setCaptchaKey] = useState(null);
  const [captchaImage, setCaptchaImage] = useState(null);
  const [captchaText, setCaptchaText] = useState(null);
  const [captchaInput, setCaptchaInput] = useState("");

  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) fetchCaptcha();
  }, [user]);


  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    // создаём URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get("/captcha");
      setCaptchaKey(res.data.captchaId);
      setCaptchaImage(res.data.captchaSvg);
      setCaptchaText(res.data.captchaText);
    } catch (e) {
      setError("Не удалось загрузить капчу");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    const formData = new FormData();

    if (user) {
      formData.append("userName", user.userName);
      formData.append("email", user.email);
    } else {
      if (!userName || !email) {
        setError("Пожалуйста, заполните все обязательные поля");
        setSending(false);
        return;
      }
      formData.append("userName", userName);
      formData.append("email", email);
      formData.append("captchaId", captchaKey);
      formData.append("captchaText", captchaInput);
    }

    if (homePage) formData.append("homePage", homePage);
    if (!text) {
      setError("Введите текст комментария");
      setSending(false);
      return;
    }
    formData.append("text", text);
    if (file) formData.append("file", file);

    try {
      const res = await api.post("/comments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserName("");
      setEmail("");
      setHomePage("");
      setText("");
      setFile(null);
      setCaptchaInput("");
      if (!user) fetchCaptcha();
      onCommentSent(res.data);
    } catch (err) {
      setError(err.response?.data?.message );
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment">
      {!user && (
        <>
          <input
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Home Page (optional)"
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}
          />
        </>
      )}
      <textarea
        placeholder="Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.txt"
          onChange={(e) => setFile(e.target.files[0])}
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        )}
      </div>

      {!user && captchaImage && (
        <div>
          <div dangerouslySetInnerHTML={{ __html: captchaImage }} style={{ marginBottom: "10px" }} />
          <input
            placeholder="Из-за отсутсвия редиса в хост версии,капча принимает любые значения без проверки"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#555" }}>
            Текст капчи (для отладки): {captchaText}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={sending}>
        {sending ? "Отправка..." : "Отправить комментарий"}
      </button>
    </form>
  );
}
