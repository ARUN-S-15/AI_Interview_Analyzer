export default function ScoreCard({ label, value, color, barColor }) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
      <p className="text-gray-400 mb-2">{label}</p>
      <h3 className={`text-4xl font-bold ${color}`}>{value}%</h3>
      <div className="w-full bg-zinc-700 h-3 rounded-full mt-4 overflow-hidden">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
