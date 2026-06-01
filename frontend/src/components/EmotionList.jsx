const DEFAULT_EMOTIONS = [
  { label: "😊 Happy",   value: 35, color: "text-green-400"  },
  { label: "😐 Neutral", value: 40, color: "text-cyan-400"   },
  { label: "😟 Fear",    value: 10, color: "text-yellow-400" },
  { label: "😡 Angry",   value: 5,  color: "text-red-400"    },
  { label: "😢 Sad",     value: 10, color: "text-blue-400"   },
]

export default function EmotionList({ emotions = DEFAULT_EMOTIONS }) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">
        Detected Emotions
      </h2>

      <div className="space-y-4">
        {emotions.map((emo) => (
          <div
            key={emo.label}
            className="flex items-center justify-between bg-zinc-800 p-4 rounded-2xl"
          >
            <span>{emo.label}</span>
            <span className={`${emo.color} font-bold`}>{emo.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
