import express from 'express';
const app = express();
import cors from 'cors';
import mysql from 'mysql';
import bodyParser from 'body-parser';

// Create a connection pool to the database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'event_reservation',
});

// Middlewarehttp://localhost:5173/signup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// POST endpoint for signup
app.post('/signup', (req, res) => {
  const { email, password, firstname, lastname, role } = req.body;

  // Check if all required fields are provided
  if (!email || !password || !firstname || !lastname || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // SQL query to insert data into the database
  const sqlInsert = "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)";

  db.query(sqlInsert, [email, password, firstname, lastname, role], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Error inserting user', error: err });
    }

    // Send success response back to the frontend
    console.log('User created successfully:', result);
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  });
});
app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // SQL query to check if the user exists with the provided credentials
  const sqlSelect = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sqlSelect, [email, password], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user', error: err });
    }

    if (result.length > 0) {
      // User found
      const user = result[0];
      res.status(200).json({
        message: 'Sign in successful',
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstName,
          lastname: user.lastName,
          role: user.role,
        }
      });
    } else {
      // User not found
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});
// Test route
app.get('/', (req, res) => {
  res.send('Hamiiiiid!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
