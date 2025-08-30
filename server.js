const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let participants = [];

// Student joins
app.post('/api/join', (req, res) => {
  const { name } = req.body;

  const id = uuidv4();  // unique ID
  participants.push({ id, name });

  console.log(`New participant: ${name} (ID: ${id})`);

  res.json({ message: 'Joined successfully!', id });
});

// Admin gets list
app.get('/api/participants', (req, res) => {
  res.json(participants);
});

// Current quiz API
app.get('/api/currentQuiz', (req, res) => {
  const filePath = path.join(__dirname, 'currentQuiz.json');
  if (fs.existsSync(filePath)) {
    const quiz = JSON.parse(fs.readFileSync(filePath));
    res.json(quiz);
  } else {
    res.status(404).json({ message: "No quiz started yet" });
  }
});

// Example submit answers (students)
app.post('/api/submit', (req, res) => {
  const { participantId, answers } = req.body;
  const filePath = path.join(__dirname, 'currentQuiz.json');
  if (!fs.existsSync(filePath)) return res.status(400).json({ message: "No active quiz" });

  const quiz = JSON.parse(fs.readFileSync(filePath));

  // evaluate score
  let score = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] && answers[idx] === q.correct) score++;
  });

  // save results
  quiz.results.push({ participantId, score });
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));

  res.json({ score });
});

// Serve admin through /admin route too (alternative)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
