// frontend/src/hooks/useInterviewBot.js
import { useState, useRef, useEffect, useCallback } from "react"
import { api } from "../services/api"

// ── Fallback questions used when no resume is uploaded ────────────────────────
const DEFAULT_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "What are your greatest strengths and how have they helped you succeed?",
  "Describe a challenging situation at work and how you resolved it.",
  "Where do you see yourself in 5 years professionally?",
  "Why are you interested in this position and our company?",
  "Tell me about a time you worked in a team under pressure.",
  "What is your biggest weakness and how are you working on it?",
]

export const EMOTION_COLORS = {
  Happy:      "#22c55e",
  Neutral:    "#06b6d4",
  Angry:      "#ef4444",
  Sad:        "#3b82f6",
  Fear:       "#f59e0b",
  Discomfort: "#a855f7",
}

const FILLER_WORDS = [
  "um","uh","like","you know","sort of","kind of",
  "i guess","basically","literally","actually",
]

export default function useInterviewBot() {
  // ── Session ───────────────────────────────────────────────────────────────
  const [sessionState,    setSessionState]    = useState("idle") // idle | starting | active | ended
  const [currentQIdx,     setCurrentQIdx]     = useState(0)
  const [timeElapsed,     setTimeElapsed]     = useState(0)
  const [questionTime,    setQuestionTime]    = useState(0)

  // ── Questions ─────────────────────────────────────────────────────────────
  const [questions,       setQuestions]       = useState(DEFAULT_QUESTIONS)
  const [resumeFile,      setResumeFile]      = useState(null)   // File object from <input>
  const [loadingQuestions,setLoadingQuestions]= useState(false)
  const [questionsSource, setQuestionsSource] = useState("default") // "default" | "ai"

  // ── Camera & face ─────────────────────────────────────────────────────────
  const [faceDetected,    setFaceDetected]    = useState(false)

  // ── Emotion ───────────────────────────────────────────────────────────────
  const [emotion,         setEmotion]         = useState("Neutral")
  const [emotionConf,     setEmotionConf]     = useState(0)
  const [emotionHistory,  setEmotionHistory]  = useState([])

  // ── Speech ────────────────────────────────────────────────────────────────
  const [isListening,     setIsListening]     = useState(false)
  const [transcript,      setTranscript]      = useState("")
  const [allTranscripts,  setAllTranscripts]  = useState([])
  const [fillerCount,     setFillerCount]     = useState(0)
  const [wordCount,       setWordCount]       = useState(0)
  const [botSpeaking,     setBotSpeaking]     = useState(false)

  // ── Live scores ───────────────────────────────────────────────────────────
  const [scores, setScores] = useState({
    emotion:       0,
    communication: 0,
    confidence:    0,
    overall:       0,
  })

  // ── Final report ──────────────────────────────────────────────────────────
  const [report, setReport] = useState(null)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef         = useRef(null)
  const canvasRef        = useRef(null)
  const streamRef        = useRef(null)
  const timerRef         = useRef(null)
  const emotionTimerRef  = useRef(null)
  const recognitionRef   = useRef(null)
  const synthRef         = useRef(window.speechSynthesis)
  const emotionLogRef    = useRef({})

  // Keep latest transcript/wordCount/fillerCount/questionTime in refs
  // so async callbacks always read the latest value
  const transcriptRef    = useRef("")
  const wordCountRef     = useRef(0)
  const fillerCountRef   = useRef(0)
  const questionTimeRef  = useRef(0)
  const emotionRef       = useRef("Neutral")
  const emotionConfRef   = useRef(0)
  const currentQIdxRef   = useRef(0)
  const questionsRef     = useRef(DEFAULT_QUESTIONS)

  // Keep refs in sync with state
  useEffect(() => { transcriptRef.current   = transcript   }, [transcript])
  useEffect(() => { wordCountRef.current     = wordCount     }, [wordCount])
  useEffect(() => { fillerCountRef.current   = fillerCount   }, [fillerCount])
  useEffect(() => { questionTimeRef.current  = questionTime  }, [questionTime])
  useEffect(() => { emotionRef.current       = emotion       }, [emotion])
  useEffect(() => { emotionConfRef.current   = emotionConf   }, [emotionConf])
  useEffect(() => { currentQIdxRef.current   = currentQIdx   }, [currentQIdx])
  useEffect(() => { questionsRef.current     = questions     }, [questions])

  const currentQ = questions[currentQIdx]

  // ── Start webcam ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      return true
    } catch (err) {
      console.error("Camera error:", err)
      return false
    }
  }, [])

  // ── Stop webcam ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  // ── Capture frame → /predict ──────────────────────────────────────────────
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext("2d")
    canvas.width  = videoRef.current.videoWidth  || 640
    canvas.height = videoRef.current.videoHeight || 480
    ctx.drawImage(videoRef.current, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        const data = await api.detectEmotion(blob)

        if (data.detections?.length > 0) {
          const top = data.detections[0]
          setEmotion(top.emotion)
          setEmotionConf(top.confidence)
          setFaceDetected(true)

          emotionLogRef.current[top.emotion] =
            (emotionLogRef.current[top.emotion] || 0) + 1

          setEmotionHistory(prev => [
            ...prev.slice(-29),
            { emotion: top.emotion, conf: top.confidence, time: Date.now() },
          ])

          updateLiveScores(top.emotion)
        } else {
          setFaceDetected(false)
        }
      } catch {
        // Backend not reachable — simulate so UI still works
        const fallback = ["Happy","Neutral","Neutral","Happy","Neutral"]
        const sim = fallback[Math.floor(Math.random() * fallback.length)]
        setEmotion(sim)
        setFaceDetected(true)
      }
    }, "image/jpeg", 0.8)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live score calculation ────────────────────────────────────────────────
  const updateLiveScores = useCallback(() => {
    const log   = emotionLogRef.current
    const total = Object.values(log).reduce((a, b) => a + b, 0) || 1
    const pos   = ((log["Happy"] || 0) + (log["Neutral"] || 0)) / total * 100
    const neg   = (
      (log["Angry"]  || 0) +
      (log["Fear"]   || 0) +
      (log["Sad"]    || 0) +
      (log["Discomfort"] || 0)
    ) / total * 100
    const emoScore = Math.round(Math.min(100, Math.max(0, 50 + pos * 0.5 - neg * 0.3)))

    const qTime    = questionTimeRef.current
    const wc       = wordCountRef.current
    const fc       = fillerCountRef.current
    const wpm      = wc > 0 ? Math.min(100, wc / Math.max(qTime / 60, 0.1) / 2) : 50
    const fillerPen = Math.max(0, 100 - fc * 8)
    const commScore = Math.round(wpm * 0.4 + fillerPen * 0.6)
    const confScore = Math.round(emoScore * 0.6 + commScore * 0.4)
    const overall   = Math.round(emoScore * 0.35 + commScore * 0.35 + confScore * 0.30)

    setScores({ emotion: emoScore, communication: commScore, confidence: confScore, overall })
  }, [])

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const botSpeak = useCallback((text, onEnd) => {
    setBotSpeaking(true)
    synthRef.current.cancel()
    const utt    = new SpeechSynthesisUtterance(text)
    utt.rate     = 0.9
    utt.pitch    = 1.0
    utt.volume   = 1.0
    const voices = synthRef.current.getVoices()
    const prefer = voices.find(v => v.name.includes("Google") && v.lang === "en-US")
    if (prefer) utt.voice = prefer
    utt.onend = () => {
      setBotSpeaking(false)
      onEnd?.()
    }
    synthRef.current.speak(utt)
  }, [])

  // ── Start speech recognition ──────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { console.warn("Speech Recognition not supported"); return }
    const rec          = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = "en-US"

    rec.onresult = (e) => {
      let final = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
      }
      if (final) {
        setTranscript(prev => prev + " " + final)
        const words = final.trim().split(/\s+/)
        setWordCount(prev => prev + words.length)
        const fc = words.filter(w =>
          FILLER_WORDS.includes(w.toLowerCase().replace(/[^a-z]/g, ""))
        ).length
        setFillerCount(prev => prev + fc)
      }
    }
    rec.onerror = (e) => console.warn("Speech error:", e.error)
    rec.start()
    recognitionRef.current = rec
    setIsListening(true)
  }, [])

  // ── Stop speech recognition ───────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  // ── Next question (or end session) ────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    const idx     = currentQIdxRef.current
    const qs      = questionsRef.current
    const answer  = transcriptRef.current.trim()
    const wc      = wordCountRef.current
    const fc      = fillerCountRef.current
    const emo     = emotionRef.current
    const eConf   = emotionConfRef.current

    // Save this answer
    if (answer) {
      setAllTranscripts(prev => [...prev, {
        question:    qs[idx],
        answer,
        emotion:     emo,
        confidence:  eConf,
        wordCount:   wc,
        fillerCount: fc,
      }])

      // Fire-and-forget: score the answer in background (updates nothing critical)
      api.scoreAnswer({
        question:    qs[idx],
        answer,
        emotion:     emo,
        confidence:  eConf,
        word_count:  wc,
        filler_count: fc,
      }).catch(err => console.warn("Score answer failed:", err))
    }

    // Reset per-question state
    setTranscript("")
    setWordCount(0)
    setFillerCount(0)
    setQuestionTime(0)
    stopListening()

    // End or advance
    if (idx >= qs.length - 1) {
      endSession()
      return
    }

    const next = idx + 1
    setCurrentQIdx(next)

    setTimeout(() => {
      botSpeak(qs[next], () => startListening())
    }, 600)
  }, [botSpeak, startListening, stopListening]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = useCallback(async (uploadedResume = null) => {
    setSessionState("starting")
    emotionLogRef.current = {}

    // Fetch AI questions if resume provided
    if (uploadedResume) {
      setLoadingQuestions(true)
      try {
        const result = await api.startInterview(uploadedResume)
        if (result.questions?.length) {
          setQuestions(result.questions)
          questionsRef.current = result.questions
          setQuestionsSource(result.source || "ai")
        }
      } catch (err) {
        console.warn("Could not fetch AI questions, using defaults:", err)
        setQuestions(DEFAULT_QUESTIONS)
        questionsRef.current = DEFAULT_QUESTIONS
      } finally {
        setLoadingQuestions(false)
      }
    } else {
      setQuestions(DEFAULT_QUESTIONS)
      questionsRef.current = DEFAULT_QUESTIONS
      setQuestionsSource("default")
    }

    const camOk = await startCamera()
    if (!camOk) {
      alert("Camera access is required for the interview session.")
      setSessionState("idle")
      return
    }

    // Reset all state
    setSessionState("active")
    setCurrentQIdx(0)
    currentQIdxRef.current = 0
    setTimeElapsed(0)
    setQuestionTime(0)
    setEmotionHistory([])
    setAllTranscripts([])
    setTranscript("")
    setWordCount(0)
    setFillerCount(0)
    setReport(null)
    setScores({ emotion: 0, communication: 0, confidence: 0, overall: 0 })

    // Timers
    timerRef.current = setInterval(() => {
      setTimeElapsed(p => p + 1)
      setQuestionTime(p => {
        questionTimeRef.current = p + 1
        return p + 1
      })
      updateLiveScores()
    }, 1000)

    // Emotion capture every 2 seconds
    emotionTimerRef.current = setInterval(captureAndAnalyze, 2000)

    // Bot greets and asks first question
    const firstQ = questionsRef.current[0]
    setTimeout(() => {
      botSpeak(
        `Welcome to your AI interview session. I will ask you ` +
        `${questionsRef.current.length} questions. Please answer clearly. ` +
        `Let us begin. ${firstQ}`,
        () => startListening()
      )
    }, 1000)
  }, [startCamera, captureAndAnalyze, botSpeak, startListening, updateLiveScores])

  // ── End session ───────────────────────────────────────────────────────────
  const endSession = useCallback(() => {
    clearInterval(timerRef.current)
    clearInterval(emotionTimerRef.current)
    stopListening()
    stopCamera()
    synthRef.current.cancel()
    setBotSpeaking(false)

    // Build report from refs so we always have the latest values
    const log   = emotionLogRef.current
    const total = Object.values(log).reduce((a, b) => a + b, 0) || 1
    const emotionBreakdown = Object.entries(log)
      .map(([k, v]) => ({ emotion: k, count: v, pct: Math.round(v / total * 100) }))
      .sort((a, b) => b.count - a.count)

    setScores(latest => {
      const rec =
        latest.overall >= 80 ? "Highly Recommended" :
        latest.overall >= 65 ? "Recommended"        :
        latest.overall >= 50 ? "Neutral"            : "Needs Improvement"

      setReport({
        emotionBreakdown,
        scores: latest,
        recommendation: rec,
        transcripts: [],  // will be filled by setAllTranscripts flush below
      })
      return latest
    })

    // Flush transcripts into report after state settles
    setAllTranscripts(ts => {
      setReport(r => r ? { ...r, transcripts: ts } : r)
      return ts
    })

    setSessionState("ended")
  }, [stopListening, stopCamera])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(emotionTimerRef.current)
      stopCamera()
      synthRef.current?.cancel()
    }
  }, [stopCamera])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return {
    // Session
    sessionState,
    currentQIdx,
    currentQ,
    timeElapsed:  fmt(timeElapsed),
    questionTime: fmt(questionTime),
    totalQuestions: questions.length,

    // Resume / questions
    resumeFile,
    setResumeFile,
    loadingQuestions,
    questionsSource,

    // Camera
    videoRef,
    canvasRef,
    faceDetected,

    // Emotion
    emotion,
    emotionConf,
    emotionHistory,
    EMOTION_COLORS,

    // Speech
    isListening,
    transcript,
    botSpeaking,
    fillerCount,
    wordCount,

    // Scores & report
    scores,
    report,

    // Actions
    startSession,
    endSession,
    nextQuestion,
  }
}