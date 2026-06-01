export default function BackendResults({ result }) {
  if (!result) return null

  return (
    <div className="mt-10 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
      <h2 className="text-3xl font-bold text-cyan-400 mb-6">
        Live Backend Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-zinc-800 rounded-2xl p-6">
          <p className="text-gray-400">Emotion Score</p>
          <h3 className="text-4xl font-bold text-cyan-400 mt-2">
            {result.emotion_score}%
          </h3>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-6">
          <p className="text-gray-400">Communication</p>
          <h3 className="text-4xl font-bold text-green-400 mt-2">
            {result.communication_score}%
          </h3>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-6">
          <p className="text-gray-400">Resume Match</p>
          <h3 className="text-4xl font-bold text-yellow-400 mt-2">
            {result.resume_score}%
          </h3>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-6">
          <p className="text-gray-400">Final AI Score</p>
          <h3 className="text-4xl font-bold text-pink-400 mt-2">
            {result.final_score}%
          </h3>
        </div>
      </div>

      <div className="mt-8 bg-zinc-800 rounded-2xl p-6 text-lg text-gray-300 leading-8">
        {result.recommendation}
      </div>
    </div>
  )
}
