export default function UploadCard({
  title,
  icon,
  accept,
  inputId,
  supportedText,
  buttonLabel,
  buttonColor,
  hoverBorderColor,
  loading,
  onChange,
  onButtonClick,
}) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl">
      <h2 className={`text-2xl font-semibold mb-4 ${buttonColor}`}>
        {title}
      </h2>

      <div
        className={`border-2 border-dashed border-zinc-700 rounded-2xl p-10 text-center ${hoverBorderColor} transition-all duration-300`}
      >
        <input
          type="file"
          className="hidden"
          id={inputId}
          accept={accept}
          onChange={onChange}
        />
        <label htmlFor={inputId} className="cursor-pointer">
          <div className="text-6xl mb-4">{icon}</div>
          <p className="text-lg font-medium">Click to Upload</p>
          <p className="text-sm text-gray-500 mt-2">{supportedText}</p>
        </label>
      </div>

      <button
        onClick={onButtonClick}
        className={`w-full mt-6 py-3 rounded-2xl ${
          buttonColor === "text-cyan-400"
            ? "bg-cyan-500 hover:bg-cyan-600"
            : "bg-purple-500 hover:bg-purple-600"
        } transition-all text-lg font-semibold shadow-lg`}
      >
        {loading ? "Analyzing..." : buttonLabel}
      </button>
    </div>
  )
}
