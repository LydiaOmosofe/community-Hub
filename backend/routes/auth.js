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

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    db.query('UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?', [token, expiry, email], async (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const resetLink = `http://localhost:3000/reset-password/${token}`;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'SEGi Community Hub — Password Reset',
          html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${resetLink}">${resetLink}</a>`
        });
      } catch (e) { console.error('Email error:', e.message); }

      res.json({ message: 'If that email exists, a reset link has been sent.' });
    });
  });
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  db.query('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()', [token], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    const passwordHash = bcrypt.hashSync(password, 10);
    db.query('UPDATE users SET passwordHash = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE userID = ?', [passwordHash, results[0].userID], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Password reset successful! You can now log in.' });
    });
  });
});

module.exports = router;