/**
 * Data layer — Supabase for persistence, localStorage for transient session state.
 *
 * Persistent data (attempts, certificates) → Supabase tables
 * Transient data (quiz cache, in-progress answers) → localStorage
 */
import { supabase } from './supabase';

// ── LocalStorage Keys (transient session state only) ────────────────────────
const KEYS = {
  QUIZ: 'credible_quiz',
  QUIZ_STATE: 'credible_quiz_state',
  USER_NAME: 'credible_user_name',
  GUEST_ID: 'credible_guest_id',
};

// ═════════════════════════════════════════════════════════════════════════════
// TRANSIENT: Quiz Cache (localStorage — quiz data is served from API)
// ═════════════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════════════
// TRANSIENT: Quiz State (in-progress answers, current question index)
// ═════════════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════════════
// TRANSIENT: User Name Cache (session-level)
// ═════════════════════════════════════════════════════════════════════════════

export function saveUserName(name) {
  localStorage.setItem(KEYS.USER_NAME, name);
}

export function loadUserName() {
  return localStorage.getItem(KEYS.USER_NAME) || '';
}

// ═════════════════════════════════════════════════════════════════════════════
// GUEST ID: Cookie-like identifier for guest tracking
// ═════════════════════════════════════════════════════════════════════════════

export function getGuestId() {
  let guestId = localStorage.getItem(KEYS.GUEST_ID);
  if (!guestId) {
    guestId = `GUEST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(KEYS.GUEST_ID, guestId);
  }
  return guestId;
}

export function setGuestId(id) {
  localStorage.setItem(KEYS.GUEST_ID, id);
}

// ═════════════════════════════════════════════════════════════════════════════
// PERSISTENT: Attempts (Supabase)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Save an attempt for a logged-in user.
 */
export async function saveAttempt(attempt) {
  const { error } = await supabase.from('attempts').upsert({
    id: attempt.attemptId,
    user_id: attempt.userId,
    quiz_id: attempt.quizId,
    title: attempt.title,
    video_url: attempt.videoUrl,
    user_name: attempt.userName,
    score: attempt.score,
    passed: attempt.passed,
    total: attempt.total,
    correct: attempt.correct,
    wrong: attempt.wrong,
    skipped: attempt.skipped,
    answers: attempt.answers,
    questions: attempt.questions,
    certificate_id: attempt.certificateId,
    provider: attempt.provider,
    model: attempt.model,
  });
  if (error) console.error('saveAttempt error:', error.message);
}

/**
 * Fetch a single attempt by ID (logged-in user).
 */
export async function getAttempt(attemptId) {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (error || !data) return null;
  return mapAttemptFromDb(data);
}

/**
 * Fetch all attempts for a logged-in user.
 */
export async function getAllAttempts(userId) {
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return {};
  const map = {};
  data.forEach((row) => {
    const attempt = mapAttemptFromDb(row);
    map[attempt.attemptId] = attempt;
  });
  return map;
}

// ═════════════════════════════════════════════════════════════════════════════
// PERSISTENT: Guest Attempts (Supabase — anon access)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Save a guest attempt.
 */
export async function saveGuestAttempt(attempt) {
  const { error } = await supabase.from('guest_attempts').upsert({
    id: attempt.attemptId,
    guest_id: attempt.guestId,
    quiz_id: attempt.quizId,
    title: attempt.title,
    video_url: attempt.videoUrl,
    user_name: attempt.userName,
    score: attempt.score,
    passed: attempt.passed,
    total: attempt.total,
    correct: attempt.correct,
    wrong: attempt.wrong,
    skipped: attempt.skipped,
    answers: attempt.answers,
    questions: attempt.questions,
    certificate_id: attempt.certificateId,
    provider: attempt.provider,
    model: attempt.model,
  });
  if (error) console.error('saveGuestAttempt error:', error.message);
}

/**
 * Fetch a single guest attempt by ID.
 */
export async function getGuestAttempt(attemptId) {
  const { data, error } = await supabase
    .from('guest_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (error || !data) return null;
  return mapGuestAttemptFromDb(data);
}

/**
 * Check if a guest has taken the featured assessment.
 */
export async function hasGuestTakenFeatured(guestId, quizId) {
  const { data, error } = await supabase
    .from('guest_attempts')
    .select('id')
    .eq('guest_id', guestId)
    .eq('quiz_id', quizId)
    .limit(1);

  if (error) return false;
  return data && data.length > 0;
}

/**
 * Get all guest attempts for a guest ID.
 */
export async function getAllGuestAttempts(guestId) {
  const { data, error } = await supabase
    .from('guest_attempts')
    .select('*')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });

  if (error || !data) return {};
  const map = {};
  data.forEach((row) => {
    const attempt = mapGuestAttemptFromDb(row);
    map[attempt.attemptId] = attempt;
  });
  return map;
}

// ═════════════════════════════════════════════════════════════════════════════
// PERSISTENT: Certificates (Supabase)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Save a certificate for a logged-in user.
 */
export async function saveCertificate(cert) {
  const { error } = await supabase.from('certificates').upsert({
    certificate_id: cert.certificateId,
    user_id: cert.userId,
    user_name: cert.userName,
    video_title: cert.videoTitle,
    video_url: cert.videoUrl,
    score: cert.score,
    quiz_id: cert.quizId,
    status: cert.status || 'verified',
  });
  if (error) console.error('saveCertificate error:', error.message);
}

/**
 * Fetch a certificate by ID — checks BOTH user and guest tables for verification.
 */
export async function getCertificate(certificateId) {
  // Try user certificates first
  const { data: userCert } = await supabase
    .from('certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .single();

  if (userCert) return mapCertFromDb(userCert);

  // Try guest certificates
  const { data: guestCert } = await supabase
    .from('guest_certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .single();

  if (guestCert) return mapCertFromDb(guestCert);

  return null;
}

/**
 * Save a guest certificate.
 */
export async function saveGuestCertificate(cert) {
  const { error } = await supabase.from('guest_certificates').upsert({
    certificate_id: cert.certificateId,
    guest_id: cert.guestId,
    user_name: cert.userName,
    video_title: cert.videoTitle,
    video_url: cert.videoUrl,
    score: cert.score,
    quiz_id: cert.quizId,
    status: cert.status || 'verified',
  });
  if (error) console.error('saveGuestCertificate error:', error.message);
}

// ═════════════════════════════════════════════════════════════════════════════
// CLEAR TRANSIENT DATA
// ═════════════════════════════════════════════════════════════════════════════

export function clearQuizData() {
  localStorage.removeItem(KEYS.QUIZ);
  localStorage.removeItem(KEYS.QUIZ_STATE);
  localStorage.removeItem(KEYS.USER_NAME);
}

// ═════════════════════════════════════════════════════════════════════════════
// INTERNAL: DB → App Object Mappers
// ═════════════════════════════════════════════════════════════════════════════

function mapAttemptFromDb(row) {
  return {
    attemptId: row.id,
    userId: row.user_id,
    quizId: row.quiz_id,
    title: row.title,
    videoUrl: row.video_url,
    userName: row.user_name,
    date: row.created_at,
    score: row.score,
    passed: row.passed,
    total: row.total,
    correct: row.correct,
    wrong: row.wrong,
    skipped: row.skipped,
    answers: row.answers || {},
    questions: row.questions || [],
    certificateId: row.certificate_id,
    provider: row.provider,
    model: row.model,
  };
}

function mapGuestAttemptFromDb(row) {
  return {
    attemptId: row.id,
    guestId: row.guest_id,
    quizId: row.quiz_id,
    title: row.title,
    videoUrl: row.video_url,
    userName: row.user_name,
    date: row.created_at,
    score: row.score,
    passed: row.passed,
    total: row.total,
    correct: row.correct,
    wrong: row.wrong,
    skipped: row.skipped,
    answers: row.answers || {},
    questions: row.questions || [],
    certificateId: row.certificate_id,
    provider: row.provider,
    model: row.model,
  };
}

function mapCertFromDb(row) {
  return {
    certificateId: row.certificate_id,
    userId: row.user_id || null,
    guestId: row.guest_id || null,
    userName: row.user_name,
    videoTitle: row.video_title,
    videoUrl: row.video_url,
    score: row.score,
    quizId: row.quiz_id,
    status: row.status,
    completionDate: row.created_at,
  };
}
