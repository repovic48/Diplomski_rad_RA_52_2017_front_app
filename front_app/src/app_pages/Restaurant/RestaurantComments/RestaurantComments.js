import React, { useEffect, useState } from "react";
import axios from "axios";
import Rating from "react-rating";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const RestaurantComments = () => {
  const [restaurantEmail, setRestaurantEmail] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const storedRestaurantEmail = localStorage.getItem("restaurant_email")?.trim();
    const storedUserEmail = localStorage.getItem("user_email")?.trim();

    console.log("Stored restaurant email:", storedRestaurantEmail);
    console.log("Stored user email:", storedUserEmail);

    setRestaurantEmail(storedRestaurantEmail || "");
    setUserEmail(storedUserEmail || "");
  }, []);

  useEffect(() => {
    if (!restaurantEmail) {
      setLoading(false);
      setRestaurant(null);
      setComments([]);
      return;
    }

    const fetchRestaurantAndComments = async () => {
      try {
        const restaurantRes = await axios.get(
          `http://localhost:8080/api/restaurant/getRestaurantByEmail/${restaurantEmail}`
        );
        const restaurantData = restaurantRes.data;
        setRestaurant(restaurantData);

        const commentsRes = await axios.get(
          `http://localhost:8080/api/comment/getCommentsByRestaurantId/${restaurantData.id}`
        );
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Error fetching restaurant or comments:", err);
        setRestaurant(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndComments();
  }, [restaurantEmail]);

  const calculateAverageRating = (comments) => {
    const valid = comments.filter(
      (c) => (c.reply_to === "" || c.reply_to === null) && c.deleted === false
    );
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, c) => acc + (c.restaurant_rating || 0), 0);
    return (sum / valid.length).toFixed(1);
  };

  const toggleDeleteRequest = async (comment) => {
    const updated = {
      ...comment,
      delete_requested: !comment.delete_requested,
      date: new Date().toISOString(),
    };

    try {
      await axios.put(
        `http://localhost:8080/api/comment/updateComment/${comment.id}`,
        updated, {
        headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`}
      }
      );

      const res = await axios.get(
        `http://localhost:8080/api/comment/getCommentsByRestaurantId/${restaurant.id}`
      );
      setComments(res.data);
    } catch (err) {
      console.error("Error toggling delete request:", err);
      alert("Greška pri zahtevu.");
    }
  };

  const averageRating = calculateAverageRating(comments);

  const renderComment = (comment, indent = 0) => {
    // Sad NE filtriramo reply-jeve po deleted === false, prikazujemo i obrisane
    const replies = comments.filter(
      (c) => c.reply_to === comment.id
    );

    return (
      <div
        key={`comment-${indent}-${comment.id}`}
        style={{
          marginLeft: `${indent * 2}rem`,
          borderLeft: indent > 0 ? "2px solid #82b74b" : "none",
          paddingLeft: indent > 0 ? "1rem" : "0",
          borderBottom: "1px solid #ddd",
          borderTop: "1px solid #ddd",
          marginTop: "1rem",
          borderRadius: "5px",
          maxWidth: "90vw",
          width: "600px",
          paddingBottom: "1rem",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            alignItems: "center",
          }}
        >
          <span>
            {comment.author}{" "}
            {!comment.deleted && (
              <button
                onClick={() => toggleDeleteRequest(comment)}
                style={{
                  marginLeft: "10px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  backgroundColor: comment.delete_requested ? "#ffc" : "#eee",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                {comment.delete_requested ? "Otkaži zahtev" : "Zatraži brisanje"}
              </button>
            )}
          </span>
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
          style={{ marginTop: "0.5rem", fontStyle: comment.deleted ? "italic" : "normal" }}
        >
          {comment.deleted
            ? "Komentar je uklonjen od strane administratora"
            : comment.content}
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.9rem",
            color: "#555",
            textAlign: "right",
            fontStyle: "italic",
          }}
        >
          Ocena komentara: {comment.comment_rating}
        </div>

        {replies.map((reply) => renderComment(reply, indent + 1))}
      </div>
    );
  };

  if (loading) return <p>Loading comments...</p>;
  if (!restaurant) return <p>Trenutno nema ocena.</p>;

  // Uklonjeno filtriranje deleted == false da i obrisani budu vidljivi
  const topLevelComments = comments.filter(
    (c) => (c.reply_to === "" || c.reply_to === null)
  );

  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ color: "#82b74b", marginBottom: "1rem" }}>
        Komentari za restoran: {restaurant.name}
      </h2>

      <div
        style={{ marginBottom: "1rem", fontWeight: "bold", fontSize: "1.2rem" }}
      >
        Prosečna ocena restorana:{" "}
        {averageRating ? (
          <>
            <Rating
              readonly
              initialRating={averageRating}
              emptySymbol={<FaRegStar color="#ffc107" />}
              fullSymbol={<FaStar color="#ffc107" />}
              halfSymbol={<FaStarHalfAlt color="#ffc107" />}
              fractions={2}
            />
            <span style={{ marginLeft: "0.5rem" }}>({averageRating})</span>
          </>
        ) : (
          "Nema ocena"
        )}
      </div>

      <div key={`comments-container-${restaurant.id}`}>
        {topLevelComments.length === 0 ? (
          <p>Nema dostupnih komentara.</p>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default RestaurantComments;
