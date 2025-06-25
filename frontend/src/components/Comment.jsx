import React, { useState } from "react";

export default function Comment({ comment }) {
  const [showChildren, setShowChildren] = useState(false);

  return (
    <div className="comment">
      <b>{comment.userName}</b> ({comment.email})<br />
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
      {comment.filePath && (
        <div>
          {comment.fileType?.startsWith("image") ? (
            <img
              src={`http://localhost:5000/${comment.filePath}`}
              alt="comment file"
              style={{ maxWidth: 320, maxHeight: 240 }}
            />
          ) : (
            <a href={`http://localhost:5000/${comment.filePath}`} target="_blank" rel="noreferrer">
              Скачать файл
            </a>
          )}
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <button onClick={() => setShowChildren(!showChildren)}>
          {showChildren ? "Скрыть ответы" : `Показать ответы (${comment.replies.length})`}
        </button>
      )}

      {showChildren && comment.replies && (
        <div className="comment-children">
          {comment.replies.map(child => (
            <Comment key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}
