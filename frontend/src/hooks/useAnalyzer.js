import { useState } from "react"

// ── Change this if your backend runs on a different port ─────────────────────
const API_BASE = "http://localhost:5000"

export default function useAnalyzer() {
  const [video,    setVideo]    = useState(null)
  const [resume,   setResume]   = useState(null)
  const [image,    setImage]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [imgResult, setImgResult] = useState(null)
  const [error,    setError]    = useState(null)

  // ── Test backend connection ─────────────────────────────────────────────────
  const checkHealth = async () => {
    try {
      const res  = await fetch(`${API_BASE}/health`)
      const data = await res.json()
      console.log("Backend health:", data)
      return data
    } catch (err) {
      console.error("Backend not reachable:", err)
      return null
    }
  }

  // ── Full video + resume analysis ────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!video) {
      setError("Please upload a video file")
      return
    }

    const formData = new FormData()
    formData.append("video",  video)
    if (resume) formData.append("resume", resume)

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body:   formData,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Server error ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Analysis failed:", err)
      setError(err.message || "Backend connection failed. Is Docker running?")
    } finally {
      setLoading(false)
    }
  }

  // ── Single image emotion prediction ────────────────────────────────────────
  const handleImagePredict = async () => {
    if (!image) {
      setError("Please upload an image")
      return
    }

    const formData = new FormData()
    formData.append("image", image)

    try {
      setLoading(true)
      setError(null)
      setImgResult(null)

      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body:   formData,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Server error ${response.status}`)
      }

      const data = await response.json()
      setImgResult(data)
    } catch (err) {
      setError(err.message || "Prediction failed")
    } finally {
      setLoading(false)
    }
  }

  return {
    video,    setVideo,
    resume,   setResume,
    image,    setImage,
    loading,
    result,
    imgResult,
    error,
    checkHealth,
    handleAnalyze,
    handleImagePredict,
  }
}