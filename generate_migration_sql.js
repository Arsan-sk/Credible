const fs = require('fs');
const path = require('path');

// Helper to read JSON file safely (stripping UTF-8 BOM if present)
function readJsonFileSync(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

try {
  const currentQuiz = readJsonFileSync(path.join(__dirname, 'current-quiz.json'));
  const guestQuiz = readJsonFileSync(path.join(__dirname, 'guest-quiz.json'));

  // Format current quiz SQL
  const currentSql = `-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Populate Current Quiz
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.system_quizzes (quiz_type, quiz_data, updated_at)
VALUES ('current', $$${JSON.stringify(currentQuiz, null, 2)}$$::jsonb, now())
ON CONFLICT (quiz_type) DO UPDATE SET 
  quiz_data = EXCLUDED.quiz_data,
  updated_at = now();
`;

  // Format guest quiz SQL
  const guestSql = `-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Populate Featured/Guest Quiz
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.system_quizzes (quiz_type, quiz_data, updated_at)
VALUES ('featured', $$${JSON.stringify(guestQuiz, null, 2)}$$::jsonb, now())
ON CONFLICT (quiz_type) DO UPDATE SET 
  quiz_data = EXCLUDED.quiz_data,
  updated_at = now();
`;

  fs.writeFileSync(path.join(__dirname, 'migration_populate_current_quiz.sql'), currentSql);
  fs.writeFileSync(path.join(__dirname, 'migration_populate_featured_quiz.sql'), guestSql);

  console.log('✅ Generated migration_populate_current_quiz.sql');
  console.log('✅ Generated migration_populate_featured_quiz.sql');
} catch (err) {
  console.error('❌ Failed to generate SQL populate files:', err.message);
  process.exit(1);
}
