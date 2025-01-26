import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, Spin, Typography, message } from "antd";

const { Title, Paragraph, Text } = Typography;

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
        message.success("Reservation successful!");
        setUserHasReservation(true);
        navigate("/dashboard/UserDashboard");
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Failed to make a reservation.";
        message.error(errorMessage); // Show a specific error message if provided by the backend
      });
  };

  if (loadingEvent || loadingRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg">
        <Title level={1} className="text-center text-3xl">{event.title}</Title>
        <Paragraph className="text-center text-lg text-gray-700">{event.description}</Paragraph>

        <div className="flex justify-between my-4">
          <Text strong>Date: {new Date(event.date).toLocaleString()}</Text>
          <Text strong>Location: {event.location}</Text>
        </div>

        <div className="my-4">
          <Text strong>Seats Left: {event.maxParticipants}</Text>
        </div>

        {userRole === "HOST" ? (
          // Host view
          <>
            <h2 className="text-xl mt-4">Reservations</h2>
            {reservations.length > 0 ? (
              <ul className="list-disc pl-5">
                {reservations.map((reservation) => (
                  <li key={reservation.id}>
                    {reservation.firstName || "Anonymous"} {reservation.lastName || ""} -{" "}
                    {reservation.status}
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
              <Button
                type="default"
                disabled
                className="w-full mt-4 bg-gray-500"
              >
                Reservation Confirmed
              </Button>
            ) : (
              <Button
                type="primary"
                className="w-full mt-4"
                onClick={handleReservation}
                style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
              >
                Make a Reservation
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default EventPage;
