import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql from 'mysql';
import bodyParser from 'body-parser';

const app = express();
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'event_reservation',
});

const SECRET_KEY = 'your_jwt_secret_key';  // Secret key for signing JWT

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// POST endpoint for signup
app.post('/signup', (req, res) => {
  const { email, password, firstname, lastname, role } = req.body;

  if (!email || !password || !firstname || !lastname || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sqlInsert = "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)";

  db.query(sqlInsert, [email, password, firstname, lastname, role], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error inserting user', error: err });
    }
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  });
});

// POST endpoint for signin
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sqlSelect = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sqlSelect, [email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user', error: err });
    }

    if (result.length > 0) {
      const user = result[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role },
        SECRET_KEY,
        { expiresIn: '1h' } // Token will expire in 1 hour
      );

      return res.status(200).json({
        message: 'Sign in successful',
        token, // Send the token back to the frontend
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// Middleware to verify JWT
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Get token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;  // Attach user information to the request
    next();  // Continue to the next middleware or route handler
  });
};

// Protected route to get user data (e.g., for the dashboard)
app.get('/user', verifyToken, (req, res) => {
  res.status(200).json({
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
  });
});
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
app.post('/events', verifyToken, (req, res) => {
  const { title, description, date, location, maxParticipants } = req.body;
  const createdBy = req.user.id;

  if (!title || !description || !date || !maxParticipants) {
    return res.status(400).json({ message: 'All fields are required' });
  }

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
app.get('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;

  const sqlEvent = `SELECT * FROM events WHERE id = ?`;
  const sqlReservations = `
    SELECT r.id, r.status, u.firstName, u.lastName
    FROM reservations r
    JOIN users u ON r.userId = u.id
    WHERE r.eventId = ?`;

  db.query(sqlEvent, [eventId], (err, eventResult) => {
    if (err) return res.status(500).json({ message: 'Error fetching event', error: err });

    if (eventResult.length === 0) return res.status(404).json({ message: 'Event not found' });

    db.query(sqlReservations, [eventId], (err, reservationsResult) => {
      if (err) return res.status(500).json({ message: 'Error fetching reservations', error: err });

      res.status(200).json({ event: eventResult[0], reservations: reservationsResult });
    });
  });
});

app.delete('/events/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;
  const sql = "DELETE FROM events WHERE id = ?";
  db.query(sql, [eventId], (err) => {
      if (err) return res.status(500).json({ message: 'Error deleting event', error: err });
      res.status(200).json({ message: 'Event deleted successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
