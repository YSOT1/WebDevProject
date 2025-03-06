/**
 * Home Component - The main landing page of the Event Reservation System
 * 
 * This component serves as the public-facing homepage where users can:
 * - Browse all available events without needing to log in
 * - See event details including date, location, and available seats
 * - Be prompted to sign in or create an account when trying to make a reservation
 * 
 * The page features a clean, modern design with:
 * - A welcoming header with clear call-to-action buttons
 * - A responsive grid layout for event cards
 * - Loading states and error handling for API calls
 */

import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

/**
 * Event Interface
 * 
 * Defines the structure of an event object as received from the API
 * Includes all necessary fields for displaying event information
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
  hostFirstName: string | null;
  hostLastName: string | null;
}

const Home: React.FC = () => {
  // State management for events and loading status
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * useEffect Hook - Data Fetching
   * 
   * Fetches all events from the API when the component mounts
   * Handles loading states and error cases
   */
  useEffect(() => {
    axios.get('http://localhost:3000/events/all')
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        message.error('Failed to load events');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Reservation Click Handler
   * 
   * Checks if the user is authenticated before allowing reservations
   * Shows a friendly message prompting sign-in if not authenticated
   */
  const handleReservationClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.info('Please sign in or create an account to make a reservation');
    }
  };

  // Show loading state while events are being fetched
  if (loading) {
    return <div className="text-center p-8">Loading events...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Title level={1}>Welcome to Event Reservation</Title>
          <Text className="text-lg">Discover and join amazing events</Text>
          {/* Authentication Buttons */}
          <div className="mt-6">
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button size="large" onClick={() => navigate('/signup')}>
                Create Account
              </Button>
            </Space>
          </div>
        </div>

        {/* Events Grid Section */}
        <Title level={2} className="mb-6">Upcoming Events</Title>
        <Row gutter={[16, 16]}>
          {events.map(event => (
            <Col xs={24} sm={12} lg={8} key={event.id}>
              {/* Individual Event Card */}
              <Card
                className="h-full"
                title={event.title}
                actions={[
                  <Button 
                    type="primary" 
                    onClick={handleReservationClick}
                  >
                    Make Reservation
                  </Button>
                ]}
              >
                {/* Event Details */}
                <Space direction="vertical" className="w-full">
                  <Text>
                    <strong>Date:</strong>{' '}
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text>
                    <strong>Location:</strong> {event.location}
                  </Text>
                  <Text>
                    <strong>Available Seats:</strong> {event.maxParticipants}
                  </Text>
                  <Text>
                    <strong>Host:</strong> {event.hostFirstName} {event.hostLastName}
                  </Text>
                  <Text>{event.description}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home; 