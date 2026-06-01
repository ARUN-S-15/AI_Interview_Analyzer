// frontend/src/services/api.js
// Central API service — all backend calls go through here

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

// ── Helper: throw readable errors ────────────────────────────────────────────
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || "Request failed")
  }
  return res.json()
}

// ── API methods ───────────────────────────────────────────────────────────────
export const api = {

  // Check backend is alive
  health: () =>
    fetch(`${BASE_URL}/health`).then(handleResponse),

  // Detect emotion from a single webcam frame (blob)
  detectEmotion: (imageBlob) => {
    const form = new FormData()
    form.append("image", imageBlob, "frame.jpg")
    return fetch(`${BASE_URL}/predict`, { method: "POST", body: form })
      .then(handleResponse)
  },

  // Analyze uploaded video + optional resume — returns full scores
  analyzeVideo: (videoFile, resumeFile = null) => {
    const form = new FormData()
    form.append("video", videoFile)
    if (resumeFile) form.append("resume", resumeFile)
    return fetch(`${BASE_URL}/analyze`, { method: "POST", body: form })
      .then(handleResponse)
  },

  // Upload resume → get AI-generated interview questions
  startInterview: (resumeFile = null) => {
    const form = new FormData()
    if (resumeFile) form.append("resume", resumeFile)
    return fetch(`${BASE_URL}/interview/start`, { method: "POST", body: form })
      .then(handleResponse)
  },

  // Score a single interview answer with Claude AI
  scoreAnswer: ({ question, answer, emotion, confidence, word_count, filler_count }) =>
    fetch(`${BASE_URL}/interview/score-answer`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ question, answer, emotion, confidence, word_count, filler_count }),
    }).then(handleResponse),
}