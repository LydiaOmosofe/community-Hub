const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/events — Public, get all events
router.get('/', (req, res) => {
  const query = `
    SELECT e.*, c.clubName
    FROM events e
    LEFT JOIN clubs c ON e.clubID = c.clubID
    ORDER BY e.eventDate ASC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ events: results });
  });
});

// GET /api/events/:id — Public, get one event
router.get('/:id', (req, res) => {
  const query = `
    SELECT e.*, c.clubName
    FROM events e
    LEFT JOIN clubs c ON e.clubID = c.clubID
    WHERE e.eventID = ?
  `;

  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event: results[0] });
  });
});

// GET /api/events/club/:clubID — Public, get all events for a specific club
router.get('/club/:clubID', (req, res) => {
  const query = `
    SELECT e.*, c.clubName
    FROM events e
    LEFT JOIN clubs c ON e.clubID = c.clubID
    WHERE e.clubID = ?
    ORDER BY e.eventDate ASC
  `;

  db.query(query, [req.params.clubID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ events: results });
  });
});

// POST /api/events — Protected, clubAdmin or systemAdmin can create events
router.post('/', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { clubID, title, description, eventDate, venue, imageUrl } = req.body;

  if (!title || !eventDate) {
  return res.status(400).json({ message: 'title and eventDate are required.' });
}

  const createdBy = req.user.userID;

  const query = `
    INSERT INTO events (clubID, title, description, eventDate, venue, createdBy, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

db.query(query, [clubID || null, title, description, eventDate, venue || null, createdBy, imageUrl || null], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating event', error: err.message });
    res.status(201).json({
      message: 'Event created successfully!',
      eventID: result.insertId
    });
  });
});

// PUT /api/events/:id — Protected, update an event
router.put('/:id', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { title, description, eventDate, venue, imageUrl } = req.body;

  db.query('SELECT * FROM events WHERE eventID = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Event not found.' });

    const event = results[0];

    if (req.user.role === 'clubAdmin' && event.createdBy !== req.user.userID) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }

    const query = `
      UPDATE events
      SET title = ?, description = ?, eventDate = ?, venue = ?, imageUrl = ?
      WHERE eventID = ?
    `;

    db.query(
      query,
      [
        title || event.title,
        description || event.description,
        eventDate || event.eventDate,
        venue || event.venue,
        imageUrl !== undefined ? imageUrl : event.imageUrl,
        req.params.id
      ],
      (err) => {
        if (err) return res.status(500).json({ message: 'Error updating event', error: err.message });
        res.json({ message: 'Event updated successfully!' });
      }
    );
  });
});

// DELETE /api/events/:id — Protected, systemAdmin only
router.delete('/:id', verifyToken, requireRole('systemAdmin'), (req, res) => {
  db.query('DELETE FROM events WHERE eventID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting event', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted successfully.' });
  });
});

module.exports = router;