/**
 * LocalStorage abstraction for quiz state and certificates.
 */

const KEYS = {
  QUIZ: 'credible_quiz',
  QUIZ_STATE: 'credible_quiz_state',
  USER_NAME: 'credible_user_name',
  CERTIFICATES: 'credible_certificates',
  ATTEMPTS: 'credible_attempts',
};

// ── Quiz Data ───────────────────────────────────────────────────────────────

export function saveQuiz(quizData) {
  localStorage.setItem(KEYS.QUIZ, JSON.stringify(quizData));
}

export function loadQuiz() {
  try {
    const data = localStorage.getItem(KEYS.QUIZ);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ── Quiz State (answers, progress) ──────────────────────────────────────────

export function saveQuizState(state) {
  localStorage.setItem(KEYS.QUIZ_STATE, JSON.stringify(state));
}

export function loadQuizState() {
  try {
    const data = localStorage.getItem(KEYS.QUIZ_STATE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearQuizState() {
  localStorage.removeItem(KEYS.QUIZ_STATE);
}

// ── User Name ───────────────────────────────────────────────────────────────

export function saveUserName(name) {
  localStorage.setItem(KEYS.USER_NAME, name);
}

export function loadUserName() {
  return localStorage.getItem(KEYS.USER_NAME) || '';
}

// ── Certificates ────────────────────────────────────────────────────────────

export function saveCertificate(cert) {
  const certs = getAllCertificates();
  certs[cert.certificateId] = cert;
  localStorage.setItem(KEYS.CERTIFICATES, JSON.stringify(certs));
}

export function getCertificate(id) {
  const certs = getAllCertificates();
  return certs[id] || null;
}

export function getAllCertificates() {
  try {
    const data = localStorage.getItem(KEYS.CERTIFICATES);
    const parsed = data ? JSON.parse(data) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function clearCertificates() {
  localStorage.removeItem(KEYS.CERTIFICATES);
}

// ── Attempts (History) ──────────────────────────────────────────────────────

export function saveAttempt(attempt) {
  const attempts = getAllAttempts();
  attempts[attempt.attemptId] = attempt;
  localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(attempts));
}

export function getAttempt(id) {
  const attempts = getAllAttempts();
  return attempts[id] || null;
}

export function getAllAttempts() {
  try {
    const data = localStorage.getItem(KEYS.ATTEMPTS);
    const parsed = data ? JSON.parse(data) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function clearAttempts() {
  localStorage.removeItem(KEYS.ATTEMPTS);
}

// ── Clear All ───────────────────────────────────────────────────────────────

export function clearQuizData() {
  localStorage.removeItem(KEYS.QUIZ);
  localStorage.removeItem(KEYS.QUIZ_STATE);
  localStorage.removeItem(KEYS.USER_NAME);
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

