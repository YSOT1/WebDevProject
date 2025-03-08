import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Tag, Typography, Space, Modal, Form, Input, Select, Table, message, DatePicker } from "antd";
import { DeleteOutlined, EditOutlined, UserAddOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * User interface matching the database schema
 * Table: users
 * - Primary Key: id (auto-increment)
 * - Unique Key: email
 */
interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'USER' | 'ADMIN' | 'HOST';
  createdAt: string;
}

/**
 * Event interface matching the database schema
 * Table: events
 * - Primary Key: id (auto-increment)
 * - Foreign Key: createdBy references users(id)
 */
interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  maxParticipants: number;
  createdBy: number;
  createdAt: string;
  // Additional fields from JOIN with users table
  hostFirstName: string | null;
  hostLastName: string | null;
}

interface Reservation {
  id: number;
  userId: number;
  eventId: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string;
}

interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'HOST';
  password?: string;
}

interface EventFormValues {
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
}

/**
 * AdminDashboard Component
 * A protected dashboard that allows administrators to manage users and events
 * Only accessible to users with admin role
 */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userForm] = Form.useForm();
  const [eventForm] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isEventEditModalVisible, setIsEventEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventReservations, setEventReservations] = useState<Reservation[]>([]);

  /**
   * useEffect hook to fetch users and events data when component mounts
   * Also handles authentication check
   */
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Fetch all users from the admin endpoint
    axios
      .get("http://localhost:3000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch all events from the admin endpoint
    axios
      .get("http://localhost:3000/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error fetching events:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  /**
   * Handler function to delete a user
   * @param userId - The ID of the user to delete
   */
  const deleteUser = (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      navigate("/signin");
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(users.filter((user) => user.id !== userId));
          message.success('User deleted successfully');
        } catch (err) {
          console.error("Error deleting user:", err);
          message.error('Failed to delete user');
        }
      }
    });
  };

  /**
   * Handler function to delete an event
   * @param eventId - The ID of the event to delete
   */
  const deleteEvent = (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Authentication required");
      navigate("/signin");
      return;
    }

    Modal.confirm({
      title: 'Are you sure you want to delete this event?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3000/admin/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEvents(events.filter((event) => event.id !== eventId));
          message.success('Event deleted successfully');
        } catch (err) {
          console.error("Error deleting event:", err);
          message.error('Failed to delete event');
        }
      }
    });
  };

  const handleUserSubmit = async (values: UserFormValues) => {
    try {
      const token = localStorage.getItem("token");
      if (editingUser) {
        await axios.put(
          `http://localhost:3000/admin/users/${editingUser.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('User updated successfully');
      } else {
        await axios.post(
          "http://localhost:3000/admin/users",
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('User created successfully');
      }
      fetchUsers();
      setIsUserModalVisible(false);
      userForm.resetFields();
    } catch (err) {
      message.error('Failed to save user');
      console.error('Error saving user:', err);
    }
  };

  const handleEventClick = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/admin/events/${event.id}/reservations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEventReservations(response.data);
      setIsEventModalVisible(true);
    } catch (err) {
      message.error('Failed to fetch event reservations');
      console.error('Error fetching reservations:', err);
    }
  };

  const handleEventEditSubmit = async (values: EventFormValues) => {
    try {
      const token = localStorage.getItem("token");
      if (!editingEvent) return;

      await axios.put(
        `http://localhost:3000/admin/events/${editingEvent.id}`,
        {
          ...values,
          date: dayjs(values.date).format('YYYY-MM-DD HH:mm:ss')
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      message.success('Event updated successfully');
      
      // Refresh events list
      const response = await axios.get("http://localhost:3000/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
      
      setIsEventEditModalVisible(false);
      eventForm.resetFields();
    } catch (err) {
      message.error('Failed to update event');
      console.error('Error updating event:', err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const reservationColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record: Reservation) => `${record.userFirstName} ${record.userLastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'userEmail',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'CONFIRMED' ? 'green' :
          status === 'CANCELLED' ? 'red' : 'orange'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  // Function to get role tag color
  const getRoleTagColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'HOST':
        return 'green';
      default:
        return 'blue';
    }
  };

  // Show loading state while data is being fetched
  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Admin Dashboard</Title>
        <Button 
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem("token");
            message.success("Signed out successfully");
            navigate("/");
          }}
        >
          Sign Out
        </Button>
      </div>
      
      {/* Users Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Title level={3}>Users</Title>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              setEditingUser(null);
              userForm.resetFields();
              setIsUserModalVisible(true);
            }}
          >
            Create User
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-shadow duration-300"
              actions={[
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingUser(user);
                    userForm.setFieldsValue(user);
                    setIsUserModalVisible(true);
                  }}
                >
                  Edit
                </Button>,
                <Button
                  danger
                  icon={<DeleteOutlined />}
              onClick={() => deleteUser(user.id)}
            >
              Delete
                </Button>
              ]}
              extra={
                <Tag color={getRoleTagColor(user.role)}>
                  {user.role}
                </Tag>
              }
            >
              <Card.Meta
                title={`${user.firstName} ${user.lastName}`}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">{user.email}</Text>
                    <Text type="secondary">Created: {new Date(user.createdAt).toLocaleDateString()}</Text>
                  </Space>
                }
              />
            </Card>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div>
        <Title level={3} className="mb-4">Events</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-shadow duration-300"
              actions={[
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingEvent(event);
                    eventForm.setFieldsValue({
                      ...event,
                      date: dayjs(event.date)
                    });
                    setIsEventEditModalVisible(true);
                  }}
                >
                  Edit
                </Button>,
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEventClick(event)}
                >
                  View Details
                </Button>,
                <Button
                  danger
                  icon={<DeleteOutlined />}
              onClick={() => deleteEvent(event.id)}
            >
              Delete
                </Button>
              ]}
            >
              <Card.Meta
                title={event.title}
                description={
                  <Space direction="vertical">
                    <Text type="secondary">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <Text>{event.description}</Text>
                    <Space>
                      <Text strong>Location:</Text>
                      <Text>{event.location}</Text>
                    </Space>
                    <Space>
                      <Text strong>Available Seats:</Text>
                      <Text>{event.maxParticipants}</Text>
                    </Space>
                    <Space>
                      <Text strong>Host:</Text>
                      <Text>{event.hostFirstName} {event.hostLastName}</Text>
                    </Space>
                    <Text type="secondary">Created: {new Date(event.createdAt).toLocaleDateString()}</Text>
                  </Space>
                }
              />
            </Card>
          ))}
        </div>
      </div>

      {/* User Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Create User"}
        open={isUserModalVisible}
        onOk={userForm.submit}
        onCancel={() => {
          setIsUserModalVisible(false);
          userForm.resetFields();
        }}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please input first name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please input last name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select>
              <Option value="USER">User</Option>
              <Option value="HOST">Host</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input password!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        title="Event Details"
        open={isEventModalVisible}
        onCancel={() => setIsEventModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedEvent && (
          <div>
            <Title level={4}>{selectedEvent.title}</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>Date:</Text>
                <Text style={{ marginLeft: 8 }}>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </div>
              <div>
                <Text strong>Description:</Text>
                <Text style={{ marginLeft: 8 }}>{selectedEvent.description}</Text>
              </div>
              <div>
                <Text strong>Location:</Text>
                <Text style={{ marginLeft: 8 }}>{selectedEvent.location}</Text>
              </div>
              <div>
                <Text strong>Max Participants:</Text>
                <Text style={{ marginLeft: 8 }}>{selectedEvent.maxParticipants}</Text>
              </div>
              <div>
                <Text strong>Host:</Text>
                <Text style={{ marginLeft: 8 }}>
                  {selectedEvent.hostFirstName} {selectedEvent.hostLastName}
                </Text>
              </div>
              <div>
                <Text strong>Created:</Text>
                <Text style={{ marginLeft: 8 }}>
                  {new Date(selectedEvent.createdAt).toLocaleDateString()}
                </Text>
              </div>
            </Space>

            <Title level={4} style={{ marginTop: 24 }}>Reservations</Title>
            <Table
              columns={reservationColumns}
              dataSource={eventReservations}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Modal>

      {/* Event Edit Modal */}
      <Modal
        title="Edit Event"
        open={isEventEditModalVisible}
        onOk={eventForm.submit}
        onCancel={() => {
          setIsEventEditModalVisible(false);
          eventForm.resetFields();
        }}
      >
        <Form
          form={eventForm}
          layout="vertical"
          onFinish={handleEventEditSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input event title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input event description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date and Time"
            rules={[{ required: true, message: 'Please select event date and time!' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input event location!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="maxParticipants"
            label="Maximum Participants"
            rules={[{ required: true, message: 'Please input maximum participants!' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
