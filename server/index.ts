import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql';
import bodyParser from 'body-parser';

// Initialize Express application
const app = express();

// Configure MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'event_reservation',
});

// JWT secret key for token signing
const SECRET_KEY = 'your_jwt_secret_key';

// Middleware configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

/**
 * User Registration Endpoint
 * Creates a new user account with the provided information
 */
app.post('/signup', (req, res) => {
  const { email, password, firstname, lastname, role } = req.body;

  // Validate required fields
  if (!email || !password || !firstname || !lastname || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Insert new user into database
  const sqlInsert = "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)";

  db.query(sqlInsert, [email, password, firstname, lastname, role], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error inserting user', error: err });
    }
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  });
});

/**
 * User Login Endpoint
 * Authenticates user and returns JWT token
 */
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check user credentials
  const sqlSelect = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sqlSelect, [email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user', error: err });
    }

    if (result.length > 0) {
      const user = result[0];

      // Generate JWT token with user information
      const token = jwt.sign(
        { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        message: 'Sign in successful',
        token,
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

/**
 * JWT Token Verification Middleware
 * Validates the JWT token and attaches user information to the request
 */
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};

/**
 * Admin Role Verification Middleware
 * Ensures that only users with admin role can access protected routes
 */
const verifyAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

/**
 * User Profile Endpoint
 * Returns the current user's profile information
 */
app.get('/user', verifyToken, (req, res) => {
  res.status(200).json({
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
  });
});

/**
 * Public Events Endpoint
 * Returns all events without authentication
 */
app.get('/events/all', (req, res) => {
  const sqlSelect = `SELECT * FROM events`;

  db.query(sqlSelect, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching all events', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * User's Events Endpoint
 * Returns events created by the authenticated user
 */
app.get('/events', verifyToken, (req, res) => {
  const hostId = req.user.id;

  const sqlSelect = `SELECT * FROM events WHERE createdBy = ?`;

  db.query(sqlSelect, [hostId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching events', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * Create Event Endpoint
 * Creates a new event with the provided information
 */
app.post('/events', verifyToken, (req, res) => {
  const { title, description, date, location, maxParticipants } = req.body;
  const createdBy = req.user.id;

  // Validate required fields
  if (!title || !description || !date || !maxParticipants) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Insert new event into database
  const sqlInsert = `
    INSERT INTO events (title, description, date, location, maxParticipants, createdBy)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sqlInsert, [title, description, date, location, maxParticipants, createdBy], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating event', error: err });
    }
    res.status(201).json({ message: 'Event created successfully', eventId: result.insertId });
  });
});

/**
 * Event Details Endpoint
 * Returns detailed information about a specific event including reservations
 */
app.get('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;

  const sqlEvent = `SELECT * FROM events WHERE id = ?`;
  const sqlReservations = `
    SELECT r.id, r.status, u.firstName, u.lastName
    FROM reservations r
    LEFT JOIN users u ON r.userId = u.id
    WHERE r.eventId = ?`;

  console.log("Fetching event with ID:", eventId);

  db.query(sqlEvent, [eventId], (err, eventResult) => {
    if (err) {
      console.error("Error fetching event:", err);
      return res.status(500).json({ message: 'Error fetching event', error: err });
    }

    if (eventResult.length === 0) {
      console.log("No event found for ID:", eventId);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Fetch reservations for the event
    db.query(sqlReservations, [eventId], (err, reservationsResult) => {
      if (err) {
        console.error("Error fetching reservations:", err);
        return res.status(500).json({ message: 'Error fetching reservations', error: err });
      }

      console.log("Event details:", eventResult[0]);
      console.log("Reservations:", reservationsResult);

      res.status(200).json({
        event: eventResult[0],
        reservations: reservationsResult || [],
      });
    });
  });
});

/**
 * Update Event Endpoint
 * Updates an existing event's information
 */
app.put('/events/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, maxParticipants } = req.body;

  // Validate required fields
  if (!title || !description || !date || !location || !maxParticipants) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Update event in database
  const sqlUpdate = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, location = ?, maxParticipants = ? 
    WHERE id = ? AND createdBy = ?
  `;

  db.query(
    sqlUpdate,
    [title, description, date, location, maxParticipants, id, req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating event', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found or unauthorized' });
      }

      res.status(200).json({ message: 'Event updated successfully' });
    }
  );
});

/**
 * Delete Event Endpoint
 * Deletes an existing event
 */
app.delete('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;
  const sql = "DELETE FROM events WHERE id = ?";
  db.query(sql, [eventId], (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting event', error: err });
      res.status(200).json({ message: 'Event deleted successfully' });
  });
});

/**
 * User's Reservations Endpoint
 * Returns all events that the authenticated user has reserved
 */
app.get('/reservations', verifyToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT e.* FROM reservations r
    JOIN events e ON r.eventId = e.id
    WHERE r.userId = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching reservations', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * Create Reservation Endpoint
 * Creates a new reservation for an event
 */
app.post('/reservations', verifyToken, (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  // SQL queries for reservation process
  const sqlCheck = `SELECT * FROM reservations WHERE userId = ? AND eventId = ?`;
  const sqlReserve = `INSERT INTO reservations (userId, eventId) VALUES (?, ?)`;
  const sqlUpdateSeats = `UPDATE events SET maxParticipants = maxParticipants - 1 WHERE id = ? AND maxParticipants > 0`;

  // Check for existing reservation
  db.query(sqlCheck, [userId, eventId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking reservation', error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'You have already made a reservation for this event' });
    }

    // Create new reservation
    db.query(sqlReserve, [userId, eventId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error making reservation', error: err });
      }

      // Update available seats
      db.query(sqlUpdateSeats, [eventId], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating seats', error: err });
        }

        res.status(201).json({ message: 'Reservation successful' });
      });
    });
  });
});

/**
 * Delete Reservation Endpoint
 * Cancels an existing reservation
 */
app.delete('/reservations', verifyToken, (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  // SQL queries for reservation cancellation
  const sqlCheck = `SELECT * FROM reservations WHERE userId = ? AND eventId = ?`;
  const sqlDelete = `DELETE FROM reservations WHERE userId = ? AND eventId = ?`;
  const sqlUpdateSeats = `UPDATE events SET maxParticipants = maxParticipants + 1 WHERE id = ?`;

  // Check for existing reservation
  db.query(sqlCheck, [userId, eventId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking reservation', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Delete reservation
    db.query(sqlDelete, [userId, eventId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting reservation', error: err });
      }

      // Update available seats
      db.query(sqlUpdateSeats, [eventId], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating seats', error: err });
        }

        res.status(200).json({ message: 'Reservation deleted successfully' });
      });
    });
  });
});

/**
 * Admin Endpoints
 */

/**
 * Get All Users Endpoint (Admin only)
 * Returns a list of all users in the system
 */
app.get('/admin/users', verifyToken, verifyAdmin, (req, res) => {
  const sqlSelect = "SELECT id, email, firstName, lastName, role FROM users";
  
  db.query(sqlSelect, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * Get All Events Endpoint (Admin only)
 * Returns a list of all events with host information
 */
app.get('/admin/events', verifyToken, verifyAdmin, (req, res) => {
  const sqlSelect = `
    SELECT e.*, u.firstName as hostFirstName, u.lastName as hostLastName 
    FROM events e 
    LEFT JOIN users u ON e.createdBy = u.id
  `;
  
  db.query(sqlSelect, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching events', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * Delete User Endpoint (Admin only)
 * Deletes a user from the system
 */
app.delete('/admin/users/:id', verifyToken, verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const sqlDelete = "DELETE FROM users WHERE id = ?";
  
  db.query(sqlDelete, [userId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting user', error: err });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

/**
 * Delete Event Endpoint (Admin only)
 * Deletes an event from the system
 */
app.delete('/admin/events/:id', verifyToken, verifyAdmin, (req, res) => {
  const eventId = req.params.id;
  const sqlDelete = "DELETE FROM events WHERE id = ?";
  
  db.query(sqlDelete, [eventId], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting event', error: err });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  });
});

/**
 * Get Event Reservations Endpoint (Admin only)
 * Returns all reservations for a specific event with user details
 */
app.get('/admin/events/:id/reservations', verifyToken, verifyAdmin, (req, res) => {
  const eventId = req.params.id;
  
  const sqlSelect = `
    SELECT 
      r.id,
      r.userId,
      r.eventId,
      r.status,
      r.createdAt,
      u.firstName as userFirstName,
      u.lastName as userLastName,
      u.email as userEmail
    FROM reservations r
    LEFT JOIN users u ON r.userId = u.id
    WHERE r.eventId = ?
    ORDER BY r.createdAt DESC
  `;
  
  db.query(sqlSelect, [eventId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching reservations', error: err });
    }
    res.status(200).json(results);
  });
});

/**
 * Update Event Endpoint (Admin only)
 * Updates an event's information
 */
app.put('/admin/events/:id', verifyToken, verifyAdmin, (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, location, maxParticipants } = req.body;

  // Validate required fields
  if (!title || !description || !date || !location || !maxParticipants) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sqlUpdate = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, location = ?, maxParticipants = ?
    WHERE id = ?
  `;

  db.query(
    sqlUpdate,
    [title, description, date, location, maxParticipants, eventId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating event', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.status(200).json({ message: 'Event updated successfully' });
    }
  );
});

/**
 * Update User Endpoint (Admin only)
 * Updates a user's information
 */
app.put('/admin/users/:id', verifyToken, verifyAdmin, (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, role } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sqlUpdate = `
    UPDATE users 
    SET firstName = ?, lastName = ?, email = ?, role = ?
    WHERE id = ?
  `;

  db.query(
    sqlUpdate,
    [firstName, lastName, email, role, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating user', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully' });
    }
  );
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
