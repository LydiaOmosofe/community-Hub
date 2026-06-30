const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/notifications — Protected, get all notifications for logged in student
router.get('/', verifyToken, (req, res) => {
  const userID = req.user.userID;

  const query = `
    SELECT * FROM notifications
    WHERE userID = ?
    ORDER BY sentDate DESC
  `;

  db.query(query, [userID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ notifications: results });
  });
});

// PUT /api/notifications/:id/read — Protected, mark a notification as read
router.put('/:id/read', verifyToken, (req, res) => {
  const query = `
    UPDATE notifications
    SET isRead = TRUE
    WHERE notifID = ? AND userID = ?
  `;

  db.query(query, [req.params.id, req.user.userID], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ message: 'Notification marked as read.' });
  });
});

// POST /api/notifications — Protected, systemAdmin sends a notification to a student
router.post('/', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
  const { userID, message, type } = req.body;

  if (!userID || !message) {
    return res.status(400).json({ message: 'userID and message are required.' });
  }

  const query = `
    INSERT INTO notifications (userID, message, type)
    VALUES (?, ?, ?)
  `;

  db.query(query, [userID, message, type || 'general'], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error sending notification', error: err.message });
    res.status(201).json({
      message: 'Notification sent successfully!',
      notifID: result.insertId
    });
  });
});

// DELETE /api/notifications/:id — Protected, delete a notification
router.delete('/:id', verifyToken, requireRole('systemAdmin'), (req, res) => {
  db.query('DELETE FROM notifications WHERE notifID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting notification', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ message: 'Notification deleted successfully.' });
  });
});

module.exports = router;