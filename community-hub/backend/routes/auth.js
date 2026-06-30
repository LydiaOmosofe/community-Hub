const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// REGISTER
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if email already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already registered' });

    // Hash the password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert new user
    db.query(
      'INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role || 'student'],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error creating user' });
        res.status(201).json({ message: 'User registered successfully!' });
      }
    );
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];

    // Check password
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    // Create token
    const token = jwt.sign(
      { userID: user.userID, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;