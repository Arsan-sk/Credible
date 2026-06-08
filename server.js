const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const QUIZ_FILE = path.join(__dirname, 'current-quiz.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Serve Vite build in production ──────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ── Webhook endpoint: n8n sends quiz data here ──────────────────────────────
app.post('/webhook/quiz', (req, res) => {
  try {
    const body = req.body;

    // Accept both wrapped { quiz: {...} } and raw { questions: [...] }
    let quizData = null;

    if (body?.quiz?.questions) {
      quizData = body.quiz;
    } else if (body?.questions) {
      quizData = body;
    } else if (Array.isArray(body)) {
      // n8n sometimes sends arrays
      const first = body[0];
      quizData = first?.quiz || first?.json?.quiz || first;
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      return res.status(400).json({ error: 'Invalid quiz payload. Expected { quiz: { metadata, questions } }' });
    }

    // Stamp received time
    quizData.received_at = new Date().toISOString();

    fs.writeFileSync(QUIZ_FILE, JSON.stringify(quizData, null, 2));
    console.log(`✅ Quiz received: ${quizData.questions.length} questions`);

    res.json({
      success: true,
      message: `Quiz stored. ${quizData.questions.length} questions ready.`,
      quiz_url: `http://localhost:${PORT}/`,
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── API: quiz app fetches current quiz ──────────────────────────────────────
app.get('/api/quiz', (req, res) => {
  if (!fs.existsSync(QUIZ_FILE)) {
    return res.status(404).json({ error: 'No quiz loaded yet. Send data to POST /webhook/quiz first.' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Corrupt quiz file.' });
  }
});

// ── API: guest quiz (featured assessment) ───────────────────────────────────
const GUEST_QUIZ_FILE = path.join(__dirname, 'guest-quiz.json');

app.get('/api/guest-quiz', (req, res) => {
  if (!fs.existsSync(GUEST_QUIZ_FILE)) {
    return res.status(404).json({ error: 'No guest quiz available.' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(GUEST_QUIZ_FILE, 'utf8'));
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Corrupt guest quiz file.' });
  }
});

// ── Serve index.html for all other routes (SPA client-side routing) ─────────
app.get('/{*splat}', (req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Credible running at http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: POST http://localhost:${PORT}/webhook/quiz`);
  console.log(`📋 Quiz API: GET http://localhost:${PORT}/api/quiz\n`);
});
