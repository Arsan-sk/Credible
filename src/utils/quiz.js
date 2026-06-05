/**
 * Quiz evaluation logic.
 * Passing score is always 80% as per PRP requirements.
 */

export const PASSING_SCORE = 80;

/**
 * Evaluate quiz answers against questions.
 * @param {Array} questions - Array of question objects from the quiz payload
 * @param {Object} answers - Map of questionId -> [selectedOptions]
 * @returns {{ total, correct, wrong, skipped, percentage, passed }}
 */
export function evaluateQuiz(questions, answers) {
  const total = questions.length;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  questions.forEach((q) => {
    const userAns = answers[q.question_id] || [];
    const correctAns = q.options
      .filter((o) => o.is_correct)
      .map((o) => o.option)
      .sort();

    if (userAns.length === 0) {
      skipped++;
      return;
    }

    const userSorted = [...userAns].sort();
    const isCorrect =
      userSorted.length === correctAns.length &&
      userSorted.every((v, i) => v === correctAns[i]);

    if (isCorrect) {
      correct++;
    } else {
      wrong++;
    }
  });

  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= PASSING_SCORE;

  return { total, correct, wrong, skipped, percentage, passed };
}

/**
 * Get the question type display label.
 */
export function getQuestionTypeLabel(type) {
  const map = {
    'single-correct': 'Single Answer',
    'multi-select': 'Select All',
    scenario: 'Scenario',
    'code-output': 'Code Output',
  };
  return map[type] || 'Single Answer';
}

/**
 * Check if a question type allows multiple selections.
 */
export function isMultiSelect(type) {
  return type === 'multi-select';
}
