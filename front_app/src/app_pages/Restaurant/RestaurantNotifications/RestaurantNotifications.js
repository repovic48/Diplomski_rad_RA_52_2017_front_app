import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const RestaurantNotifications = () => {
  const location = useLocation();
  const initialEmail = localStorage.getItem("restaurant_email")?.trim();
  const [loggedInRestaurant, setLoggedInRestaurant] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const isRestaurantSuspended = loggedInRestaurant?.account_suspended;
  
  // Fetch updated restaurant by email
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!initialEmail) {
        setError('Greška: Nije prosleđen email restorana.');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/restaurant/getRestaurantByEmail/${initialEmail}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: false,
          }
        );

        if (response.status === 200) {
          setLoggedInRestaurant(response.data);
          setNotifications(response.data.notifications || []);
        }
      } catch (err) {
        setError('Greška prilikom učitavanja podataka restorana.');
      }
    };

    fetchRestaurant();
  }, [initialEmail]);

  const handleCreate = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Sva polja su obavezna.');
      setSuccessMessage('');
      return;
    }
  
    const dataToSend = {
      id: '0000',
      subject: "Obaveštenje od " + loggedInRestaurant.name + ": " + subject,
      content,
      date_of_creation: new Date().toISOString(),
      restaurant_id: loggedInRestaurant.id
    };
  
    try {
      setLoading(true);
  
      // Step 1: Create notification
      const response = await axios.post(
        'http://localhost:8080/api/restaurant/createNotification',
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`,
          }
        }
      );
  
      if (response.status === 201) {
        const createdNotification = response.data;
  
        // Step 2: Fetch all user emails
        const emailResponse = await axios.get('http://localhost:8080/api/user/getAllEmails', {
          headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`,
          }
        });
  
        if (emailResponse.status === 200) {
          const userEmails = emailResponse.data;
  
          // Step 3: Notify users
          await axios.post(
            `http://localhost:8080/api/restaurant/notifyUsers/${createdNotification.id}`,
            userEmails,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`,
              }
            }
          );
        }
  
        // Step 4: Refresh restaurant data
        const refreshed = await axios.get(
          `http://localhost:8080/api/restaurant/getRestaurantByEmail/${initialEmail}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: false,
          }
        );
  
        setLoggedInRestaurant(refreshed.data);
        setNotifications(refreshed.data.notifications || []);
        setSuccessMessage('Obaveštenje je uspešno kreirano i poslato korisnicima!');
        setError('');
        setSubject('');
        setContent('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      setError('Obaveštenje nije kreirano ili slanje nije uspelo. Pokušajte ponovo.');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/restaurant/deleteNotification/${notificationId}`,
        {
          headers: {
            'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("restaurant_jwt")}`,
          },
          withCredentials: false,
        }
      );

      const refreshed = await axios.get(
        `http://localhost:8080/api/restaurant/getRestaurantByEmail/${initialEmail}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: false,
        }
      );

      setLoggedInRestaurant(refreshed.data);
      setNotifications(refreshed.data.notifications || []);
      setSuccessMessage('Obaveštenje je uspešno obrisano!');
      setError('');
    } catch (error) {
      setError('Brisanje nije uspelo. Pokušajte ponovo.');
      setSuccessMessage('');
    }
  };

  if (!loggedInRestaurant) {
    return <div>Učitavanje podataka...</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <header style={{
        backgroundColor: '#82b74b',
        color: 'white',
        padding: '15px 20px',
        fontSize: '24px',
        borderRadius: '8px 8px 0 0'
      }}>
        Obaveštenja
      </header>

      {successMessage && (
        <div style={{ marginTop: '20px', color: 'green', fontWeight: 'bold' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Naslov</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Sadržaj</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Datum</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}></th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, index) => (
            <tr key={index}>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{notification.subject}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{notification.content}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                {new Date(notification.date_of_creation).toLocaleDateString()}
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                <button
                  onClick={() => handleDelete(notification.id)}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: isRestaurantSuspended ? 'not-allowed' : 'pointer',
                    opacity: isRestaurantSuspended ? 0.5 : 1,
                  }}
                  disabled={isRestaurantSuspended}
                  title={isRestaurantSuspended ? "Nalog je suspendovan" : ""}
                >
                  Obriši
            </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => {
          if (!isRestaurantSuspended) {
            setIsModalOpen(true);
            setSuccessMessage('');
            setError('');
          }
        }}
        style={{
          marginTop: '20px',
          backgroundColor: '#82b74b',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '6px',
          cursor: isRestaurantSuspended ? 'not-allowed' : 'pointer',
          opacity: isRestaurantSuspended ? 0.5 : 1,
        }}
        disabled={isRestaurantSuspended}
        title={isRestaurantSuspended ? "Nalog je suspendovan, ne možete kreirati obaveštenja" : ""}
      >
        Kreiraj obaveštenje
      </button>


      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Novo obaveštenje</h2>

            <div style={{ marginBottom: '15px' }}>
              <label>Naslov:</label><br />
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Sadržaj:</label><br />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={handleCreate}
              disabled={loading || isRestaurantSuspended}
              style={{
                backgroundColor: '#82b74b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: isRestaurantSuspended ? 'not-allowed' : 'pointer',
                opacity: isRestaurantSuspended ? 0.5 : 1,
              }}
              title={isRestaurantSuspended ? "Nalog je suspendovan" : ""}
            >
              {loading ? 'Čuvanje...' : 'Sačuvaj'}
            </button>

              <button onClick={() => {
                setIsModalOpen(false);
                setError('');
                setSubject('');
                setContent('');
              }} style={{
                backgroundColor: '#ccc',
                color: '#333',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantNotifications;
