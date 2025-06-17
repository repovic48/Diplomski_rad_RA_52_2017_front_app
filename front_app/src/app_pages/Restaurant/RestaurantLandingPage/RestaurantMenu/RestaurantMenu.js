import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';

const RestaurantMenu = () => {
  const location = useLocation();
  const loggedInRestaurant = location.state?.loggedInRestaurant || '';
  const [foods, setFoods] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFood, setNewFood] = useState({
    naziv: "",
    cena: "",
    slika: "",
    dostupnost: true,
    popust: 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/restaurant/getRestaurantByEmail/${loggedInRestaurant.email}`)
      .then((response) => {
        setFoods(response.data.menu);
        setRestaurant(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching food data:", error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFood((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      if (img.width !== 256 || img.height !== 256) {
        alert("Slika mora biti tačno 256x256 piksela.");
        return;
      }
      setNewFood((prev) => ({ ...prev, slika: img.src }));
    };

    reader.readAsDataURL(file);
  };

  const handleEdit = (food) => {
    setNewFood({
      naziv: food.name,
      cena: food.price,
      slika: food.image,
      dostupnost: food.available,
      popust: food.discount || 0,
    });
    setEditingFoodId(food.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (foodId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu stavku?")) {
      axios
        .delete(`http://localhost:8080/api/restaurant/DeleteFood/${foodId}`)
        .then(() => {
          setFoods((prev) => prev.filter((f) => f.id !== foodId));
        })
        .catch((error) => {
          console.error("Greška prilikom brisanja:", error);
        });
    }
  };

  const handleSave = () => {
    const foodData = {
      id: editMode ? editingFoodId : '0',
      name: newFood.naziv,
      price: newFood.cena,
      image: newFood.slika,
      restaurant_id: restaurant.id,
      available: newFood.dostupnost,
      discount: newFood.popust,
    };

    const request = editMode
      ? axios.put(`http://localhost:8080/api/restaurant/updateFood/`, foodData)
      : axios.post("http://localhost:8080/api/restaurant/AddFood", foodData);

    request
      .then((response) => {
        if (editMode) {
          setFoods((prev) =>
            prev.map((f) => (f.id === editingFoodId ? response.data : f))
          );
        } else {
          setFoods((prev) => [...prev, response.data]);
        }

        setShowModal(false);
        setNewFood({ naziv: "", cena: "", slika: "", dostupnost: true, popust: 0 });
        setEditMode(false);
        setEditingFoodId(null);
      })
      .catch((error) => {
        console.error("Greška prilikom čuvanja stavke:", error);
      });
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
      <h2 className="mb-4 text-center" style={{ backgroundColor: "#82b74b", color: "white" }}>
        Meni
      </h2>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center" style={{ backgroundColor: "#82b74b", color: "white" }}>
          <thead style={{ backgroundColor: "#6ba446", color: "white" }}>
            <tr>
              <th style={{ width: "256px" }}></th>
              <th>Naziv</th>
              <th>Cena</th>
              <th>Dostupnost</th>
              <th>Popust</th>
              <th>Opcije</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((food) => (
              <tr key={food.id}>
                <td>
                  <img src={food.image} alt={food.name} style={{ width: "64px", height: "64px", objectFit: "cover" }} />
                </td>
                <td>{food.name}</td>
                <td>{food.price} RSD</td>
                <td>{food.available ? "Na stanju" : "Nedostupno"}</td>
                <td>{food.discount || 0}%</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(food)}>Izmeni</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(food.id)}>Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dodaj stavku button */}
      <div className="text-center mt-4">
        <button
          className="btn"
          style={{ backgroundColor: "#82b74b", color: "white" }}
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setNewFood({ naziv: "", cena: "", slika: "", dostupnost: true, popust: 0 });
          }}
        >
          Dodaj stavku
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#82b74b", color: "white" }}>
                <h5 className="modal-title">{editMode ? "Izmeni stavku" : "Dodaj novu stavku"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Naziv</label>
                  <input
                    type="text"
                    className="form-control"
                    name="naziv"
                    value={newFood.naziv}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cena</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cena"
                    value={newFood.cena}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Popust (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="popust"
                    min="0"
                    max="100"
                    value={newFood.popust}
                    onChange={(e) =>
                      setNewFood((prev) => ({ ...prev, popust: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Slika (256x256)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {newFood.slika && (
                  <img
                    src={newFood.slika}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ maxWidth: "128px", marginTop: "10px" }}
                  />
                )}
                <div className="mb-3">
                  <label className="form-label">Dostupnost</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="dostupnost"
                        id="naStanju"
                        checked={newFood.dostupnost === true}
                        onChange={() =>
                          setNewFood((prev) => ({ ...prev, dostupnost: true }))
                        }
                      />
                      <label className="form-check-label" htmlFor="naStanju">Na stanju</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="dostupnost"
                        id="nedostupno"
                        checked={newFood.dostupnost === false}
                        onChange={() =>
                          setNewFood((prev) => ({ ...prev, dostupnost: false }))
                        }
                      />
                      <label className="form-check-label" htmlFor="nedostupno">Nedostupno</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Zatvori</button>
                <button
                  className="btn"
                  style={{ backgroundColor: "#82b74b", color: "white" }}
                  onClick={handleSave}
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

export default RestaurantMenu;
