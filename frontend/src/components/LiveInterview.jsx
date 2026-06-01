import { useState } from "react";

export default function LiveInterview({ onStartLive }) {
  const [isActive, setIsActive] = useState(false);

  const handleStartInterview = () => {
    setIsActive(true);
    onStartLive?.();
  };

  const handleEndInterview = () => {
    setIsActive(false);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-red-400">Live Interview</h2>

      <div className="space-y-4">
        <div className="bg-black rounded-2xl p-6 border border-red-500 border-opacity-30">
          <div className="text-center">
            <div className="text-6xl mb-4">🎙️</div>
            <p className="text-lg font-medium text-gray-300 mb-2">
              {isActive ? "Interview in Progress..." : "Start Real-Time Interview"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {isActive
                ? "Your responses are being analyzed in real-time"
                : "Enable camera and microphone for live analysis"}
            </p>
          </div>

          {isActive && (
            <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">92%</div>
                <p className="text-xs text-gray-400 mt-1">Emotion Detected</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">87%</div>
                <p className="text-xs text-gray-400 mt-1">Speech Clarity</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">89%</div>
                <p className="text-xs text-gray-400 mt-1">Confidence</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!isActive ? (
              <>
                <button
                  onClick={handleStartInterview}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all text-lg font-semibold shadow-lg"
                >
                  🔴 Start Live Interview
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEndInterview}
                  className="flex-1 py-3 rounded-2xl bg-gray-600 hover:bg-gray-700 transition-all text-lg font-semibold shadow-lg"
                >
                  ⏹️ End Interview
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-300">Requirements:</span>
          </div>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>✓ Camera access enabled</li>
            <li>✓ Microphone access enabled</li>
            <li>✓ Stable internet connection</li>
            <li>✓ Quiet environment recommended</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
