import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EventPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<any>(null);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/events/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setEvent(response.data.event);
                setReservations(response.data.reservations);
            })
            .catch((error) => console.error('Error fetching event details:', error))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleString()}</p>
            <p>Location: {event.location}</p>
            <p>Seats Left: {event.maxParticipants - reservations.length}</p>

            <h2>Reservations</h2>
            <ul>
                {reservations.map((reservation) => (
                    <li key={reservation.id}>
                        {reservation.userName} - {reservation.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventPage;
