const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/gallery/featured — Public, get all featured photos across all clubs
router.get('/featured', (req, res) => {
  db.query(
    `SELECT cg.*, c.clubName 
     FROM club_gallery cg 
     LEFT JOIN clubs c ON cg.clubID = c.clubID 
     WHERE cg.featured = 1 
     ORDER BY cg.uploadedAt DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ photos: results });
    }
  );
});

// GET /api/gallery/featured-club-page — Public, get all photos featured for Club Directory
router.get('/featured-club-page', (req, res) => {
  db.query(
    `SELECT cg.*, c.clubName 
     FROM club_gallery cg 
     LEFT JOIN clubs c ON cg.clubID = c.clubID 
     WHERE cg.featuredClubPage = 1 
     ORDER BY cg.uploadedAt DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ photos: results });
    }
  );
});

// PATCH /api/gallery/:galleryID/featuredClubPage — toggle club directory feature
router.patch('/:galleryID/featuredClubPage', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { featured } = req.body;
  db.query(
    'UPDATE club_gallery SET featuredClubPage = ? WHERE galleryID = ?',
    [featured ? 1 : 0, req.params.galleryID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Updated.' });
    }
  );
});

// PATCH /api/gallery/:galleryID/featured — Protected, toggle featured status
router.patch('/:galleryID/featured', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { featured } = req.body;
  db.query(
    'UPDATE club_gallery SET featured = ? WHERE galleryID = ?',
    [featured ? 1 : 0, req.params.galleryID],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ message: 'Updated.' });
    }
  );
});



// GET /api/gallery/:clubID — Public, get all photos for a club
router.get('/:clubID', (req, res) => {
  if (req.params.clubID === 'featured') {
    return res.status(404).json({ message: 'Not found' });
  }
  db.query(
    'SELECT * FROM club_gallery WHERE clubID = ? ORDER BY uploadedAt DESC',
    [req.params.clubID],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.json({ photos: results });
    }
  );
});

// POST /api/gallery — Protected, add a photo to a club gallery
router.post('/', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  const { clubID, imageUrl, caption } = req.body;
  if (!clubID || !imageUrl) return res.status(400).json({ message: 'clubID and imageUrl are required.' });
  db.query(
    'INSERT INTO club_gallery (clubID, imageUrl, caption) VALUES (?, ?, ?)',
    [clubID, imageUrl, caption || ''],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error adding photo', error: err.message });
      res.status(201).json({ message: 'Photo added!', galleryID: result.insertId });
    }
  );
});

// DELETE /api/gallery/:galleryID — Protected, remove a photo
router.delete('/:galleryID', verifyToken, requireRole('clubAdmin', 'systemAdmin'), (req, res) => {
  db.query('DELETE FROM club_gallery WHERE galleryID = ?', [req.params.galleryID], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting photo', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Photo not found.' });
    res.json({ message: 'Photo deleted.' });
  });
});


module.exports = router;
