import { useEffect, useState } from "react"
import useAnalyzer from "./hooks/useAnalyzer"
import Header         from "./components/Header"
import ScoreCard      from "./components/ScoreCard"
import EmotionList    from "./components/EmotionList"
import BackendResults from "./components/BackendResults"
import InterviewBot   from "./interviewbot"

export default function App() {
  const [page, setPage] = useState("home") // "home" | "interview"

  const {
    setVideo, setResume,
    loading, result, error,
    checkHealth, handleAnalyze,
  } = useAnalyzer()

  const [videoName,  setVideoName]  = useState("")
  const [resumeName, setResumeName] = useState("")

  useEffect(() => {
    checkHealth().then(data => {
      if (data) console.log("Backend connected:", data.status)
      else       console.warn("Backend not reachable — is Docker running?")
    })
  }, [])

  const scores = result ? [
    { label: "Emotion Score",       value: result.emotion_score,       color: "text-cyan-400",   barColor: "bg-cyan-400"   },
    { label: "Communication Score", value: result.communication_score, color: "text-green-400",  barColor: "bg-green-400"  },
    { label: "Resume Match",        value: result.resume_score,        color: "text-yellow-400", barColor: "bg-yellow-400" },
    { label: "Final AI Score",      value: result.final_score,         color: "text-pink-400",   barColor: "bg-pink-400"   },
  ] : [
    { label: "Emotion Score",       value: 0, color: "text-cyan-400",   barColor: "bg-cyan-400"   },
    { label: "Communication Score", value: 0, color: "text-green-400",  barColor: "bg-green-400"  },
    { label: "Resume Match",        value: 0, color: "text-yellow-400", barColor: "bg-yellow-400" },
    { label: "Final AI Score",      value: 0, color: "text-pink-400",   barColor: "bg-pink-400"   },
  ]

  // ── Interview Bot page ──────────────────────────────────────────────────────
  if (page === "interview") {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900
                       border border-zinc-700 hover:border-cyan-500 text-sm
                       text-gray-300 hover:text-white transition-all"
          >
            ← Back to Analyzer
          </button>
        </div>
        <InterviewBot />
      </div>
    )
  }

  // ── Main home page ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">

        <Header />

        {error && (
          <div className="mb-6 bg-red-900 border border-red-500 rounded-2xl p-4 text-red-200">
            ⚠ {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Video Upload */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800
                          hover:border-cyan-800 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Interview Video</h2>
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8
                            text-center hover:border-cyan-400 transition-all">
              <input type="file" id="videoUpload" className="hidden" accept="video/*"
                onChange={e => { const f = e.target.files[0]; setVideo(f); setVideoName(f?.name || "") }}
              />
              <label htmlFor="videoUpload" className="cursor-pointer block">
                <div className="text-5xl mb-3">🎥</div>
                {videoName ? (
                  <>
                    <p className="text-sm font-semibold text-cyan-400 truncate">{videoName}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to upload video</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800
                          hover:border-purple-800 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Resume (PDF)</h2>
            <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8
                            text-center hover:border-purple-400 transition-all">
              <input type="file" id="resumeUpload" className="hidden" accept=".pdf"
                onChange={e => { const f = e.target.files[0]; setResume(f); setResumeName(f?.name || "") }}
              />
              <label htmlFor="resumeUpload" className="cursor-pointer block">
                <div className="text-5xl mb-3">📄</div>
                {resumeName ? (
                  <>
                    <p className="text-sm font-semibold text-purple-400 truncate">{resumeName}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Click to upload resume</p>
                    <p className="text-xs text-gray-500 mt-1">PDF only</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Live Interview Bot card */}
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800
                          hover:border-green-700 transition-all duration-300 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Live Interview Bot</h2>

            <div className="flex-1 border-2 border-dashed border-zinc-700 rounded-2xl p-6
                            flex flex-col justify-center gap-4">
              {[
                { icon: "🤖", label: "AI interviewer",    sub: "Asks tailored questions" },
                { icon: "🎥", label: "Emotion tracking",  sub: "Live webcam analysis"    },
                { icon: "🎤", label: "Speech-to-text",    sub: "Captures your answers"   },
                { icon: "📊", label: "Real-time scoring", sub: "Instant feedback"        },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{f.label}</p>
                    <p className="text-xs text-gray-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPage("interview")}
              className="w-full mt-5 py-3 rounded-2xl bg-green-600 hover:bg-green-500
                         transition-all text-sm font-bold shadow-lg shadow-green-900/40
                         flex items-center justify-center gap-2"
            >
              🚀 Start Live Interview
            </button>
          </div>

        </div>

        {/* Main analyze button */}
        <div className="text-center mb-10">
          <button onClick={handleAnalyze} disabled={loading}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500
                       text-xl font-bold hover:opacity-90 transition-all disabled:opacity-50
                       shadow-lg shadow-cyan-900/30">
            {loading ? "Analyzing… please wait" : "Start Full AI Analysis"}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Upload a video (required) and resume (optional) then click analyze
          </p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {scores.map(s => <ScoreCard key={s.label} {...s} />)}
        </div>

        {/* Emotions + recommendation */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <EmotionList emotions={
              Object.entries(result.emotions || {}).map(([label, value]) => ({
                label: `${
                  label === "Happy"      ? "😊" :
                  label === "Neutral"    ? "😐" :
                  label === "Angry"      ? "😡" :
                  label === "Sad"        ? "😢" :
                  label === "Fear"       ? "😟" :
                  label === "Discomfort" ? "😣" : "😶"
                } ${label}`,
                value,
                color:
                  label === "Happy"   ? "text-green-400"  :
                  label === "Neutral" ? "text-cyan-400"   :
                  label === "Angry"   ? "text-red-400"    :
                  label === "Sad"     ? "text-blue-400"   :
                  label === "Fear"    ? "text-yellow-400" : "text-orange-400",
              }))
            }/>

            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">AI Recommendation</h2>
              <div className="bg-zinc-800 rounded-2xl p-5 text-gray-300 leading-7">
                {result.recommendation}
              </div>
              {result.matched_skills?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Matched Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_skills.map(sk => (
                      <span key={sk} className="px-3 py-1 bg-zinc-700 rounded-full text-xs text-cyan-300">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <BackendResults result={result} />

      </div>
    </div>
  )
}