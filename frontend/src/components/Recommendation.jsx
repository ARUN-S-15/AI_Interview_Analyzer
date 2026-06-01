const DEFAULT_TEXT =
  "The candidate demonstrated strong emotional stability and clear communication skills throughout the interview. Resume alignment with the job description is excellent. Minor nervousness was detected during technical questioning, but overall performance indicates a highly suitable candidate."

export default function Recommendation({ text = DEFAULT_TEXT, onRunAnalysis }) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      <h2 className="text-2xl font-semibold mb-6 text-purple-400">
        AI Recommendation
      </h2>

      <div className="bg-zinc-800 rounded-2xl p-6 leading-8 text-gray-300 text-lg">
        {text}
      </div>

      <button
        onClick={onRunAnalysis}
        className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold text-lg hover:opacity-90 transition-all"
      >
        Run Complete AI Analysis
      </button>
    </div>
  )
}
