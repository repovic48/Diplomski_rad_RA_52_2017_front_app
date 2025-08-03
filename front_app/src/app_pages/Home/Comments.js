import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import Rating from "react-rating";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editComment, setEditComment] = useState(null);
  const selectedRestaurantId = localStorage.getItem("selected_restaurant_id");

  const [replyComment, setReplyComment] = useState({
    id: "",
    author: "",
    restaurant_id: selectedRestaurantId,
    author_email: "",
    restaurant_rating: 0,
    comment_rating: 0,
    users_that_rated_comment: [],
    content: "",
    date: "",
    reply_to: null,
    delete_requested: false,
    deleted : false
  });

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    setUserEmail(email && email.trim() !== "" ? email : null);
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      axios
        .get(
          `http://localhost:8080/api/comment/getCommentsByRestaurantId/${selectedRestaurantId}`
        )
        .then((res) => {
          setComments(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching comments:", err);
          setLoading(false);
        });
    }
  }, [selectedRestaurantId]);

  const updateCommentOnServer = (updatedComment) => {
    axios
      .put(
        "http://localhost:8080/api/comment/updateComment/" + updatedComment.id,
        updatedComment
      )
      .catch((err) => {
        console.error("Error updating comment:", err);
      });
  };

  const handleVote = (id, delta) => {
    if (!userEmail) return;

    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === id) {
          if (comment.users_that_rated_comment.includes(userEmail)) return comment;

          const updatedComment = {
            ...comment,
            comment_rating: comment.comment_rating + delta,
            users_that_rated_comment: [
              ...comment.users_that_rated_comment,
              userEmail,
            ],
          };

          updateCommentOnServer(updatedComment);
          return updatedComment;
        }
        return comment;
      })
    );
  };

  const renderComment = (comment, indent = 0) => {
    const alreadyVoted = userEmail && comment.users_that_rated_comment.includes(userEmail);
    const replies = comments.filter((c) => c.reply_to === comment.id);

    return (
      <div
        key={comment.id}
        style={{
          width: "600px",
          maxWidth: "90vw",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          marginLeft: `${indent * 2}rem`,
          position: "relative",
          borderLeft: indent > 0 ? "2px solid #82b74b" : "none",
          paddingLeft: indent > 0 ? "1rem" : "0",
          borderBottom: "1px solid #ddd",
          borderTop: "1px solid #ddd",
          marginTop: "1rem",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          <span>{comment.author}</span>
          <span>{new Date(comment.date).toLocaleDateString()}</span>
        </div>

        {!comment.reply_to && (
          <div style={{ marginTop: "0.5rem" }}>
            <strong>Ocena restorana:</strong>{" "}
            <Rating
              readonly
              initialRating={comment.restaurant_rating}
              emptySymbol={<FaRegStar color="#ffc107" />}
              fullSymbol={<FaStar color="#ffc107" />}
              halfSymbol={<FaStarHalfAlt color="#ffc107" />}
            />{" "}
            ({comment.restaurant_rating})
          </div>
        )}

        <div
          style={{
            marginTop: "0.5rem",
            fontStyle: comment.deleted ? "italic" : "normal",
          }}
        >
          {comment.deleted
            ? "Ovaj komentar je uklonjen od strane administratora."
            : comment.content}
        </div>
        
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div>
            {/* Sakrij dugme "Izmeni" ako je komentar obrisan */}
            {userEmail === comment.author_email && !comment.deleted && (
              <button
                onClick={() => {
                  setEditComment({ ...comment });
                  setShowEditModal(true);
                }}
                style={{
                  backgroundColor: "#ffc",
                  border: "1px solid #aaa",
                  borderRadius: "6px",
                  padding: "0.3rem 0.7rem",
                  fontWeight: "bold",
                }}
              >
                Izmeni
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaArrowDown
              onClick={() => !alreadyVoted && handleVote(comment.id, -1)}
              style={{
                cursor: userEmail && !alreadyVoted ? "pointer" : "not-allowed",
                opacity: userEmail && !alreadyVoted ? 1 : 0.5,
              }}
            />
            <span>{comment.comment_rating}</span>
            <FaArrowUp
              onClick={() => !alreadyVoted && handleVote(comment.id, 1)}
              style={{
                cursor: userEmail && !alreadyVoted ? "pointer" : "not-allowed",
                opacity: userEmail && !alreadyVoted ? 1 : 0.5,
              }}
            />
            <button
              disabled={!userEmail || comment.deleted}
              onClick={() => {
                setReplyingToId(comment.id);
                setReplyComment((prev) => ({
                  ...prev,
                  reply_to: comment.id,
                  author_email: userEmail,
                  restaurant_id: selectedRestaurantId,
                }));
                setShowReplyModal(true);
              }}
              style={{
                backgroundColor: "#e0e0e0",
                border: "none",
                padding: "0.3rem 0.7rem",
                borderRadius: "8px",
                cursor: !userEmail || comment.deleted ? "not-allowed" : "pointer",
                opacity: !userEmail || comment.deleted ? 0.6 : 1,
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Odgovori
            </button>
          </div>
        </div>

        {replies.map((reply) => renderComment(reply, indent + 1))}
      </div>
    );
  };

  if (loading) return <p>Loading comments...</p>;
  if (!comments.length) return <p>No comments available.</p>;

  const topLevelComments = comments.filter((comment) => !comment.reply_to);

  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {topLevelComments.map((comment) => renderComment(comment))}

      {showReplyModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Odgovori na komentar</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyComment({
                      id: "",
                      author: "",
                      restaurant_id: selectedRestaurantId,
                      author_email: userEmail || "",
                      restaurant_rating: 0,
                      comment_rating: 0,
                      users_that_rated_comment: [],
                      content: "",
                      date: "",
                      reply_to: null,
                      delete_requested: false,
                      deleted : false
                    });
                    setReplyingToId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label htmlFor="author">Nadimak</label>
                  <input
                    type="text"
                    id="author"
                    className="form-control"
                    value={replyComment.author}
                    onChange={(e) => setReplyComment({ ...replyComment, author: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="content">Odgovor</label>
                  <textarea
                    id="content"
                    rows="3"
                    className="form-control"
                    value={replyComment.content}
                    onChange={(e) => setReplyComment({ ...replyComment, content: e.target.value })}
                    placeholder="Napišite odgovor..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReplyModal(false)}
                >
                  Poništi
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    try {
                      const payload = {
                        ...replyComment,
                        date: new Date().toISOString(),
                      };
                      await axios.post("http://localhost:8080/api/comment/addComment", payload,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
                          }
                        }
                      );
                      setShowReplyModal(false);
                      setReplyComment({
                        id: "",
                        author: "",
                        restaurant_id: selectedRestaurantId,
                        author_email: userEmail || "",
                        restaurant_rating: 0,
                        comment_rating: 0,
                        users_that_rated_comment: [],
                        content: "",
                        date: "",
                        reply_to: null,
                        delete_requested: false,
                        deleted : false
                      });
                      const res = await axios.get(
                        `http://localhost:8080/api/comment/getCommentsByRestaurantId/${selectedRestaurantId}`
                      );
                      setComments(res.data);
                    } catch (err) {
                      console.error("Error submitting reply:", err);
                      alert("Greška pri slanju odgovora.");
                    }
                  }}
                >
                  Pošalji
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editComment && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Izmeni komentar</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label htmlFor="edit-author">Nadimak</label>
                  <input
                    type="text"
                    id="edit-author"
                    className="form-control"
                    value={editComment.author}
                    onChange={(e) => setEditComment({ ...editComment, author: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="edit-content">Komentar</label>
                  <textarea
                    id="edit-content"
                    rows="3"
                    className="form-control"
                    value={editComment.content}
                    onChange={(e) => setEditComment({ ...editComment, content: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Poništi
                </button>
                <button
                  className="btn btn-success"
                  onClick={async () => {
                    try {
                      const payload = {
                        ...editComment,
                        date: new Date().toISOString(),
                      };
                      await axios.put(
                        `http://localhost:8080/api/comment/updateComment/${editComment.id}`,
                        payload
                        ,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
                          }
                        }
                      );
                      setShowEditModal(false);
                      const res = await axios.get(
                        `http://localhost:8080/api/comment/getCommentsByRestaurantId/${selectedRestaurantId}`
                      );
                      setComments(res.data);
                    } catch (err) {
                      console.error("Error updating comment:", err);
                      alert("Greška pri izmeni komentara.");
                    }
                  }}
                >
                  Sačuvaj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
