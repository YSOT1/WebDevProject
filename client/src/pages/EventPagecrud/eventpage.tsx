import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userHasReservation, setUserHasReservation] = useState<boolean>(false);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(true);
  const [loadingRole, setLoadingRole] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    // Fetch user role
    axios
      .get("http://localhost:3000/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserRole(response.data.role); // Assuming the response contains a "role" field
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        navigate("/signin");
      })
      .finally(() => setLoadingRole(false));

    // Fetch event details
    axios
      .get(`http://localhost:3000/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEvent(response.data.event);
        setReservations(response.data.reservations);

        // Check if the user already has a reservation
        const userReservation = response.data.reservations.find(
          (reservation: any) => reservation.userId === response.data.userId
        );
        setUserHasReservation(!!userReservation);
      })
      .catch((error) => {
        console.error("Error fetching event details:", error);
      })
      .finally(() => setLoadingEvent(false));
  }, [eventId, navigate]);

  const handleReservation = () => {
    const token = localStorage.getItem("token");

    axios
      .post(
        "http://localhost:3000/reservations",
        { eventId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        alert("Reservation successful!");
        setUserHasReservation(true);
        navigate("/dashboard/UserDashboard");
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Failed to make a reservation.";
        alert(errorMessage); // Show a specific error message if provided by the backend
      });
  };


  if (loadingEvent || loadingRole) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleString()}</p>
      <p>Location: {event.location}</p>
      <p>Seats Left: {event.maxParticipants}</p>

      {userRole === "HOST" ? (
        // Host view
        <>
          <h2>Reservations</h2>
          {reservations.length > 0 ? (
            <ul>
              {reservations.map((reservation) => (
                <li key={reservation.id}>
                  {reservation.firstName || "Anonymous"} {reservation.lastName || ""} - {reservation.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No reservations yet.</p>
          )}
        </>
      ) : (
        // User view
        <>
          {userHasReservation ? (
            <></>
          ) : (
            <button
              onClick={handleReservation}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Make a Reservation
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EventPage;
