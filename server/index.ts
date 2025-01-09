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

// Middleware
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

});
// Test route
app.get('/', (req, res) => {
  res.send('Hamiiiiid!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
