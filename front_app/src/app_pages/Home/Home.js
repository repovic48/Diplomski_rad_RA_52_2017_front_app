import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Rating from "react-rating";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [newsComments, setNewsComments] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch restaurants
      const restaurantRes = await axios.get("http://localhost:8080/api/restaurant/getAllRestaurants");
      const fetchedRestaurants = restaurantRes.data;
      setRestaurants(fetchedRestaurants);

      // Fetch comments for each restaurant
      const commentsObj = {};
      await Promise.all(
        fetchedRestaurants.map(async (restaurant) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/api/comment/getCommentsByRestaurantId/${restaurant.id}`
            );
            commentsObj[restaurant.id] = res.data;
          } catch (error) {
            console.error(`Error fetching comments for restaurant ${restaurant.id}:`, error);
            commentsObj[restaurant.id] = [];
          }
        })
      );
      setCommentsMap(commentsObj);

      // Fetch all news comments
      const newsRes = await axios.get("http://localhost:8080/api/comment/getAllNews");
      const sortedNews = (newsRes.data || [])
        .sort((a, b) => new Date(b.date_of_creation) - new Date(a.date_of_creation))
        .slice(0, 3);
      setNewsComments(sortedNews);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const calculateDiscountedPrice = (price, discount) => {
    return (price - price * (discount / 100)).toFixed(2);
  };

  // UPDATED calculateAverageRating to filter only comments with empty reply_to
  const calculateAverageRating = (comments) => {
    if (!comments || comments.length === 0) return null;

    const topLevelComments = comments.filter(
      (comment) => !comment.reply_to || comment.reply_to === ""
    );

    if (topLevelComments.length === 0) return null;

    const sum = topLevelComments.reduce((acc, comment) => acc + comment.restaurant_rating, 0);
    return (sum / topLevelComments.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="mb-4">
        <h4 className="text-center mb-3" style={{ color: "#6ba446" }}>Najnovije vesti</h4>
        {newsComments.length > 0 ? (
          <div className="row justify-content-center">
            {newsComments.map((news, index) => (
              <div key={index} className="col-md-8 mb-3">
                <div className="border rounded p-3 bg-light shadow-sm">
                  <small className="text-muted">
                    {new Date(news.date_of_creation).toLocaleString("sr-RS")}
                  </small>
                  <p className="mb-0">{news.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center">Nema dostupnih vesti.</p>
        )}
      </div>


      <h1 className="text-center mb-5" style={{ color: "#82b74b" }}>
        Restorani
      </h1>
      {restaurants.map((restaurant) => {
        const availableFoods = (restaurant.menu || []).filter((food) => food.available);
        const comments = commentsMap[restaurant.id] || [];
        const averageRating = calculateAverageRating(comments);

        return (
          <div key={restaurant.id} className="mb-5">
            <h3 className="mb-3 d-flex align-items-center justify-content-between">
              <div>
                <Link
                  to={`/SelectedRestaurant`}
                  onClick={() =>
                    localStorage.setItem("selected_restaurant_id", restaurant.id)
                  }
                  style={{ color: "#6ba446", textDecoration: "none" }}
                >
                  <u><b>{restaurant.name}</b></u> (klikni za celu ponudu)
                </Link>
              </div>

              <div className="d-flex align-items-center gap-2">
                {averageRating ? (
                  <>
                    <Rating
                      initialRating={averageRating}
                      readonly
                      emptySymbol={<FaRegStar color="#ffc107" />}
                      fullSymbol={<FaStar color="#ffc107" />}
                      halfSymbol={<FaStarHalfAlt color="#ffc107" />}
                      fractions={2}
                    />
                    <span className="ms-2">{averageRating}</span>
                    <Link
                      to="/Comments"
                      onClick={() =>
                        localStorage.setItem("selected_restaurant_id", restaurant.id)
                      }
                      className="ms-3"
                      style={{ color: "#6ba446", textDecoration: "none" }}
                    >
                      <u>utisci naših korisnika</u>
                    </Link>
                  </>
                ) : (
                  <span className="text-muted">N/A</span>
                )}
              </div>
            </h3>

            <div className="table-responsive">
              {availableFoods.length > 0 ? (
                <table className="table table-bordered text-center align-middle">
                  <tbody>
                    {availableFoods.slice(0, 3).map((food) => (
                      <tr key={food.id}>
                        <td>
                          <img
                            src={food.image}
                            alt={food.name}
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                            }}
                          />
                        </td>
                        <td>{food.name}</td>
                        <td>
                          {food.discount > 0 ? (
                            <>
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  marginRight: "8px",
                                }}
                              >
                                {food.price} RSD
                              </span>
                              <span style={{ color: "red" }}>
                                {calculateDiscountedPrice(food.price, food.discount)} RSD
                              </span>
                            </>
                          ) : (
                            <span>{food.price} RSD</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {availableFoods.length > 3 && (
                      <tr>
                        <td colSpan="3" className="text-center">
                          ...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Trenutno nema dostupnih jela.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
