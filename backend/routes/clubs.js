const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/clubs — Public, get all clubs
router.get('/', (req, res) => {
  const { category } = req.query;

  let query = `
    SELECT c.*, u.name AS adminName
    FROM clubs c
    LEFT JOIN users u ON c.adminID = u.userID
  `;
  const params = [];

  if (category) {
    query += ' WHERE c.category = ?';
    params.push(category);
  }

  query += ' ORDER BY c.clubName ASC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ clubs: results });
  });
});

// GET /api/clubs/:id — Public, get one club
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.*, u.name AS adminName
    FROM clubs c
    LEFT JOIN users u ON c.adminID = u.userID
    WHERE c.clubID = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Club not found.' });
    res.json({ club: results[0] });
  });
});

// POST /api/clubs — Protected, create a club
router.post('/', verifyToken, requireRole('systemAdmin', 'clubAdmin'), (req, res) => {
 const { clubName, description, category, contactEmail, membershipLink, bannerUrl, profilePicUrl } = req.body;

if (!clubName) {
  return res.status(400).json({ message: 'clubName is required.' });
}

const adminID = req.user.userID;

const query = `
  INSERT INTO clubs (clubName, description, category, adminID, contactEmail, membershipLink, bannerUrl, profilePicUrl)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

db.query(query, [clubName, description, category, adminID, contactEmail, membershipLink, bannerUrl || null, profilePicUrl || null], (err, result) => {
  if (err) return res.status(500).json({ message: 'Error creating club', error: err.message });
  res.status(201).json({
    message: 'Club created successfully!',
    clubID: result.insertId
  });
});
});

// PUT /api/clubs/:id — Protected, update a club
router.put('/:id', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { id } = req.params;
  const { clubName, description, category, contactEmail, membershipLink, bannerUrl, profilePicUrl } = req.body;

  db.query('SELECT * FROM clubs WHERE clubID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Club not found.' });

    const club = results[0];

    if (req.user.role === 'clubAdmin' && club.adminID !== req.user.userID) {
      return res.status(403).json({ message: 'You can only edit your own club.' });
    }

    const query = `
      UPDATE clubs
      SET clubName = ?, description = ?, category = ?, contactEmail = ?, membershipLink = ?, bannerUrl = ?, profilePicUrl = ?
      WHERE clubID = ?
    `;

    db.query(query, [
      clubName || club.clubName,
      description || club.description,
      category || club.category,
      contactEmail || club.contactEmail,
      membershipLink || club.membershipLink,
      bannerUrl !== undefined ? bannerUrl : club.bannerUrl,
      profilePicUrl !== undefined ? profilePicUrl : club.profilePicUrl,
      id
    ], (err) => {
      if (err) return res.status(500).json({ message: 'Error updating club', error: err.message });
      res.json({ message: 'Club updated successfully!' });
    });
  });
});


// DELETE /api/clubs/:id — systemAdmin only
router.delete('/:id', verifyToken, requireRole('systemAdmin'), (req, res) => {
  db.query('DELETE FROM clubs WHERE clubID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting club', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Club not found.' });
    res.json({ message: 'Club deleted successfully.' });
  });
});

module.exports = router;