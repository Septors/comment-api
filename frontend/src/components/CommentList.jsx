import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import CommentForm from "./CommentForm.jsx";

export default function CommentList() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [replyTo, setReplyTo] = useState(null);
  const [filtered, setFiltered] = useState(false);

  const fetchLifoComments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/comments");
      setComments(res.data);
    } catch (err) {
      setError("Не удалось загрузить комментарии");
    } finally {
      setLoading(false);
    }
  };


  const fetchFilteredComments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/comments", {
        params: {
          page,
          limit: 25,
          sortBy: sortField,
          orderBy: sortOrder,
        },
      });
      setComments(res.data);
    } catch (err) {
      setError("Не удалось загрузить комментарии");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLifoComments();
  }, []);


  useEffect(() => {
    if (filtered && sortField) {
      fetchFilteredComments();
    }
  }, [sortField, sortOrder, page]);


  const handleSortChange = (field) => {
    setSortField(field);
    setSortOrder((prev) => (sortField === field ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setPage(1);
    setFiltered(true);
  };


  const handleReply = (commentId) => {
    setReplyTo(commentId);
  };


  const renderComment = (comment, isReply = false) => (
    <div
      key={comment.id}
      className={"comment" + (isReply ? " reply" : "")}
      style={{ marginLeft: isReply ? 30 : 0 }}
    >
      <div>
        <strong>{comment.userName}</strong> ({comment.email})
      </div>
      <div>{comment.text}</div>

      {comment.filePath && (
        <div>
          {comment.filePath.endsWith(".txt") ? (
            <a href={`http://localhost:5000/${comment.filePath}`} target="_blank" rel="noreferrer">
              Скачать файл
            </a>
          ) : (
            <img
              src={`http://localhost:5000/${comment.filePath}`}
              alt="Прикрепленный файл"
              style={{ maxWidth: "300px", marginTop: "10px" }}
            />
          )}
        </div>
      )}

      <button onClick={() => handleReply(comment.id)}>Ответить</button>


      {replyTo === comment.id && (
        <CommentForm
          parentId={comment.id}
          onCommentSent={() => {
            setReplyTo(null);
            filtered ? fetchFilteredComments() : fetchLifoComments();
          }}
        />
      )}


      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}

      <hr />
    </div>
  );

  return (
    <div className="comment-list">
      <div className="filters">
        <label>Сортировка:</label>
        <button onClick={() => handleSortChange("userName")}>Имя</button>
        <button onClick={() => handleSortChange("email")}>Email</button>
        <button onClick={() => handleSortChange("createdAt")}>Дата</button>
      </div>

      {loading && <div>Загрузка...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && comments.map((comment) => renderComment(comment))}

      {filtered && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Назад</button>
          <span>Страница: {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Вперёд</button>
        </div>
      )}
    </div>
  );
}
