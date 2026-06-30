const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/notifications — get notifications for logged-in student
router.get('/', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM notifications WHERE userID = ? ORDER BY sentDate DESC',
    [req.user.userID],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ notifications: results });
    }
  );
});

// GET /api/notifications/unread-count — badge count for navbar
router.get('/unread-count', verifyToken, (req, res) => {
  db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE userID = ? AND isRead = 0',
    [req.user.userID],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ count: results[0].count });
    }
  );
});

// PATCH /api/notifications/:notifID — mark as read
router.patch('/:notifID', verifyToken, (req, res) => {
  db.query(
    'UPDATE notifications SET isRead = 1 WHERE notifID = ? AND userID = ?',
    [req.params.notifID, req.user.userID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Marked as read.' });
    }
  );
});

// PATCH /api/notifications/mark-all-read — mark all as read
router.patch('/mark-all-read', verifyToken, (req, res) => {
  db.query(
    'UPDATE notifications SET isRead = 1 WHERE userID = ?',
    [req.user.userID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'All marked as read.' });
    }
  );
});

// POST /api/notifications — Admin sends broadcast to ALL students
router.post('/', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
  const { message, type, title } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required.' });

  // Get all students
  db.query('SELECT userID FROM users WHERE role = "student"', (err, students) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (students.length === 0) return res.json({ message: 'No students to notify.' });

    const values = students.map(s => [s.userID, title || null, message, type || 'info', null]);
    db.query(
      'INSERT INTO notifications (userID, title, message, type, clubID) VALUES ?',
      [values],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error sending notifications', error: err.message });
        res.status(201).json({ message: `Notification sent to ${students.length} students!` });
      }
    );
  });
});

// POST /api/notifications/announce/:clubID — send to followers of a club
router.post('/announce/:clubID', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
  const { message, type, title } = req.body;
  const { clubID } = req.params;
  if (!message) return res.status(400).json({ message: 'Message is required.' });

  // Get followers of this club
  db.query('SELECT userID FROM follows WHERE clubID = ?', [clubID], (err, followers) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (followers.length === 0) return res.json({ message: 'No followers to notify.' });

    const values = followers.map(f => [f.userID, title || null, message, type || 'info', clubID]);
    db.query(
      'INSERT INTO notifications (userID, title, message, type, clubID) VALUES ?',
      [values],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error sending notifications', error: err.message });
        res.status(201).json({ message: `Notified ${followers.length} followers!` });
      }
    );
  });
});

// POST /api/notifications/follow/:clubID — follow a club
router.post('/follow/:clubID', verifyToken, (req, res) => {
  db.query(
    'INSERT IGNORE INTO follows (userID, clubID) VALUES (?, ?)',
    [req.user.userID, req.params.clubID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Following!' });
    }
  );
});

// DELETE /api/notifications/follow/:clubID — unfollow a club
router.delete('/follow/:clubID', verifyToken, (req, res) => {
  db.query(
    'DELETE FROM follows WHERE userID = ? AND clubID = ?',
    [req.user.userID, req.params.clubID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Unfollowed.' });
    }
  );
});

// GET /api/notifications/follow/:clubID — check if following
router.get('/follow/:clubID', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM follows WHERE userID = ? AND clubID = ?',
    [req.user.userID, req.params.clubID],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ following: results.length > 0 });
    }
  );
});

// DELETE /api/notifications/:notifID — admin delete
router.delete('/:notifID', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
  db.query('DELETE FROM notifications WHERE notifID = ?', [req.params.notifID], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Deleted.' });
  });
});

// GET /api/notifications/all — Admin sees all notifications ever sent
router.get('/all', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
  db.query(
    'SELECT n.*, u.name as recipientName FROM notifications n LEFT JOIN users u ON n.userID = u.userID ORDER BY n.sentDate DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ notifications: results });
    }
  );
});

module.exports = router;