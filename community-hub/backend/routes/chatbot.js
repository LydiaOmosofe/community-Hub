const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// POST /api/chatbot/query — Protected, student sends a question
router.post('/query', verifyToken, async (req, res) => {
  const { message, sessionID } = req.body;
  const studentID = req.user.userID;

  if (!message) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  try {
    // Fetch clubs and events from database to give the AI context
    const [clubs] = await db.promise().query('SELECT clubName, description, category, contactEmail, membershipLink FROM clubs');
    const [events] = await db.promise().query('SELECT e.title, e.description, e.eventDate, e.venue, c.clubName FROM events e LEFT JOIN clubs c ON e.clubID = c.clubID');

    // Build context for the AI
    const clubsContext = clubs.map(c =>
      `Club: ${c.clubName}, Category: ${c.category}, Description: ${c.description}, Contact: ${c.contactEmail}, Membership: ${c.membershipLink || 'N/A'}`
    ).join('\n');

    const eventsContext = events.map(e =>
      `Event: ${e.title}, Club: ${e.clubName}, Date: ${e.eventDate}, Venue: ${e.venue}, Description: ${e.description}`
    ).join('\n');

    // Send to Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant for Community Hub, a student community platform at SEGI University.
          You help students find information about clubs, societies and events.
          Here are the current clubs:\n${clubsContext}
          Here are the upcoming events:\n${eventsContext}
          Be friendly, helpful and keep answers short and clear.`
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    // Save conversation to database
    db.query(
      'INSERT INTO chatbot_logs (studentID, query, response, sessionID) VALUES (?, ?, ?, ?)',
      [studentID, message, aiResponse, sessionID || null],
      (err) => {
        if (err) console.error('Error saving chatbot log:', err.message);
      }
    );

    res.json({ response: aiResponse });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ message: 'Error getting AI response', error: err.message });
  }
});

// GET /api/chatbot/history — Protected, get chat history for logged in student
router.get('/history', verifyToken, (req, res) => {
  const query = `
    SELECT * FROM chatbot_logs
    WHERE studentID = ?
    ORDER BY timestamp DESC
  `;

  db.query(query, [req.user.userID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    res.json({ history: results });
  });
});

module.exports = router;