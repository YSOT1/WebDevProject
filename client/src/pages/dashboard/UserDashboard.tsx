import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Row, Col, Spin, Typography, message } from "antd";

const { Title, Paragraph } = Typography;

const UserDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [reservedEvents, setReservedEvents] = useState<any[]>([]);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin"); // Redirect to sign-in if no token exists
      return;
    }

    // Fetch user data
    axios
      .get("http://localhost:3000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData(response.data);
        fetchReservedEvents(token); // Fetch reserved events
        fetchAvailableEvents(token); // Fetch available events
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        navigate("/signin");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const fetchReservedEvents = (token: string) => {
    axios
      .get("http://localhost:3000/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setReservedEvents(response.data))
      .catch((error) => console.error("Error fetching reserved events:", error));
  };

  const fetchAvailableEvents = (token: string) => {
    axios
      .get("http://localhost:3000/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => setAvailableEvents(response.data))
      .catch((error) =>
        console.error("Error fetching available events:", error)
      );
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const handleCancelReservation = (eventId: number) => {
    const token = localStorage.getItem("token");

    axios
      .delete("http://localhost:3000/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { eventId }, // Send eventId in the body
      })
      .then(() => {
        message.success("Reservation cancelled successfully!");
        // Update reserved events after cancellation
        fetchReservedEvents(token);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Failed to cancel reservation.";
        message.error(errorMessage);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!userData) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="p-6">
      {/* Section 1: Welcome Message and Sign Out */}
      <div className="mb-8">
        <Title level={2}>
          Welcome, {userData.firstName} {userData.lastName}!
        </Title>
        <Button type="primary" danger onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* Section 2: Reserved Events */}
      <div className="mb-8">
        <Title level={3}>Your Reservations</Title>
        <Row gutter={[16, 16]}>
          {reservedEvents.length > 0 ? (
            reservedEvents.map((event) => (
              <Col key={event.id} xs={24} sm={12} md={8}>
                <Card
                  title={event.title}
                  bordered={false}
                  hoverable
                  extra={<span>{event.date}</span>}
                >
                  <Paragraph>{event.description}</Paragraph>
                  <Button
                    type="primary"
                    onClick={() => handleViewEvent(event.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    type="danger"
                    onClick={() => handleCancelReservation(event.id)}
                    style={{ marginTop: "10px" }}
                  >
                    Cancel Reservation
                  </Button>
                </Card>
              </Col>
            ))
          ) : (
            <Paragraph>No reservations yet.</Paragraph>
          )}
        </Row>
      </div>

      {/* Section 3: Available Events */}
      <div>
        <Title level={3}>Available Events</Title>
        <Row gutter={[16, 16]}>
          {availableEvents.map((event) => (
            <Col key={event.id} xs={24} sm={12} md={8}>
              <Card
                title={event.title}
                bordered={false}
                hoverable
                extra={<span>{event.date}</span>}
              >
                <Paragraph>{event.description}</Paragraph>
                <Button
                  type="primary"
                  onClick={() => handleViewEvent(event.id)}
                >
                  View Details
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default UserDashboard;
