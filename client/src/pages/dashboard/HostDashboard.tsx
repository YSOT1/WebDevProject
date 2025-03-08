import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Input, message, DatePicker } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
const { Meta } = Card;

const HostDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null); // Store the event being edited

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decodedToken: any = jwtDecode(token);
      const hostId = decodedToken?.id;
      axios
        .get("http://localhost:3000/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
          fetchEvents(hostId); // Fetch events created by this host
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvents = (hostId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Unauthorized: Token not found.");
      return;
    }

    axios
      .get(`http://localhost:3000/events?hostId=${hostId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        message.error("Failed to fetch events.");
      });
  };

  const handleSignout = () => {
    localStorage.removeItem("token");
    message.success("Signed out successfully");
    navigate("/");
  };

  const handleCreateEvent = (values: any) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:3000/events",
        {
          ...values,
          createdBy: userData.id,
          date: values.date.format("YYYY-MM-DD"), // Ensure the date is formatted correctly
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        message.success("Event created successfully!");
        fetchEvents(userData.id); // Refresh event list
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to create event.");
      });
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event); // Set the event to be edited
    setIsModalOpen(true); // Open the modal for editing
  };

  const handleSaveEvent = (values: any) => {
    const token = localStorage.getItem("token");
  
    if (editingEvent) {
      // Update existing event
      axios
        .put(
          `http://localhost:3000/events/${editingEvent.id}`,
          {
            ...values,
            date: values.date.format("YYYY-MM-DD"),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(() => {
          message.success("Event updated successfully!");
          fetchEvents(userData.id);
          setIsModalOpen(false);
          setEditingEvent(null); // Clear the editing event
        })
        .catch((error) => {
          console.error(error);
          message.error("Failed to update event.");
        });
    } else {
      // Create new event
      handleCreateEvent(values);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:3000/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        message.success("Event deleted successfully!");
        fetchEvents(userData.id); // Refresh event list
      })
      .catch((error) => {
        console.error(error);
        message.error("Failed to delete event.");
      });
  };

  if (loading) return <div>Loading...</div>;

  if (!userData) return <div>Please sign in.</div>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Section 1: Welcome message and Signout */}
      <div>
        <h1>
          Welcome, {userData.firstName} {userData.lastName}!
        </h1>
        <Button type="primary" danger onClick={handleSignout}>
          Sign Out
        </Button>
      </div>

      {/* Section 2: Create event and event list */}
      <h1>
          List of Events
        </h1>
      <div style={{ marginTop: "20px" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditingEvent(null); // Reset editing state for new event
            setIsModalOpen(true);
          }}
          style={{ marginBottom: "20px" }}
        >
          Create Event
        </Button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {events.map((event) => (
            <Card
              key={event.id}
              title={event.title}
              style={{ width: 300 }}
              actions={[
                <Button
                  type="link"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View
                </Button>,
                <Button
                  type="link"
                  onClick={() => handleEditEvent(event)} // Open modal for editing
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <Meta
                description={
                  <>
                    <p>{event.description}</p>
                    <p>Date: {dayjs(event.date).format("DD MMM YYYY")}</p>
                  </>
                }
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Modal for creating/editing events */}
      <Modal
        title={editingEvent ? "Edit Event" : "Create Event"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSaveEvent}
          initialValues={editingEvent ? { ...editingEvent, date: dayjs(editingEvent.date) } : {}}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input the title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please input the description!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select the event date!" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Please input the location!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Max Participants"
            name="maxParticipants"
            rules={[
              { required: true, message: "Please input the maximum participants!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {editingEvent ? "Save Changes" : "Create Event"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default HostDashboard;
