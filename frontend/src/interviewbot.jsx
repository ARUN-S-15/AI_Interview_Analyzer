import { useRef, useEffect } from "react"
import useInterviewBot from "./hooks/useInterviewBot"

// ── Animated waveform for bot speaking ───────────────────────────────────────
function BotWaveform({ active }) {
  return (
    <div style={{ display:"flex", gap:3, alignItems:"center", height:24 }}>
      {[...Array(7)].map((_,i) => (
        <div key={i} style={{
          width:  3,
          borderRadius: 2,
          background: active ? "#06b6d4" : "#2a2a3a",
          height: active ? `${8 + Math.sin(i*0.9)*10}px` : "4px",
          animation: active ? `wave 0.8s ease-in-out ${i*0.1}s infinite alternate` : "none",
          transition: "height 0.3s, background 0.3s",
        }}/>
      ))}
      <style>{`@keyframes wave { from{height:4px} to{height:22px} }`}</style>
    </div>
  )
}

// ── Emotion badge ─────────────────────────────────────────────────────────────
function EmotionBadge({ emotion, conf, colors }) {
  const color = colors[emotion] || "#6b7280"
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:8,
      background: color+"18", border:`1px solid ${color}44`,
      borderRadius:20, padding:"6px 14px",
    }}>
      <div style={{
        width:8, height:8, borderRadius:"50%", background:color,
        boxShadow:`0 0 8px ${color}`,
        animation:"pulse 1.5s ease-in-out infinite",
      }}/>
      <span style={{ fontSize:13, fontWeight:600, color, fontFamily:"DM Mono, monospace" }}>
        {emotion}
      </span>
      <span style={{ fontSize:11, color: color+"99", fontFamily:"DM Mono, monospace" }}>
        {conf.toFixed(0)}%
      </span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ label, value, color, size=80 }) {
  const r  = (size/2) - 8
  const c  = 2 * Math.PI * r
  const pct = (value/100) * c
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2a" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${pct} ${c}`}
          strokeLinecap="round"
          style={{ transition:"stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div style={{ textAlign:"center", marginTop:-size*0.7, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:size*0.22, fontWeight:700, color, fontFamily:"DM Mono, monospace" }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize:11, color:"#6b7280", textAlign:"center", maxWidth:70 }}>{label}</div>
    </div>
  )
}

// ── Emotion timeline mini chart ───────────────────────────────────────────────
function EmotionTimeline({ history, colors }) {
  if (!history.length) return (
    <div style={{ height:40, display:"flex", alignItems:"center",
      color:"#3a3a4a", fontSize:12, fontFamily:"DM Mono, monospace" }}>
      — waiting for data —
    </div>
  )
  return (
    <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:40, overflowX:"auto" }}>
      {history.map((h,i) => {
        const col = colors[h.emotion] || "#6b7280"
        const ht  = Math.max(8, h.conf*0.4)
        return (
          <div key={i} title={`${h.emotion} ${h.conf.toFixed(0)}%`}
            style={{
              width:6, minWidth:6, height:ht, borderRadius:2,
              background:col, opacity:0.7+i/history.length*0.3,
              transition:"height 0.3s",
            }}
          />
        )
      })}
    </div>
  )
}

// ── Session report ────────────────────────────────────────────────────────────
function SessionReport({ report, onRestart, EMOTION_COLORS }) {
  if (!report) return null
  const rec = report.recommendation
  const recColor =
    rec === "Highly Recommended" ? "#22c55e" :
    rec === "Recommended"        ? "#06b6d4" :
    rec === "Neutral"            ? "#f59e0b" : "#ef4444"

  return (
    <div style={{
      background:"#0c0c14", border:"1px solid #1e1e2e",
      borderRadius:20, padding:32, maxWidth:800, margin:"0 auto",
    }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:13, color:"#4a4a6a", fontFamily:"DM Mono, monospace",
          letterSpacing:3, marginBottom:8 }}>SESSION COMPLETE</div>
        <h2 style={{ fontSize:32, fontWeight:800, background:"linear-gradient(135deg,#06b6d4,#a855f7)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Interview Report
        </h2>
        <div style={{ marginTop:12, display:"inline-block", background:recColor+"18",
          border:`1px solid ${recColor}44`, borderRadius:20, padding:"6px 20px",
          color:recColor, fontWeight:700, fontSize:14 }}>
          {rec}
        </div>
      </div>

      {/* Score grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
        {[
          { label:"Emotion",      value:report.scores.emotion,       color:"#06b6d4" },
          { label:"Communication",value:report.scores.communication, color:"#22c55e" },
          { label:"Confidence",   value:report.scores.confidence,    color:"#f59e0b" },
          { label:"Overall",      value:report.scores.overall,       color:"#a855f7" },
        ].map(s => (
          <div key={s.label} style={{ background:"#111120", borderRadius:16,
            padding:"20px 12px", textAlign:"center", border:"1px solid #1e1e2e" }}>
            <div style={{ fontSize:36, fontWeight:800, color:s.color,
              fontFamily:"DM Mono, monospace" }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#4a4a6a", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Emotion breakdown */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:12, color:"#4a4a6a", letterSpacing:2,
          fontFamily:"DM Mono, monospace", marginBottom:12 }}>EMOTION BREAKDOWN</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {report.emotionBreakdown.map(e => (
            <div key={e.emotion} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:90, fontSize:12, color:"#8888aa",
                fontFamily:"DM Mono, monospace" }}>{e.emotion}</div>
              <div style={{ flex:1, height:8, background:"#1a1a2a", borderRadius:4, overflow:"hidden" }}>
                <div style={{
                  width:`${e.pct}%`, height:"100%",
                  background: EMOTION_COLORS[e.emotion] || "#6b7280",
                  borderRadius:4, transition:"width 1s ease",
                }}/>
              </div>
              <div style={{ width:36, fontSize:12, color:"#6b7280",
                fontFamily:"DM Mono, monospace", textAlign:"right" }}>{e.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transcripts */}
      {report.transcripts.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, color:"#4a4a6a", letterSpacing:2,
            fontFamily:"DM Mono, monospace", marginBottom:12 }}>ANSWERS RECORDED</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {report.transcripts.slice(0,3).map((t,i) => (
              <div key={i} style={{ background:"#111120", border:"1px solid #1e1e2e",
                borderRadius:12, padding:16 }}>
                <div style={{ fontSize:12, color:"#06b6d4", marginBottom:6,
                  fontFamily:"DM Mono, monospace" }}>Q{i+1}: {t.question.substring(0,60)}...</div>
                <div style={{ fontSize:13, color:"#c0c0d8", lineHeight:1.6 }}>
                  {t.answer.substring(0,200)}{t.answer.length>200?"...":""}
                </div>
                <div style={{ marginTop:8, display:"flex", gap:12 }}>
                  <span style={{ fontSize:11, color:"#4a4a6a",
                    fontFamily:"DM Mono, monospace" }}>{t.wordCount} words</span>
                  <span style={{ fontSize:11, color:"#4a4a6a",
                    fontFamily:"DM Mono, monospace" }}>{t.fillerCount} fillers</span>
                  <span style={{ fontSize:11, color: (EMOTION_COLORS[t.emotion]||"#6b7280")+"cc",
                    fontFamily:"DM Mono, monospace" }}>{t.emotion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign:"center" }}>
        <button onClick={onRestart}
          style={{
            padding:"14px 40px", borderRadius:12, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,#06b6d4,#a855f7)",
            color:"#fff", fontWeight:700, fontSize:15, fontFamily:"Syne, sans-serif",
          }}>
          Start New Session
        </button>
      </div>
    </div>
  )
}

// ── Main InterviewBot page ────────────────────────────────────────────────────
export default function InterviewBot() {
  const {
    sessionState, currentQIdx, currentQ,
    timeElapsed, questionTime,
    videoRef, canvasRef, faceDetected,
    emotion, emotionConf, emotionHistory, EMOTION_COLORS,
    isListening, transcript, botSpeaking, fillerCount, wordCount,
    scores, report,
    startSession, endSession, nextQuestion,
    totalQuestions,
  } = useInterviewBot()

  // ── IDLE screen ───────────────────────────────────────────────────────────
  if (sessionState === "idle" || sessionState === "starting") {
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:"radial-gradient(ellipse at 30% 20%, #0d1a2a 0%, #060608 60%)",
        padding:32,
      }}>
        {/* Grid lines background */}
        <div style={{
          position:"fixed", inset:0, pointerEvents:"none",
          backgroundImage:"linear-gradient(#0e1420 1px,transparent 1px),linear-gradient(90deg,#0e1420 1px,transparent 1px)",
          backgroundSize:"40px 40px", opacity:0.6,
        }}/>

        <div style={{ position:"relative", textAlign:"center", maxWidth:560 }}>
          <div style={{
            width:80, height:80, borderRadius:"50%", margin:"0 auto 24px",
            background:"linear-gradient(135deg,#06b6d4,#a855f7)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, boxShadow:"0 0 40px #06b6d444",
          }}>🤖</div>

          <h1 style={{
            fontSize:42, fontWeight:800,
            background:"linear-gradient(135deg,#e8e8f0 30%,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            lineHeight:1.1, marginBottom:16,
          }}>
            AI Interview<br/>Session
          </h1>
          <p style={{ color:"#5a5a7a", fontSize:15, lineHeight:1.7, marginBottom:40 }}>
            A one-on-one interview with your AI coach. Answer {totalQuestions} questions
            while the system tracks your emotions, speech fluency, and communication
            skills in real time.
          </p>

          {/* Feature pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:40 }}>
            {["🎥 Webcam emotion tracking","🎤 Live speech analysis","📊 Real-time scoring","📋 Full report"].map(f => (
              <div key={f} style={{
                background:"#0e0e1a", border:"1px solid #1e1e2e",
                borderRadius:20, padding:"6px 14px", fontSize:13, color:"#8888aa",
              }}>{f}</div>
            ))}
          </div>

          {/* Requirements note */}
          <div style={{
            background:"#0c1018", border:"1px solid #1a2030",
            borderRadius:12, padding:"14px 20px", marginBottom:36,
            fontSize:13, color:"#5a6a7a", lineHeight:1.6, textAlign:"left",
          }}>
            <span style={{ color:"#f59e0b" }}>⚠</span> Allow camera and microphone access when prompted.
            Speak clearly and face the camera. Ensure you are in a well-lit environment.
          </div>

          <button
            onClick={startSession}
            disabled={sessionState === "starting"}
            style={{
              padding:"16px 56px", borderRadius:14, border:"none",
              cursor: sessionState==="starting" ? "not-allowed" : "pointer",
              background: sessionState==="starting"
                ? "linear-gradient(135deg,#1a2a3a,#2a1a3a)"
                : "linear-gradient(135deg,#06b6d4,#a855f7)",
              color:"#fff", fontWeight:700, fontSize:18,
              fontFamily:"Syne, sans-serif",
              boxShadow: sessionState==="starting" ? "none" : "0 0 30px #06b6d444",
              transition:"all 0.3s",
            }}>
            {sessionState === "starting" ? "Starting..." : "Begin Interview"}
          </button>
        </div>
      </div>
    )
  }

  // ── REPORT screen ─────────────────────────────────────────────────────────
  if (sessionState === "ended") {
    return (
      <div style={{
        minHeight:"100vh", padding:"40px 24px",
        background:"radial-gradient(ellipse at 70% 80%,#0d0a1a 0%,#060608 60%)",
      }}>
        <SessionReport
          report={report}
          EMOTION_COLORS={EMOTION_COLORS}
          onRestart={() => window.location.reload()}
        />
      </div>
    )
  }

  // ── ACTIVE session ────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight:"100vh",
      background:"#060608",
      display:"grid",
      gridTemplateColumns:"1fr 340px",
      gridTemplateRows:"56px 1fr",
      gap:0,
    }}>
      <canvas ref={canvasRef} style={{ display:"none" }}/>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        gridColumn:"1/-1",
        background:"#08080f",
        borderBottom:"1px solid #12121e",
        display:"flex", alignItems:"center",
        padding:"0 24px", gap:24,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:8, height:8, borderRadius:"50%",
            background:"#22c55e", boxShadow:"0 0 8px #22c55e",
            animation:"pulse 1.5s infinite",
          }}/>
          <span style={{ fontSize:12, color:"#22c55e",
            fontFamily:"DM Mono, monospace", letterSpacing:1 }}>LIVE</span>
        </div>
        <div style={{ fontSize:13, color:"#4a4a6a",
          fontFamily:"DM Mono, monospace" }}>
          Q {currentQIdx+1}/{totalQuestions}
        </div>
        <div style={{ fontSize:13, color:"#4a4a6a",
          fontFamily:"DM Mono, monospace" }}>
          {timeElapsed}
        </div>
        <div style={{ flex:1 }}/>
        <EmotionBadge emotion={emotion} conf={emotionConf} colors={EMOTION_COLORS}/>
        <button onClick={endSession}
          style={{
            padding:"6px 18px", borderRadius:8, border:"1px solid #2a1a1a",
            background:"#1a0808", color:"#ef4444", cursor:"pointer",
            fontSize:13, fontFamily:"Syne, sans-serif", fontWeight:600,
          }}>
          End Session
        </button>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20, overflowY:"auto" }}>

        {/* Bot + question */}
        <div style={{
          background:"#0a0a12", border:"1px solid #141422",
          borderRadius:20, padding:28,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <div style={{
              width:44, height:44, borderRadius:12,
              background:"linear-gradient(135deg,#0e2030,#1a0e30)",
              border:"1px solid #1e2e40",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, flexShrink:0,
            }}>🤖</div>
            <div>
              <div style={{ fontSize:11, color:"#4a4a6a",
                fontFamily:"DM Mono, monospace", letterSpacing:2 }}>AI INTERVIEWER</div>
              <BotWaveform active={botSpeaking}/>
            </div>
            <div style={{ marginLeft:"auto", fontSize:11,
              color:"#2a2a3a", fontFamily:"DM Mono, monospace" }}>
              {questionTime}
            </div>
          </div>

          <div style={{
            fontSize:20, fontWeight:600, color:"#d0d0e8",
            lineHeight:1.5, letterSpacing:"-0.01em",
          }}>
            {currentQ}
          </div>
        </div>

        {/* Webcam feed */}
        <div style={{
          background:"#08080e", border:`1px solid ${faceDetected?"#06b6d444":"#141422"}`,
          borderRadius:20, overflow:"hidden", position:"relative",
          aspectRatio:"16/9", transition:"border-color 0.3s",
        }}>
          <video ref={videoRef} muted playsInline
            style={{ width:"100%", height:"100%", objectFit:"cover",
              transform:"scaleX(-1)" }}
          />
          {!faceDetected && (
            <div style={{
              position:"absolute", inset:0,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              background:"#08080ebb",
            }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
              <div style={{ fontSize:13, color:"#4a4a6a",
                fontFamily:"DM Mono, monospace" }}>Face not detected</div>
            </div>
          )}
          {/* Scan line */}
          {faceDetected && (
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:2,
              background:"linear-gradient(90deg,transparent,#06b6d4,transparent)",
              animation:"scan 3s linear infinite",
            }}/>
          )}
          <style>{`@keyframes scan{0%{top:0}100%{top:100%}}`}</style>
        </div>

        {/* Transcript */}
        <div style={{
          background:"#0a0a12", border:"1px solid #141422",
          borderRadius:16, padding:20,
        }}>
          <div style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#4a4a6a",
              fontFamily:"DM Mono, monospace", letterSpacing:2 }}>YOUR ANSWER</div>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{
                  width:6, height:6, borderRadius:"50%",
                  background: isListening ? "#22c55e" : "#2a2a3a",
                  boxShadow: isListening ? "0 0 6px #22c55e" : "none",
                  animation: isListening ? "pulse 1s infinite" : "none",
                }}/>
                <span style={{ fontSize:11, color: isListening?"#22c55e":"#3a3a5a",
                  fontFamily:"DM Mono, monospace" }}>
                  {isListening ? "Listening" : "Paused"}
                </span>
              </div>
              {wordCount > 0 && (
                <span style={{ fontSize:11, color:"#3a3a5a",
                  fontFamily:"DM Mono, monospace" }}>
                  {wordCount}w · {fillerCount} fillers
                </span>
              )}
            </div>
          </div>

          <div style={{
            minHeight:80, fontSize:14, color:"#a0a0c0",
            lineHeight:1.7, fontStyle: transcript ? "normal" : "italic",
          }}>
            {transcript || "Start speaking — your answer will appear here..."}
          </div>
        </div>

        {/* Next button */}
        <button onClick={nextQuestion}
          disabled={botSpeaking}
          style={{
            padding:"14px 32px", borderRadius:12, border:"none",
            cursor: botSpeaking ? "not-allowed" : "pointer",
            background: botSpeaking
              ? "linear-gradient(135deg,#1a1a2a,#1a1a2a)"
              : "linear-gradient(135deg,#06b6d4,#a855f7)",
            color: botSpeaking ? "#4a4a6a" : "#fff",
            fontWeight:700, fontSize:15, fontFamily:"Syne, sans-serif",
            transition:"all 0.3s",
          }}>
          {currentQIdx >= totalQuestions-1 ? "Finish Interview" : "Next Question →"}
        </button>
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────────────── */}
      <div style={{
        background:"#08080e", borderLeft:"1px solid #12121e",
        padding:20, display:"flex", flexDirection:"column", gap:20,
        overflowY:"auto",
      }}>
        {/* Live scores */}
        <div>
          <div style={{ fontSize:11, color:"#4a4a6a", letterSpacing:2,
            fontFamily:"DM Mono, monospace", marginBottom:16 }}>LIVE SCORES</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <ScoreRing label="Emotion"       value={scores.emotion}       color="#06b6d4"/>
            <ScoreRing label="Communication" value={scores.communication} color="#22c55e"/>
            <ScoreRing label="Confidence"    value={scores.confidence}    color="#f59e0b"/>
            <ScoreRing label="Overall"       value={scores.overall}       color="#a855f7"/>
          </div>
        </div>

        {/* Emotion timeline */}
        <div>
          <div style={{ fontSize:11, color:"#4a4a6a", letterSpacing:2,
            fontFamily:"DM Mono, monospace", marginBottom:10 }}>EMOTION TIMELINE</div>
          <EmotionTimeline history={emotionHistory} colors={EMOTION_COLORS}/>
        </div>

        {/* Emotion legend */}
        <div>
          <div style={{ fontSize:11, color:"#4a4a6a", letterSpacing:2,
            fontFamily:"DM Mono, monospace", marginBottom:10 }}>LEGEND</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {Object.entries(EMOTION_COLORS).map(([emo, col]) => (
              <div key={emo} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:10, height:10, borderRadius:2,
                  background:col, flexShrink:0,
                }}/>
                <span style={{ fontSize:12, color:"#6a6a8a",
                  fontFamily:"DM Mono, monospace" }}>{emo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ fontSize:11, color:"#4a4a6a", letterSpacing:2,
            fontFamily:"DM Mono, monospace", marginBottom:10 }}>PROGRESS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {Array.from({length:totalQuestions}, (_,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:6, height:6, borderRadius:"50%", flexShrink:0,
                  background:
                    i < currentQIdx  ? "#22c55e" :
                    i === currentQIdx ? "#06b6d4" : "#1e1e2e",
                  boxShadow: i===currentQIdx ? "0 0 6px #06b6d4" : "none",
                }}/>
                <span style={{
                  fontSize:11, lineHeight:1.3,
                  color: i===currentQIdx ? "#c0c0e0" : i<currentQIdx ? "#3a4a3a" : "#2a2a3a",
                  fontFamily:"DM Mono, monospace",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>Q{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}