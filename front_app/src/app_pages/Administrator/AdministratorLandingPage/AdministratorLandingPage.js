import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button , Modal} from 'react-bootstrap';
import axios from 'axios';

const AdministratorLandingPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUsers, setEditedUsers] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [editingRestaurantEmail, setEditingRestaurantEmail] = useState(null);
  const [editedRestaurants, setEditedRestaurants] = useState({});
  const [comments, setComments] = useState([]);
  const [news, setNews] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNewsContent, setNewNewsContent] = useState("");
  useEffect(() => {
    axios.get("http://localhost:8080/api/comment/getAllNews")
      .then((response) => {
        setNews(response.data);
      })
      .catch((error) => {
        console.error("Greška pri dohvaćanju vesti:", error);
    });

    axios.get("http://localhost:8080/api/restaurant/getAllRestaurants")
        .then((response) => {
          setRestaurants(response.data);
        })
        .catch((error) => {
          console.error("Greška pri dohvaćanju restorana:", error);
        });
  
    axios.get('http://localhost:8080/api/user/getAllUsers')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Greška pri dohvaćanju korisnika:', error);
      });

  axios.get("http://localhost:8080/api/comment/getAllComments")
    .then((response) => {
      const filtered = response.data.filter(comment => comment.delete_requested === true && comment.deleted !== true);
      setComments(filtered);
    })
    .catch((error) => {
      console.error("Greška pri dohvaćanju komentara:", error);
    });
  }, []);

  const getUserType = (type) => {
    if (type === 0) return "Administrator";
    if (type === 1) return "User";
    return "Nepoznat";
  };

  const handleSuspendChange = (userId, isSuspended) => {
    setEditedUsers(prevState => ({
      ...prevState,
      [userId]: {
        ...prevState[userId],
        is_account_suspended: isSuspended
      }
    }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditedUsers({ ...editedUsers, [user.id]: { ...user } });
  };

  const handleCancelEdit = (userId) => {
    setEditingUserId(null);
    setEditedUsers(prevState => {
      const newState = { ...prevState };
      delete newState[userId];
      return newState;
    });
  };

const handleAcceptCommentDelete = async (commentId) => {
  const commentToUpdate = comments.find(c => c.id === commentId);
  if (!commentToUpdate) return;

  const updatedComment = { ...commentToUpdate, deleted: true };

  try {
    await axios.put("http://localhost:8080/api/comment/updateComment/" + updatedComment.id, updatedComment, {
      headers: { 'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
       }
    });
    setComments(comments.filter(comment => comment.id !== commentId));
  } catch (error) {
    console.error("Greška pri prihvatanju brisanja komentara:", error);
  }
};

  const handleRejectCommentDelete = async (commentId) => {
    const commentToUpdate = comments.find(c => c.id === commentId);
    if (!commentToUpdate) return;

    const updatedComment = { ...commentToUpdate, delete_requested: false };

    try {
      await axios.put("http://localhost:8080/api/comment/updateComment/" + updatedComment.id, updatedComment, {
        headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${localStorage.getItem("user_jwt")}`}
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Greška pri odbijanju brisanja komentara:", error);
    }
  };

  const handleSaveEdit = async (userId) => {
    const userToUpdate = editedUsers[userId];
  
    const fullUserToUpdate = {
      id: userToUpdate.id,
      name: userToUpdate.name,
      surname: userToUpdate.surname,
      password: userToUpdate.password,
      email: userToUpdate.email,
      address: userToUpdate.address,
      postal_code: userToUpdate.postal_code,
      card_number: userToUpdate.card_number,
      loyalty_points: userToUpdate.loyalty_points,
      is_account_active: userToUpdate.is_account_active,
      is_account_suspended: userToUpdate.is_account_suspended,
      user_type: getUserType(userToUpdate.user_type),
    };

    try {
        const response = await axios.put(
          'http://localhost:8080/api/user/update',
          fullUserToUpdate,
          {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
            },
          }
        );
      
        if (response.status === 200) {
          setEditingUserId(null);
          setUsers(users.map(user => user.id === userId ? userToUpdate : user)); 
        }
      } catch (error) {
        console.error('Greška pri ažuriranju korisnika:', error);
      }
  };

  const handleDelete = (userEmail) => {
    axios.delete(`http://localhost:8080/api/user/delete/${userEmail}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
              }
            })
      .then(() => {
        setUsers(users.filter(user => user.email !== userEmail));
      })
      .catch(error => console.error("Greška pri brisanju korisnika:", error));
  };

  const handleInputChange = (userId, field, value) => {
    setEditedUsers({
      ...editedUsers,
      [userId]: {
        ...editedUsers[userId],
        [field]: value
      }
    });
  };

  const handleEditRestaurant = (restaurant) => {
    setEditingRestaurantEmail(restaurant.email);
    setEditedRestaurants({ ...editedRestaurants, [restaurant.email]: { ...restaurant } });
  };

  const handleCancelRestaurantEdit = (email) => {
    setEditingRestaurantEmail(null);
    setEditedRestaurants(prevState => {
      const newState = { ...prevState };
      delete newState[email];
      return newState;
    });
  };

  const handleSaveRestaurantEdit = async (email) => {
    const restaurantToUpdate = editedRestaurants[email];
    
    try {
      const response = await axios.put(
        'http://localhost:8080/api/restaurant/updateRestaurant',
        restaurantToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
          },
        }
      );
      
      if (response.status === 200) {
        setEditingRestaurantEmail(null);
        setRestaurants(restaurants.map(restaurant => restaurant.email === email ? restaurantToUpdate : restaurant));
      }
    } catch (error) {
      console.error('Greška pri ažuriranju restorana:', error);
    }
  };

  const handleDeleteRestaurant = (restaurantEmail) => {
    axios.delete(`http://localhost:8080/api/restaurant/delete/${restaurantEmail}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
              }
            })
      .then(() => {
        setRestaurants(restaurants.filter(restaurant => restaurant.email !== restaurantEmail));
      })
      .catch(error => console.error("Greška pri brisanju restorana:", error));
  };

  return (
    <Container className="mt-5">
      <h1>Administrator Početna Stranica</h1>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th style={{ width: '15%' }}>Ime</th>
            <th style={{ width: '15%' }}>Prezime</th>
            <th style={{ width: '15%' }}>Email</th>
            <th>Adresa</th>
            <th style={{ width: '15%' }}>Poštanski kod</th>
            <th>Broj kartice</th>
            <th>Poeni lojalnosti</th>
            <th>Aktivan nalog</th>
            <th>Nalog suspendovan</th>
            <th>Verifikacioni kod</th>
            <th>Tip korisnika</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              {editingUserId === user.id ? (
                <>
                  <td><Form.Control value={editedUsers[user.id].name} onChange={(e) => handleInputChange(user.id, 'name', e.target.value)} /></td>
                  <td><Form.Control value={editedUsers[user.id].surname} onChange={(e) => handleInputChange(user.id, 'surname', e.target.value)} /></td>
                  <td><Form.Control value={editedUsers[user.id].email} disabled /></td> {/* Make email uneditable */}
                  <td><Form.Control value={editedUsers[user.id].postal_code} onChange={(e) => handleInputChange(user.id, 'postal_code', e.target.value)} /></td>
                  <td>
                    <Form.Control 
                      as="select" 
                      value={editedUsers[user.id].address || ''} 
                      onChange={(e) => handleInputChange(user.id, 'address', e.target.value)}
                    >
                      <option value="11000">11000 – Beograd</option>
                      <option value="21000">21000 – Novi Sad</option>
                      <option value="18000">18000 – Niš</option>
                      <option value="34000">34000 – Kragujevac</option>
                      <option value="24000">24000 – Subotica</option>
                      <option value="23000">23000 – Zrenjanin</option>
                      <option value="16000">16000 – Leskovac</option>
                      <option value="37000">37000 – Kruševac</option>
                      <option value="25200">25200 – Sombor</option>
                      <option value="24300">24300 – Senta</option>
                      <option value="17500">17500 – Vranje</option>
                      <option value="32000">32000 – Čačak</option>
                      <option value="31000">31000 – Užice</option>
                      <option value="38000">38000 – Priština</option>
                      <option value="38227">38227 – Kosovska Mitrovica</option>
                    </Form.Control>
                  </td>
                  <td><Form.Control value={editedUsers[user.id].card_number} onChange={(e) => handleInputChange(user.id, 'card_number', e.target.value)} /></td>
                  <td><Form.Control value={editedUsers[user.id].loyalty_points} onChange={(e) => handleInputChange(user.id, 'loyalty_points', e.target.value)} /></td>
                </>
              ) : (
                <>
                  <td>{user.name}</td>
                  <td>{user.surname}</td>
                  <td>{user.email}</td>
                  <td>{user.postal_code}</td>
                  <td>{user.address}</td>
                  <td>{user.card_number}</td>
                  <td>{user.loyalty_points}</td>
                </>
              )}
              <td><Form.Check type="checkbox" checked={user.is_account_active} readOnly /></td>
              <td>
              <Form.Check 
                type="checkbox" 
                checked={
                  editedUsers[user.id]?.is_account_suspended !== undefined 
                    ? editedUsers[user.id].is_account_suspended 
                    : user.is_account_suspended
                } 
                disabled={editingUserId !== user.id} 
                onChange={(e) => handleSuspendChange(user.id, e.target.checked)} 
              />
              </td>
              <td>{user.verification_code}</td>
              <td>{getUserType(user.user_type)}</td>
              <td>
                {editingUserId === user.id ? (
                  <>
                    <Button variant="success" style={{ backgroundColor: '#82b74b', borderColor: '#82b74b' }} size="sm" onClick={() => handleSaveEdit(user.id)}>Sačuvaj</Button>{' '}
                    <Button variant="secondary" size="sm" onClick={() => handleCancelEdit(user.id)}>Odbaci</Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: '#82b74b', borderColor: '#82b74b' }} size="sm" onClick={() => handleEdit(user)}>Izmeni</Button>
                )}
                {' '}
                <Button style={{ backgroundColor: '#d6d6d6', borderColor: '#d6d6d6', color: 'black' }} size="sm" onClick={() => handleDelete(user.email)}>Obriši</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mt-4">Lista restorana</h2>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Adresa</th>
            <th>Poštanski kod</th>
            <th>Email</th>
            <th>Aktivan</th>
            <th>Suspendovan</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant.email}>
              {editingRestaurantEmail === restaurant.email ? (
                <>
                  <td><Form.Control value={editedRestaurants[restaurant.email].name} onChange={(e) => setEditedRestaurants({ ...editedRestaurants, [restaurant.email]: { ...editedRestaurants[restaurant.email], name: e.target.value } })} /></td>
                    <td>
                      <Form.Control
                        value={editedRestaurants[restaurant.email].address}
                        onChange={(e) => setEditedRestaurants({
                          ...editedRestaurants,
                          [restaurant.email]: {
                            ...editedRestaurants[restaurant.email],
                            address: e.target.value
                          }
                        })}
                      />
                    </td>                  <td>
                    <Form.Control
                      as="select"
                      value={editedRestaurants[restaurant.email].postal_code || ''}
                      onChange={(e) => setEditedRestaurants({
                        ...editedRestaurants,
                        [restaurant.email]: {
                          ...editedRestaurants[restaurant.email],
                          postal_code: e.target.value
                        }
                      })}
                    >
                      <option value="11000">11000 – Beograd</option>
                      <option value="21000">21000 – Novi Sad</option>
                      <option value="18000">18000 – Niš</option>
                      <option value="34000">34000 – Kragujevac</option>
                      <option value="24000">24000 – Subotica</option>
                      <option value="23000">23000 – Zrenjanin</option>
                      <option value="16000">16000 – Leskovac</option>
                      <option value="37000">37000 – Kruševac</option>
                      <option value="25200">25200 – Sombor</option>
                      <option value="24300">24300 – Senta</option>
                      <option value="17500">17500 – Vranje</option>
                      <option value="32000">32000 – Čačak</option>
                      <option value="31000">31000 – Užice</option>
                      <option value="38000">38000 – Priština</option>
                      <option value="38227">38227 – Kosovska Mitrovica</option>
                    </Form.Control>
                  </td>
                  <td><Form.Control value={editedRestaurants[restaurant.email].email} disabled /></td> {/* Make email uneditable */}
                </>
              ) : (
                <>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.address}</td>
                  <td>{restaurant.postal_code}</td>
                  <td>{restaurant.email}</td>
                </>
              )}
              <td><Form.Check type="checkbox" checked={restaurant.account_active} readOnly /></td>
              <td>
              <Form.Check 
                type="checkbox" 
                checked={editedRestaurants[restaurant.email]?.account_suspended || restaurant.account_suspended} 
                disabled={editingRestaurantEmail !== restaurant.email} 
                onChange={(e) => setEditedRestaurants({
                  ...editedRestaurants,
                  [restaurant.email]: {
                    ...editedRestaurants[restaurant.email],
                    account_suspended: e.target.checked
                  }
                })} 
              />
              </td>
              <td>
                {editingRestaurantEmail === restaurant.email ? (
                  <>
                    <Button variant="success" style={{ backgroundColor: '#82b74b', borderColor: '#82b74b' }} size="sm" onClick={() => handleSaveRestaurantEdit(restaurant.email)}>Sačuvaj</Button>{' '}
                    <Button variant="secondary" size="sm" onClick={() => handleCancelRestaurantEdit(restaurant.email)}>Odbaci</Button>
                  </>
                ) : (
                  <Button style={{ backgroundColor: '#82b74b', borderColor: '#82b74b' }} size="sm" onClick={() => handleEditRestaurant(restaurant)}>Izmeni</Button>
                )}
                {' '}
                <Button style={{ backgroundColor: '#d6d6d6', borderColor: '#d6d6d6', color: 'black' }} size="sm" onClick={() => handleDeleteRestaurant(restaurant.email)}>Obriši</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mt-4">Zahtevi za brisanje komentara</h2>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Autor</th>
            <th>Sadržaj</th>
            <th>Datum</th>
            <th>Ocena</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {comments.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">Nema komentara za brisanje.</td>
            </tr>
          ) : (
            comments.map(comment => (
              <tr key={comment.id}>
                <td>{comment.author}</td>
                <td>{comment.content}</td>
                <td>{new Date(comment.date).toLocaleDateString()}</td>
                <td>{comment.comment_rating}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleAcceptCommentDelete(comment.id)}
                  >
                    Prihvati
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectCommentDelete(comment.id)}
                  >
                    Odbij
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    <h2 className="mt-4">Vesti</h2>
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Sadržaj</th>
        </tr>
      </thead>
      <tbody>
        {news.length === 0 ? (
          <tr>
            <td colSpan="2" className="text-center">Nema dostupnih vesti.</td>
          </tr>
        ) : (
          news.map(item => (
            <tr key={item.id}>
              <td>{new Date(item.date_of_creation).toLocaleDateString()}</td>
              <td>{item.content}</td>
            </tr>
          ))
        )}
        <tr>
          <td colSpan="2" className="text-center">
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Dodaj vest
            </Button>
          </td>
        </tr>
      </tbody>
    </Table>
<Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Dodaj novu vest</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group>
        <Form.Label>Sadržaj</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={newNewsContent}
          onChange={(e) => setNewNewsContent(e.target.value)}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowAddModal(false)}>
        Otkaži
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          var new_news = {
            id : "",
            content : newNewsContent,
            date_of_creation : new Date().toISOString()
          }
          axios
            .post("http://localhost:8080/api/comment/addNews", new_news,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("user_jwt")}`,
              }
            }
            )
            .then(() => {
              setShowAddModal(false);
              setNewNewsContent("");
              // refresh news
              return axios.get("http://localhost:8080/api/comment/getAllNews");
            })
            .then((res) => {
              setNews(res.data);
            })
            .catch((err) => {
              console.error("Greška pri dodavanju vesti:", err);
            });
        }}
      >
        Dodaj
      </Button>
    </Modal.Footer>
  </Modal>
    </Container>
  );
};

export default AdministratorLandingPage;
