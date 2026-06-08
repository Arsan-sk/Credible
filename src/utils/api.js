/**
 * API helper functions for communicating with the Express backend.
 */

const API_BASE = '';

/**
 * Fetch the current quiz from the backend.
 * Returns quiz data object or null if no quiz is available.
 */
export async function fetchQuiz() {
  try {
    const res = await fetch(`${API_BASE}/api/quiz`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.questions?.length > 0) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch the guest featured quiz from the backend.
 * Returns guest quiz data object or null if not available.
 */
export async function fetchGuestQuiz() {
  try {
    const res = await fetch(`${API_BASE}/api/guest-quiz`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.questions?.length > 0) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

